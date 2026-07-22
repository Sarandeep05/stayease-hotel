package com.stayease.service;

import com.stayease.dto.response.DashboardResponse;
import com.stayease.model.*;
import com.stayease.repository.*;
import com.stayease.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    // --- Customer ---
    public DashboardResponse customerDashboard() {
        String customerId = SecurityUtils.currentUserId();
        List<Booking> bookings = bookingRepository
                .findByCustomerId(customerId, org.springframework.data.domain.Pageable.unpaged())
                .getContent();

        long upcoming = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED
                        && b.getCheckIn() != null && !b.getCheckIn().isBefore(LocalDate.now()))
                .count();
        double totalSpent = bookings.stream()
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID)
                .mapToDouble(b -> b.getTotalPrice() == null ? 0 : b.getTotalPrice())
                .sum();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBookings", bookings.size());
        stats.put("upcomingStays", upcoming);
        stats.put("completed", bookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count());
        stats.put("totalSpent", round(totalSpent));

        List<Map<String, Object>> recent = bookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(this::bookingRow)
                .collect(Collectors.toList());

        return DashboardResponse.builder().stats(stats).charts(List.of()).recent(recent).build();
    }

    // --- Hotel Manager ---
    public DashboardResponse managerDashboard() {
        String managerId = SecurityUtils.currentUserId();
        List<Hotel> hotels = hotelRepository.findByManagerId(managerId);
        List<String> hotelIds = hotels.stream().map(Hotel::getId).toList();

        List<Booking> bookings = hotelIds.isEmpty() ? List.of()
                : bookingRepository.findAll().stream()
                .filter(b -> hotelIds.contains(b.getHotelId()))
                .toList();

        double revenue = bookings.stream()
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID)
                .mapToDouble(b -> b.getTotalPrice() == null ? 0 : b.getTotalPrice())
                .sum();
        long roomCount = hotelIds.stream().mapToLong(roomRepository::countByHotelId).sum();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalHotels", hotels.size());
        stats.put("totalRooms", roomCount);
        stats.put("totalBookings", bookings.size());
        stats.put("confirmed", bookings.stream().filter(b -> b.getStatus() == BookingStatus.CONFIRMED).count());
        stats.put("revenue", round(revenue));

        List<Map<String, Object>> charts = revenueByMonth(bookings);
        List<Map<String, Object>> recent = bookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8)
                .map(this::bookingRow)
                .collect(Collectors.toList());

        return DashboardResponse.builder().stats(stats).charts(charts).recent(recent).build();
    }

    // --- Admin ---
    public DashboardResponse adminDashboard() {
        List<Booking> bookings = bookingRepository.findAll();
        double revenue = bookings.stream()
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID)
                .mapToDouble(b -> b.getTotalPrice() == null ? 0 : b.getTotalPrice())
                .sum();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("customers", userRepository.countByRolesContaining(Role.CUSTOMER));
        stats.put("managers", userRepository.countByRolesContaining(Role.HOTEL_MANAGER));
        stats.put("totalHotels", hotelRepository.count());
        stats.put("activeHotels", hotelRepository.countByStatus(HotelStatus.ACTIVE));
        stats.put("totalBookings", bookings.size());
        stats.put("totalReviews", reviewRepository.count());
        stats.put("platformRevenue", round(revenue));

        List<Map<String, Object>> charts = revenueByMonth(bookings);

        List<Map<String, Object>> recent = bookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10)
                .map(this::bookingRow)
                .collect(Collectors.toList());

        return DashboardResponse.builder().stats(stats).charts(charts).recent(recent).build();
    }

    // --- Helpers ---

    private List<Map<String, Object>> revenueByMonth(List<Booking> bookings) {
        Map<YearMonth, Double> byMonth = new TreeMap<>();
        // Seed last 6 months with zero so the chart is continuous.
        YearMonth now = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            byMonth.put(now.minusMonths(i), 0.0);
        }
        for (Booking b : bookings) {
            if (b.getPaymentStatus() != PaymentStatus.PAID || b.getCreatedAt() == null) continue;
            YearMonth ym = YearMonth.from(b.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate());
            if (byMonth.containsKey(ym)) {
                byMonth.merge(ym, b.getTotalPrice() == null ? 0 : b.getTotalPrice(), Double::sum);
            }
        }
        return byMonth.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("month", e.getKey().toString());
                    m.put("revenue", round(e.getValue()));
                    return m;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> bookingRow(Booking b) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", b.getId());
        m.put("reference", b.getReference());
        m.put("hotelName", b.getHotelName());
        m.put("customerName", b.getCustomerName());
        m.put("checkIn", b.getCheckIn() == null ? null : b.getCheckIn().toString());
        m.put("checkOut", b.getCheckOut() == null ? null : b.getCheckOut().toString());
        m.put("totalPrice", b.getTotalPrice());
        m.put("status", b.getStatus());
        m.put("paymentStatus", b.getPaymentStatus());
        return m;
    }

    private double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
