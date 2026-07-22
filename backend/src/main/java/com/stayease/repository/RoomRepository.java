package com.stayease.repository;

import com.stayease.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RoomRepository extends MongoRepository<Room, String> {

    List<Room> findByHotelId(String hotelId);

    List<Room> findByHotelIdAndActiveTrue(String hotelId);

    void deleteByHotelId(String hotelId);

    long countByHotelId(String hotelId);
}
