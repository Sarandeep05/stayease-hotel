package com.stayease.service;

import com.stayease.dto.request.RoomRequest;
import com.stayease.dto.response.RoomResponse;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.model.Booking;
import com.stayease.model.BookingStatus;
import com.stayease.model.Hotel;
import com.stayease.model.Room;
import com.stayease.repository.BookingRepository;
import com.stayease.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final HotelService hotelService;

    private static final List<BookingStatus> ACTIVE_STATUSES =
            List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

    public List<RoomResponse> getRoomsByHotel(String hotelId) {
        return roomRepository.findByHotelId(hotelId).stream().map(RoomResponse::from).toList();
    }

    public RoomResponse getById(String id) {
        return RoomResponse.from(findRoom(id));
    }

    public RoomResponse create(String hotelId, RoomRequest request) {
        Hotel hotel = hotelService.findHotel(hotelId);
        hotelService.assertOwnerOrAdmin(hotel);

        Room room = Room.builder()
                .hotelId(hotelId)
                .name(request.getName())
                .type(request.getType())
                .description(request.getDescription())
                .pricePerNight(request.getPricePerNight())
                .capacity(request.getCapacity())
                .bedCount(request.getBedCount())
                .totalUnits(request.getTotalUnits())
                .amenities(request.getAmenities() == null ? new ArrayList<>() : request.getAmenities())
                .images(request.getImages() == null ? new ArrayList<>() : request.getImages())
                .active(request.getActive() == null || request.getActive())
                .build();

        room = roomRepository.save(room);
        hotelService.recomputeStartingPrice(hotelId);
        return RoomResponse.from(room);
    }

    public RoomResponse update(String roomId, RoomRequest request) {
        Room room = findRoom(roomId);
        Hotel hotel = hotelService.findHotel(room.getHotelId());
        hotelService.assertOwnerOrAdmin(hotel);

        room.setName(request.getName());
        room.setType(request.getType());
        room.setDescription(request.getDescription());
        room.setPricePerNight(request.getPricePerNight());
        room.setCapacity(request.getCapacity());
        room.setBedCount(request.getBedCount());
        room.setTotalUnits(request.getTotalUnits());
        if (request.getAmenities() != null) room.setAmenities(request.getAmenities());
        if (request.getImages() != null) room.setImages(request.getImages());
        if (request.getActive() != null) room.setActive(request.getActive());

        room = roomRepository.save(room);
        hotelService.recomputeStartingPrice(room.getHotelId());
        return RoomResponse.from(room);
    }

    public void delete(String roomId) {
        Room room = findRoom(roomId);
        Hotel hotel = hotelService.findHotel(room.getHotelId());
        hotelService.assertOwnerOrAdmin(hotel);
        roomRepository.delete(room);
        hotelService.recomputeStartingPrice(room.getHotelId());
    }

    /**
     * How many units of a room are free for the given date range.
     */
    public int availableUnits(Room room, LocalDate checkIn, LocalDate checkOut) {
        List<Booking> overlapping = bookingRepository
                .findByRoomIdAndStatusInAndCheckInLessThanAndCheckOutGreaterThan(
                        room.getId(), ACTIVE_STATUSES, checkOut, checkIn);
        int booked = overlapping.stream()
                .mapToInt(b -> b.getNumberOfRooms() == null ? 1 : b.getNumberOfRooms())
                .sum();
        return Math.max(0, room.getTotalUnits() - booked);
    }

    public RoomResponse checkAvailability(String roomId, LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null || !checkOut.isAfter(checkIn)) {
            throw new BadRequestException("check-out must be after check-in");
        }
        Room room = findRoom(roomId);
        RoomResponse response = RoomResponse.from(room);
        response.setAvailableUnits(availableUnits(room, checkIn, checkOut));
        return response;
    }

    public Room findRoom(String id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));
    }
}
