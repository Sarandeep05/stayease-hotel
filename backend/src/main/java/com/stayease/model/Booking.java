package com.stayease.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    /** Human-friendly reference, e.g. "STAY-A1B2C3". */
    @Indexed(unique = true)
    private String reference;

    @Indexed
    private String customerId;

    @Indexed
    private String hotelId;

    @Indexed
    private String roomId;

    /** Denormalized for convenient listing/emails. */
    private String hotelName;
    private String roomName;
    private String customerName;

    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer numberOfRooms;
    private Integer numberOfGuests;
    private Integer nights;

    private Double pricePerNight;
    private Double totalPrice;

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private String paymentId;
    private String specialRequests;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
