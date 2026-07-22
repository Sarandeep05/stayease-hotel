package com.stayease.dto.response;

import com.stayease.model.Room;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RoomResponse {
    private String id;
    private String hotelId;
    private String name;
    private String type;
    private String description;
    private Double pricePerNight;
    private Integer capacity;
    private Integer bedCount;
    private Integer totalUnits;
    private List<String> amenities;
    private List<String> images;
    private boolean active;

    /** Populated by availability checks; null when not requested. */
    private Integer availableUnits;

    public static RoomResponse from(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .hotelId(room.getHotelId())
                .name(room.getName())
                .type(room.getType())
                .description(room.getDescription())
                .pricePerNight(room.getPricePerNight())
                .capacity(room.getCapacity())
                .bedCount(room.getBedCount())
                .totalUnits(room.getTotalUnits())
                .amenities(room.getAmenities())
                .images(room.getImages())
                .active(room.isActive())
                .build();
    }
}
