package com.stayease.controller;

import com.stayease.dto.request.PaymentRequest;
import com.stayease.dto.response.PaymentResponse;
import com.stayease.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Booking payments and transaction records")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Pay for a booking (simulated gateway)")
    public ResponseEntity<PaymentResponse> pay(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.pay(request));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get the payment record for a booking")
    public ResponseEntity<PaymentResponse> byBooking(@PathVariable String bookingId) {
        return ResponseEntity.ok(paymentService.getByBooking(bookingId));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<PaymentResponse>> myPayments() {
        return ResponseEntity.ok(paymentService.getMyPayments());
    }
}
