package com.stayease.repository;

import com.stayease.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, String> {

    Page<Review> findByHotelId(String hotelId, Pageable pageable);

    List<Review> findByHotelId(String hotelId);

    Optional<Review> findByHotelIdAndCustomerId(String hotelId, String customerId);

    boolean existsByHotelIdAndCustomerId(String hotelId, String customerId);
}
