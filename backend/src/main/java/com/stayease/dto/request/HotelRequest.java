package com.stayease.dto.request;

import com.stayease.model.HotelStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class HotelRequest {

    @NotBlank(message = "Hotel name is required")
    private String name;

    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String country;
    private Double latitude;
    private Double longitude;

    @Min(1) @Max(5)
    private Integer starRating;

    private List<String> amenities;
    private List<String> images;
    private String policies;
    private String checkInTime;
    private String checkOutTime;

    private HotelStatus status;
}
