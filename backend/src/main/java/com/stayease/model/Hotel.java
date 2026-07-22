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
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "hotels")
public class Hotel {

    @Id
    private String id;

    private String name;
    private String description;

    /** Owner (Hotel Manager) user id. */
    @Indexed
    private String managerId;

    // --- Location ---
    private String address;
    @Indexed
    private String city;
    private String country;
    private Double latitude;
    private Double longitude;

    private Integer starRating;      // 1..5 official star rating

    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @Builder.Default
    private List<String> images = new ArrayList<>();

    private String policies;         // check-in/out, cancellation, etc.
    private String checkInTime;
    private String checkOutTime;

    @Builder.Default
    private HotelStatus status = HotelStatus.ACTIVE;

    /** Denormalized review aggregates for fast search/sort. */
    @Builder.Default
    private double averageRating = 0.0;
    @Builder.Default
    private int reviewCount = 0;

    /** Denormalized lowest room price for search sorting. */
    private Double startingPrice;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
