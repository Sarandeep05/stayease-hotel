package com.stayease.controller;

import com.stayease.dto.request.ReviewRequest;
import com.stayease.dto.response.PagedResponse;
import com.stayease.dto.response.ReviewResponse;
import com.stayease.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Hotel ratings and reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/hotel/{hotelId}")
    @Operation(summary = "List reviews for a hotel (public)")
    public ResponseEntity<PagedResponse<ReviewResponse>> byHotel(
            @PathVariable String hotelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getHotelReviews(hotelId, page, size));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Submit a review (must have a booking at the hotel)")
    public ResponseEntity<ReviewResponse> create(@Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> update(@PathVariable String id,
                                                 @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        reviewService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
