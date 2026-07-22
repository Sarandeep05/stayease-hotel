package com.stayease.dto.response;

import com.stayease.model.Review;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ReviewResponse {
    private String id;
    private String hotelId;
    private String customerId;
    private String customerName;
    private int rating;
    private String title;
    private String comment;
    private Instant createdAt;

    public static ReviewResponse from(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .hotelId(r.getHotelId())
                .customerId(r.getCustomerId())
                .customerName(r.getCustomerName())
                .rating(r.getRating())
                .title(r.getTitle())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
