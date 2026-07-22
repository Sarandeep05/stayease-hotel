package com.stayease.service;

import com.stayease.dto.request.PaymentRequest;
import com.stayease.dto.response.PaymentResponse;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.model.*;
import com.stayease.repository.PaymentRepository;
import com.stayease.repository.UserRepository;
import com.stayease.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Simulated payment gateway. In production replace {@link #simulateGateway}
 * with a real integration (Stripe/Razorpay). Records are persisted regardless.
 */
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final BookingService bookingService;
    private final NotificationService notificationService;

    public PaymentResponse pay(PaymentRequest request) {
        String customerId = SecurityUtils.currentUserId();
        Booking booking = bookingService.findBooking(request.getBookingId());

        if (!booking.getCustomerId().equals(customerId)) {
            throw new ForbiddenException("You cannot pay for another customer's booking");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot pay for a cancelled booking");
        }
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("This booking is already paid");
        }

        boolean success = simulateGateway(request);

        Payment payment = paymentRepository.findByBookingId(booking.getId())
                .orElse(Payment.builder()
                        .bookingId(booking.getId())
                        .customerId(customerId)
                        .build());

        payment.setAmount(booking.getTotalPrice());
        payment.setCurrency("USD");
        payment.setMethod(request.getMethod());
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());

        if (success) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setFailureReason(null);
            booking.setPaymentStatus(PaymentStatus.PAID);
            booking.setStatus(BookingStatus.CONFIRMED);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Payment declined by gateway (simulated)");
            booking.setPaymentStatus(PaymentStatus.FAILED);
        }

        payment = paymentRepository.save(payment);
        booking.setPaymentId(payment.getId());
        bookingService.save(booking);

        if (success) {
            userRepository.findById(customerId).ifPresent(u -> {
                notificationService.notifyPaymentReceived(u.getEmail(), u.getPhone(),
                        booking.getReference(), booking.getTotalPrice());
                notificationService.notifyBookingConfirmed(u.getEmail(), u.getPhone(),
                        booking.getReference(), booking.getHotelName());
            });
        }

        if (!success) {
            throw new BadRequestException("Payment failed. Please try a different method.");
        }
        return PaymentResponse.from(payment);
    }

    public PaymentResponse getByBooking(String bookingId) {
        // Ensures the caller is allowed to see the booking.
        bookingService.getById(bookingId);
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "bookingId", bookingId));
        return PaymentResponse.from(payment);
    }

    public List<PaymentResponse> getMyPayments() {
        String customerId = SecurityUtils.currentUserId();
        return paymentRepository.findByCustomerId(customerId).stream()
                .map(PaymentResponse::from).toList();
    }

    /**
     * Mock gateway: succeeds unless the (test) card number ends with "0000".
     */
    private boolean simulateGateway(PaymentRequest request) {
        String card = request.getCardNumber();
        if (card != null && card.replaceAll("\\s", "").endsWith("0000")) {
            return false;
        }
        return true;
    }
}
