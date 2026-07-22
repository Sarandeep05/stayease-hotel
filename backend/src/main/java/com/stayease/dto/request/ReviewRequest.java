package com.stayease.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {

    @NotBlank(message = "Hotel id is required")
    private String hotelId;

    @NotNull @Min(1) @Max(5)
    private Integer rating;

    private String title;

    @NotBlank(message = "Comment is required")
    private String comment;
}
