package com.stayease.repository;

import com.stayease.model.Payment;
import com.stayease.model.PaymentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends MongoRepository<Payment, String> {

    Optional<Payment> findByBookingId(String bookingId);

    List<Payment> findByCustomerId(String customerId);

    List<Payment> findByStatus(PaymentStatus status);
}
