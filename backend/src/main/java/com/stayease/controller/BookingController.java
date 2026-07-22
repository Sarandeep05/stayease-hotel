package com.stayease.controller;

import com.stayease.dto.request.BookingRequest;
import com.stayease.dto.response.BookingResponse;
import com.stayease.dto.response.PagedResponse;
import com.stayease.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Create, view, cancel and manage reservations")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Create a new booking (Customer)")
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getById(id));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "List the current customer's bookings")
    public ResponseEntity<PagedResponse<BookingResponse>> myBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(bookingService.getMyBookings(page, size));
    }

    @GetMapping("/manager")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER','ADMIN')")
    @Operation(summary = "List bookings for the manager's hotels")
    public ResponseEntity<PagedResponse<BookingResponse>> managerBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(bookingService.getManagerBookings(page, size));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking (customer/manager/admin)")
    public ResponseEntity<BookingResponse> cancel(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.cancel(id));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER','ADMIN')")
    @Operation(summary = "Mark a booking as completed")
    public ResponseEntity<BookingResponse> complete(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.complete(id));
    }
}
