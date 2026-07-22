package com.stayease.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
@CompoundIndex(name = "uniq_hotel_customer", def = "{'hotelId': 1, 'customerId': 1}", unique = true)
public class Review {

    @Id
    private String id;

    @Indexed
    private String hotelId;

    @Indexed
    private String customerId;

    private String customerName;
    private String bookingId;

    private int rating;              // 1..5
    private String title;
    private String comment;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
