package com.stayease.repository;

import com.stayease.model.Hotel;
import com.stayease.model.HotelStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface HotelRepository extends MongoRepository<Hotel, String> {

    List<Hotel> findByManagerId(String managerId);

    Page<Hotel> findByStatus(HotelStatus status, Pageable pageable);

    long countByManagerId(String managerId);

    long countByStatus(HotelStatus status);
}
