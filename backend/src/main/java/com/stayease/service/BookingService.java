package com.stayease.service;

import com.stayease.dto.request.BookingRequest;
import com.stayease.dto.response.BookingResponse;
import com.stayease.dto.response.PagedResponse;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.model.*;
import com.stayease.repository.BookingRepository;
import com.stayease.repository.HotelRepository;
import com.stayease.repository.UserRepository;
import com.stayease.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final RoomService roomService;
    private final NotificationService notificationService;

    public BookingResponse create(BookingRequest request) {
        String customerId = SecurityUtils.currentUserId();

        LocalDate checkIn = request.getCheckIn();
        LocalDate checkOut = request.getCheckOut();
        if (checkIn == null || checkOut == null || !checkOut.isAfter(checkIn)) {
            throw new BadRequestException("Check-out date must be after check-in date");
        }
        if (checkIn.isBefore(LocalDate.now())) {
            throw new BadRequestException("Check-in date cannot be in the past");
        }

        Room room = roomService.findRoom(request.getRoomId());
        if (!room.isActive()) {
            throw new BadRequestException("This room is not available for booking");
        }

        int requested = request.getNumberOfRooms();
        int available = roomService.availableUnits(room, checkIn, checkOut);
        if (requested > available) {
            throw new BadRequestException(
                    "Only " + available + " room(s) available for the selected dates");
        }

        int capacity = room.getCapacity() == null ? 1 : room.getCapacity();
        if (request.getNumberOfGuests() > capacity * requested) {
            throw new BadRequestException(
                    "Guest count exceeds capacity for the selected rooms");
        }

        Hotel hotel = hotelRepository.findById(room.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", room.getHotelId()));
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        int nights = (int) ChronoUnit.DAYS.between(checkIn, checkOut);
        double total = nights * room.getPricePerNight() * requested;

        Booking booking = Booking.builder()
                .reference(generateReference())
                .customerId(customerId)
                .customerName(customer.getFullName())
                .hotelId(hotel.getId())
                .hotelName(hotel.getName())
                .roomId(room.getId())
                .roomName(room.getName())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(requested)
                .numberOfGuests(request.getNumberOfGuests())
                .nights(nights)
                .pricePerNight(room.getPricePerNight())
                .totalPrice(total)
                .status(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .specialRequests(request.getSpecialRequests())
                .build();

        booking = bookingRepository.save(booking);

        notificationService.sendEmail(customer.getEmail(), "StayEase — Booking Received",
                "Your booking " + booking.getReference() + " at " + hotel.getName()
                        + " is pending payment. Total: " + total);

        return BookingResponse.from(booking);
    }

    public BookingResponse getById(String id) {
        Booking booking = findBooking(id);
        assertCanView(booking);
        return BookingResponse.from(booking);
    }

    public PagedResponse<BookingResponse> getMyBookings(int page, int size) {
        String customerId = SecurityUtils.currentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Booking> bookings = bookingRepository.findByCustomerId(customerId, pageable);
        return PagedResponse.from(bookings, BookingResponse::from);
    }

    /** Bookings across all hotels owned by the current manager. */
    public PagedResponse<BookingResponse> getManagerBookings(int page, int size) {
        String managerId = SecurityUtils.currentUserId();
        List<String> hotelIds = hotelRepository.findByManagerId(managerId).stream()
                .map(Hotel::getId).toList();
        if (hotelIds.isEmpty()) {
            return new PagedResponse<>(List.of(), page, size, 0, 0, true);
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Booking> bookings = bookingRepository.findByHotelIdIn(hotelIds, pageable);
        return PagedResponse.from(bookings, BookingResponse::from);
    }

    public BookingResponse cancel(String id) {
        Booking booking = findBooking(id);
        assertCanView(booking);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Completed bookings cannot be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
        }
        booking = bookingRepository.save(booking);

        userRepository.findById(booking.getCustomerId()).ifPresent(u ->
                notificationService.notifyBookingCancelled(u.getEmail(), u.getPhone(), booking.getReference()));

        return BookingResponse.from(booking);
    }

    /** Manager/admin can mark a confirmed booking as completed after checkout. */
    public BookingResponse complete(String id) {
        Booking booking = findBooking(id);
        assertManagerOfHotelOrAdmin(booking.getHotelId());
        booking.setStatus(BookingStatus.COMPLETED);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    // --- Internal helpers used by PaymentService ---

    public Booking findBooking(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
    }

    public Booking save(Booking booking) {
        return bookingRepository.save(booking);
    }

    private void assertCanView(Booking booking) {
        String userId = SecurityUtils.currentUserId();
        boolean admin = SecurityUtils.hasRole("ADMIN");
        boolean owner = booking.getCustomerId().equals(userId);
        boolean manager = false;
        if (SecurityUtils.hasRole("HOTEL_MANAGER")) {
            manager = hotelRepository.findById(booking.getHotelId())
                    .map(h -> userId.equals(h.getManagerId())).orElse(false);
        }
        if (!admin && !owner && !manager) {
            throw new ForbiddenException("You cannot access this booking");
        }
    }

    private void assertManagerOfHotelOrAdmin(String hotelId) {
        String userId = SecurityUtils.currentUserId();
        if (SecurityUtils.hasRole("ADMIN")) return;
        boolean manager = hotelRepository.findById(hotelId)
                .map(h -> userId.equals(h.getManagerId())).orElse(false);
        if (!manager) {
            throw new ForbiddenException("You cannot manage this booking");
        }
    }

    private String generateReference() {
        return "STAY-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
