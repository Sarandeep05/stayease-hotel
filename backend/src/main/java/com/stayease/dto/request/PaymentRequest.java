package com.stayease.dto.request;

import com.stayease.model.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {

    @NotBlank(message = "Booking id is required")
    private String bookingId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod method;

    /** Mock card fields — not stored, only used to simulate a gateway call. */
    private String cardNumber;
    private String cardHolder;
    private String expiry;
    private String cvv;
}
