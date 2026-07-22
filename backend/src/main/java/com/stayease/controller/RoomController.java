package com.stayease.controller;

import com.stayease.dto.request.RoomRequest;
import com.stayease.dto.response.RoomResponse;
import com.stayease.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "Rooms", description = "Room inventory and availability")
public class RoomController {

    private final RoomService roomService;

    // --- Public ---

    @GetMapping("/hotel/{hotelId}")
    @Operation(summary = "List rooms for a hotel (public)")
    public ResponseEntity<List<RoomResponse>> byHotel(@PathVariable String hotelId) {
        return ResponseEntity.ok(roomService.getRoomsByHotel(hotelId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(roomService.getById(id));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Check available units for a date range (public)")
    public ResponseEntity<RoomResponse> availability(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        return ResponseEntity.ok(roomService.checkAvailability(id, checkIn, checkOut));
    }

    // --- Manager ---

    @PostMapping("/hotel/{hotelId}")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER','ADMIN')")
    public ResponseEntity<RoomResponse> create(@PathVariable String hotelId,
                                               @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.create(hotelId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER','ADMIN')")
    public ResponseEntity<RoomResponse> update(@PathVariable String id,
                                               @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
