package com.stayease.service;

import com.stayease.dto.request.HotelRequest;
import com.stayease.dto.request.HotelSearchRequest;
import com.stayease.dto.response.HotelResponse;
import com.stayease.dto.response.PagedResponse;
import com.stayease.dto.response.RoomResponse;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.model.Hotel;
import com.stayease.model.HotelStatus;
import com.stayease.model.Review;
import com.stayease.model.Room;
import com.stayease.repository.HotelRepository;
import com.stayease.repository.HotelSearchRepository;
import com.stayease.repository.ReviewRepository;
import com.stayease.repository.RoomRepository;
import com.stayease.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final ReviewRepository reviewRepository;
    private final HotelSearchRepository hotelSearchRepository;

    // --- Public read ---

    public PagedResponse<HotelResponse> search(HotelSearchRequest request) {
        Pageable pageable = PageRequest.of(
                Optional.ofNullable(request.getPage()).orElse(0),
                Optional.ofNullable(request.getSize()).orElse(12));
        Page<Hotel> page = hotelSearchRepository.search(request, pageable);
        return PagedResponse.from(page, HotelResponse::from);
    }

    public HotelResponse getById(String id) {
        Hotel hotel = findHotel(id);
        HotelResponse response = HotelResponse.from(hotel);
        List<RoomResponse> rooms = roomRepository.findByHotelIdAndActiveTrue(id).stream()
                .map(RoomResponse::from).toList();
        response.setRooms(rooms);
        return response;
    }

    // --- Manager operations ---

    public HotelResponse create(HotelRequest request) {
        String managerId = SecurityUtils.currentUserId();
        Hotel hotel = Hotel.builder()
                .name(request.getName())
                .description(request.getDescription())
                .managerId(managerId)
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .starRating(request.getStarRating())
                .amenities(request.getAmenities() == null ? new ArrayList<>() : request.getAmenities())
                .images(request.getImages() == null ? new ArrayList<>() : request.getImages())
                .policies(request.getPolicies())
                .checkInTime(request.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .status(request.getStatus() == null ? HotelStatus.ACTIVE : request.getStatus())
                .build();
        return HotelResponse.from(hotelRepository.save(hotel));
    }

    public HotelResponse update(String id, HotelRequest request) {
        Hotel hotel = findHotel(id);
        assertOwnerOrAdmin(hotel);

        hotel.setName(request.getName());
        hotel.setDescription(request.getDescription());
        hotel.setAddress(request.getAddress());
        hotel.setCity(request.getCity());
        hotel.setCountry(request.getCountry());
        hotel.setLatitude(request.getLatitude());
        hotel.setLongitude(request.getLongitude());
        hotel.setStarRating(request.getStarRating());
        if (request.getAmenities() != null) hotel.setAmenities(request.getAmenities());
        if (request.getImages() != null) hotel.setImages(request.getImages());
        hotel.setPolicies(request.getPolicies());
        hotel.setCheckInTime(request.getCheckInTime());
        hotel.setCheckOutTime(request.getCheckOutTime());
        if (request.getStatus() != null) hotel.setStatus(request.getStatus());

        return HotelResponse.from(hotelRepository.save(hotel));
    }

    public void delete(String id) {
        Hotel hotel = findHotel(id);
        assertOwnerOrAdmin(hotel);
        roomRepository.deleteByHotelId(id);
        hotelRepository.delete(hotel);
    }

    public List<HotelResponse> getMyHotels() {
        String managerId = SecurityUtils.currentUserId();
        return hotelRepository.findByManagerId(managerId).stream()
                .map(HotelResponse::from).toList();
    }

    // --- Admin ---

    public List<HotelResponse> getAllHotels() {
        return hotelRepository.findAll().stream().map(HotelResponse::from).toList();
    }

    public HotelResponse setStatus(String id, HotelStatus status) {
        Hotel hotel = findHotel(id);
        hotel.setStatus(status);
        return HotelResponse.from(hotelRepository.save(hotel));
    }

    // --- Aggregate recomputation (called by Room/Review services) ---

    public void recomputeStartingPrice(String hotelId) {
        List<Room> rooms = roomRepository.findByHotelIdAndActiveTrue(hotelId);
        Double min = rooms.stream()
                .map(Room::getPricePerNight)
                .filter(java.util.Objects::nonNull)
                .min(Comparator.naturalOrder())
                .orElse(null);
        hotelRepository.findById(hotelId).ifPresent(hotel -> {
            hotel.setStartingPrice(min);
            hotelRepository.save(hotel);
        });
    }

    public void recomputeRating(String hotelId) {
        List<Review> reviews = reviewRepository.findByHotelId(hotelId);
        int count = reviews.size();
        double avg = count == 0 ? 0.0 :
                Math.round(reviews.stream().mapToInt(Review::getRating).average().orElse(0.0) * 10.0) / 10.0;
        hotelRepository.findById(hotelId).ifPresent(hotel -> {
            hotel.setAverageRating(avg);
            hotel.setReviewCount(count);
            hotelRepository.save(hotel);
        });
    }

    // --- Helpers ---

    public Hotel findHotel(String id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
    }

    public void assertOwnerOrAdmin(Hotel hotel) {
        boolean admin = SecurityUtils.hasRole("ADMIN");
        boolean owner = hotel.getManagerId() != null
                && hotel.getManagerId().equals(SecurityUtils.currentUserId());
        if (!admin && !owner) {
            throw new ForbiddenException("You do not have permission to manage this hotel");
        }
    }
}
