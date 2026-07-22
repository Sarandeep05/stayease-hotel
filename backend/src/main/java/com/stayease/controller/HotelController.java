package com.stayease.controller;

import com.stayease.dto.request.HotelRequest;
import com.stayease.dto.request.HotelSearchRequest;
import com.stayease.dto.response.HotelResponse;
import com.stayease.dto.response.PagedResponse;
import com.stayease.model.HotelStatus;
import com.stayease.service.HotelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@Tag(name = "Hotels", description = "Hotel search, discovery and management")
public class HotelController {

    private final HotelService hotelService;

    // --- Public ---

    @GetMapping
    @Operation(summary = "Search & filter hotels (public)")
    public ResponseEntity<PagedResponse<HotelResponse>> search(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Integer starRating,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        HotelSearchRequest request = new HotelSearchRequest();
        request.setDestination(destination);
        request.setMinPrice(minPrice);
        request.setMaxPrice(maxPrice);
        request.setMinRating(minRating);
        request.setStarRating(starRating);
        request.setAmenities(amenities);
        request.setSortBy(sortBy);
        request.setPage(page);
        request.setSize(size);

        return ResponseEntity.ok(hotelService.search(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get hotel detail with rooms (public)")
    public ResponseEntity<HotelResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(hotelService.getById(id));
    }

    // --- Manager ---

    @PostMapping
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER','ADMIN')")
    public ResponseEntity<HotelResponse> create(@Valid @RequestBody HotelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hotelService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER','ADMIN')")
    public ResponseEntity<HotelResponse> update(@PathVariable String id,
                                                @Valid @RequestBody HotelRequest request) {
        return ResponseEntity.ok(hotelService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        hotelService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/manager/mine")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER','ADMIN')")
    public ResponseEntity<List<HotelResponse>> myHotels() {
        return ResponseEntity.ok(hotelService.getMyHotels());
    }

    // --- Admin ---

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<HotelResponse>> allHotels() {
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HotelResponse> setStatus(@PathVariable String id,
                                                   @RequestParam HotelStatus status) {
        return ResponseEntity.ok(hotelService.setStatus(id, status));
    }
}
