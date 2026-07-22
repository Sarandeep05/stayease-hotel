package com.stayease.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class RoomRequest {

    @NotBlank(message = "Room name is required")
    private String name;

    @NotBlank(message = "Room type is required")
    private String type;

    private String description;

    @NotNull(message = "Price per night is required")
    @Positive(message = "Price must be positive")
    private Double pricePerNight;

    @NotNull @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private Integer bedCount;

    @NotNull @Min(value = 1, message = "Total units must be at least 1")
    private Integer totalUnits;

    private List<String> amenities;
    private List<String> images;
    private Boolean active;
}
