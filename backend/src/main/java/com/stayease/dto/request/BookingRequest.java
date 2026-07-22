package com.stayease.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {

    @NotBlank(message = "Room id is required")
    private String roomId;

    @NotNull(message = "Check-in date is required")
    private LocalDate checkIn;

    @NotNull(message = "Check-out date is required")
    @Future(message = "Check-out must be in the future")
    private LocalDate checkOut;

    @NotNull @Min(value = 1, message = "At least one room is required")
    private Integer numberOfRooms;

    @NotNull @Min(value = 1, message = "At least one guest is required")
    private Integer numberOfGuests;

    private String specialRequests;
}
