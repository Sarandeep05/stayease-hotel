package com.stayease.repository;

import com.stayease.model.Booking;
import com.stayease.model.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends MongoRepository<Booking, String> {

    Page<Booking> findByCustomerId(String customerId, Pageable pageable);

    Page<Booking> findByHotelIdIn(List<String> hotelIds, Pageable pageable);

    List<Booking> findByHotelId(String hotelId);

    Optional<Booking> findByReference(String reference);

    boolean existsByCustomerIdAndHotelIdAndStatus(String customerId, String hotelId, BookingStatus status);

    /**
     * Overlapping active bookings for a room. Two ranges overlap when
     * existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn.
     */
    List<Booking> findByRoomIdAndStatusInAndCheckInLessThanAndCheckOutGreaterThan(
            String roomId, List<BookingStatus> statuses, LocalDate checkOut, LocalDate checkIn);

    long countByStatus(BookingStatus status);
}
