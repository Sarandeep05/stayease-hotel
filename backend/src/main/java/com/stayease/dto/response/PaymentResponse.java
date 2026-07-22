package com.stayease.dto.response;

import com.stayease.model.Payment;
import com.stayease.model.PaymentMethod;
import com.stayease.model.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PaymentResponse {
    private String id;
    private String bookingId;
    private String customerId;
    private Double amount;
    private String currency;
    private PaymentMethod method;
    private PaymentStatus status;
    private String transactionId;
    private String failureReason;
    private Instant createdAt;

    public static PaymentResponse from(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .bookingId(p.getBookingId())
                .customerId(p.getCustomerId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .method(p.getMethod())
                .status(p.getStatus())
                .transactionId(p.getTransactionId())
                .failureReason(p.getFailureReason())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
