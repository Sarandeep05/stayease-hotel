package com.stayease.dto.response;

import com.stayease.model.Booking;
import com.stayease.model.BookingStatus;
import com.stayease.model.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class BookingResponse {
    private String id;
    private String reference;
    private String customerId;
    private String customerName;
    private String hotelId;
    private String hotelName;
    private String roomId;
    private String roomName;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer numberOfRooms;
    private Integer numberOfGuests;
    private Integer nights;
    private Double pricePerNight;
    private Double totalPrice;
    private BookingStatus status;
    private PaymentStatus paymentStatus;
    private String paymentId;
    private String specialRequests;
    private Instant createdAt;

    public static BookingResponse from(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .reference(b.getReference())
                .customerId(b.getCustomerId())
                .customerName(b.getCustomerName())
                .hotelId(b.getHotelId())
                .hotelName(b.getHotelName())
                .roomId(b.getRoomId())
                .roomName(b.getRoomName())
                .checkIn(b.getCheckIn())
                .checkOut(b.getCheckOut())
                .numberOfRooms(b.getNumberOfRooms())
                .numberOfGuests(b.getNumberOfGuests())
                .nights(b.getNights())
                .pricePerNight(b.getPricePerNight())
                .totalPrice(b.getTotalPrice())
                .status(b.getStatus())
                .paymentStatus(b.getPaymentStatus())
                .paymentId(b.getPaymentId())
                .specialRequests(b.getSpecialRequests())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
