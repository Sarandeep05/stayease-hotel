package com.stayease.dto.response;

import com.stayease.model.Hotel;
import com.stayease.model.HotelStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HotelResponse {
    private String id;
    private String name;
    private String description;
    private String managerId;
    private String address;
    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
    private Integer starRating;
    private List<String> amenities;
    private List<String> images;
    private String policies;
    private String checkInTime;
    private String checkOutTime;
    private HotelStatus status;
    private double averageRating;
    private int reviewCount;
    private Double startingPrice;

    /** Optional nested rooms (hotel detail view). */
    private List<RoomResponse> rooms;

    public static HotelResponse from(Hotel hotel) {
        return HotelResponse.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .description(hotel.getDescription())
                .managerId(hotel.getManagerId())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .country(hotel.getCountry())
                .latitude(hotel.getLatitude())
                .longitude(hotel.getLongitude())
                .starRating(hotel.getStarRating())
                .amenities(hotel.getAmenities())
                .images(hotel.getImages())
                .policies(hotel.getPolicies())
                .checkInTime(hotel.getCheckInTime())
                .checkOutTime(hotel.getCheckOutTime())
                .status(hotel.getStatus())
                .averageRating(hotel.getAverageRating())
                .reviewCount(hotel.getReviewCount())
                .startingPrice(hotel.getStartingPrice())
                .build();
    }
}
