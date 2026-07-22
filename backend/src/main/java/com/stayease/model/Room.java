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
@Document(collection = "rooms")
public class Room {

    @Id
    private String id;

    @Indexed
    private String hotelId;

    private String name;             // e.g. "Deluxe King Room"
    private String type;             // SINGLE, DOUBLE, SUITE, ...
    private String description;

    private Double pricePerNight;
    private Integer capacity;        // max guests
    private Integer bedCount;

    /** Total physical rooms of this type available for booking. */
    private Integer totalUnits;

    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
