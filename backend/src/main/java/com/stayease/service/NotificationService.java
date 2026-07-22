package com.stayease.service;

import com.stayease.config.AppProperties;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Sends email (SMTP) and SMS (Twilio) notifications. Both channels are guarded
 * by feature flags so the app runs cleanly in local/dev without credentials —
 * messages are logged instead of sent when a channel is disabled.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final AppProperties appProperties;
    private final JavaMailSender mailSender;

    @Async
    public void sendEmail(String to, String subject, String body) {
        if (!appProperties.getMail().isEnabled() || !StringUtils.hasText(to)) {
            log.info("[EMAIL disabled] to={}, subject={}\n{}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(appProperties.getMail().getFrom());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to {}", to);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }

    @Async
    public void sendSms(String toNumber, String body) {
        AppProperties.Twilio twilio = appProperties.getTwilio();
        if (!twilio.isEnabled() || !StringUtils.hasText(toNumber)) {
            log.info("[SMS disabled] to={}, body={}", toNumber, body);
            return;
        }
        try {
            Twilio.init(twilio.getAccountSid(), twilio.getAuthToken());
            Message.creator(new PhoneNumber(toNumber),
                    new PhoneNumber(twilio.getFromNumber()), body).create();
            log.info("SMS sent to {}", toNumber);
        } catch (Exception ex) {
            log.error("Failed to send SMS to {}: {}", toNumber, ex.getMessage());
        }
    }

    // --- Convenience helpers for domain events ---

    public void notifyBookingConfirmed(String email, String phone, String reference, String hotelName) {
        String subject = "StayEase — Booking Confirmed (" + reference + ")";
        String body = "Your booking at " + hotelName + " is confirmed. Reference: " + reference;
        sendEmail(email, subject, body);
        sendSms(phone, body);
    }

    public void notifyBookingCancelled(String email, String phone, String reference) {
        String subject = "StayEase — Booking Cancelled (" + reference + ")";
        String body = "Your booking " + reference + " has been cancelled.";
        sendEmail(email, subject, body);
        sendSms(phone, body);
    }

    public void notifyPaymentReceived(String email, String phone, String reference, double amount) {
        String body = "Payment of " + amount + " received for booking " + reference + ". Thank you!";
        sendEmail(email, "StayEase — Payment Received", body);
        sendSms(phone, body);
    }

    public void sendPasswordResetLink(String email, String resetToken) {
        String body = "Use this token to reset your StayEase password: " + resetToken
                + "\nThis token expires in 30 minutes.";
        sendEmail(email, "StayEase — Password Reset", body);
    }
}
