package com.stayease.config;

import com.stayease.model.*;
import com.stayease.repository.HotelRepository;
import com.stayease.repository.RoomRepository;
import com.stayease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

/**
 * Seeds demo accounts and catalogue data on first startup. Controlled by
 * {@code app.seed.enabled}. Idempotent — skips if an admin already exists.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AppProperties appProperties;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!appProperties.getSeed().isEnabled()) {
            return;
        }
        if (userRepository.existsByEmail("admin@stayease.com")) {
            log.info("Seed data already present — skipping.");
            return;
        }

        log.info("Seeding demo data...");

        User admin = save("Platform Admin", "admin@stayease.com", "Admin@123", Role.ADMIN, "+10000000001");
        User manager = save("Maria Manager", "manager@stayease.com", "Manager@123", Role.HOTEL_MANAGER, "+10000000002");
        save("Charlie Customer", "customer@stayease.com", "Customer@123", Role.CUSTOMER, "+10000000003");

        seedHotel(manager.getId(), "The Grand Marina", "Mumbai", "India", 5,
                "Beachfront luxury with panoramic sea views.",
                List.of("WiFi", "Pool", "Spa", "Gym", "Restaurant", "Parking"),
                List.of("https://images.unsplash.com/photo-1566073771259-6a8506099945"),
                new String[][]{
                        {"Deluxe Sea View", "DELUXE", "180", "2", "5"},
                        {"Executive Suite", "SUITE", "320", "4", "3"},
                        {"Standard Room", "STANDARD", "110", "2", "8"}
                });

        seedHotel(manager.getId(), "Urban Nest Hotel", "Bengaluru", "India", 4,
                "Modern business hotel in the heart of the tech district.",
                List.of("WiFi", "Gym", "Restaurant", "Business Center", "Parking"),
                List.of("https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"),
                new String[][]{
                        {"Business King", "DELUXE", "140", "2", "6"},
                        {"Twin Room", "STANDARD", "95", "2", "10"}
                });

        seedHotel(manager.getId(), "Alpine Retreat", "Manali", "India", 4,
                "Cozy mountain lodge surrounded by pine forests.",
                List.of("WiFi", "Fireplace", "Restaurant", "Parking", "Pet Friendly"),
                List.of("https://images.unsplash.com/photo-1470770841072-f978cf4d019e"),
                new String[][]{
                        {"Mountain View Suite", "SUITE", "210", "3", "4"},
                        {"Cabin Room", "STANDARD", "130", "2", "6"}
                });

        log.info("Seed complete. Logins -> admin@stayease.com / Admin@123, "
                + "manager@stayease.com / Manager@123, customer@stayease.com / Customer@123");
    }

    private User save(String name, String email, String rawPassword, Role role, String phone) {
        User user = User.builder()
                .fullName(name)
                .email(email)
                .phone(phone)
                .password(passwordEncoder.encode(rawPassword))
                .roles(Set.of(role))
                .enabled(true)
                .build();
        return userRepository.save(user);
    }

    private void seedHotel(String managerId, String name, String city, String country, int stars,
                           String description, List<String> amenities, List<String> images,
                           String[][] rooms) {
        Hotel hotel = Hotel.builder()
                .name(name)
                .description(description)
                .managerId(managerId)
                .address(name + ", " + city)
                .city(city)
                .country(country)
                .starRating(stars)
                .amenities(amenities)
                .images(images)
                .policies("Check-in 2 PM, Check-out 11 AM. Free cancellation up to 24h before arrival.")
                .checkInTime("14:00")
                .checkOutTime("11:00")
                .status(HotelStatus.ACTIVE)
                .build();
        hotel = hotelRepository.save(hotel);

        double minPrice = Double.MAX_VALUE;
        for (String[] r : rooms) {
            double price = Double.parseDouble(r[2]);
            minPrice = Math.min(minPrice, price);
            Room room = Room.builder()
                    .hotelId(hotel.getId())
                    .name(r[0])
                    .type(r[1])
                    .description(r[0] + " at " + name)
                    .pricePerNight(price)
                    .capacity(Integer.parseInt(r[3]))
                    .bedCount(Integer.parseInt(r[3]) > 2 ? 2 : 1)
                    .totalUnits(Integer.parseInt(r[4]))
                    .amenities(List.of("WiFi", "Air Conditioning", "TV"))
                    .images(images)
                    .active(true)
                    .build();
            roomRepository.save(room);
        }
        hotel.setStartingPrice(minPrice == Double.MAX_VALUE ? null : minPrice);
        hotelRepository.save(hotel);
    }
}
