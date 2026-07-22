package com.stayease.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class HotelSearchRequest {
    private String destination;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer guests;
    private Double minPrice;
    private Double maxPrice;
    private Double minRating;
    private Integer starRating;
    private List<String> amenities;

    /** priceAsc | priceDesc | ratingDesc | newest */
    private String sortBy;

    private Integer page = 0;
    private Integer size = 12;
}
