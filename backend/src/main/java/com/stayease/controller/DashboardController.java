package com.stayease.controller;

import com.stayease.dto.response.DashboardResponse;
import com.stayease.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboards", description = "Role-based dashboards and reports")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Customer dashboard: bookings & spend")
    public ResponseEntity<DashboardResponse> customer() {
        return ResponseEntity.ok(dashboardService.customerDashboard());
    }

    @GetMapping("/manager")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    @Operation(summary = "Hotel manager dashboard: hotels, bookings, revenue")
    public ResponseEntity<DashboardResponse> manager() {
        return ResponseEntity.ok(dashboardService.managerDashboard());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin dashboard: platform-wide insights")
    public ResponseEntity<DashboardResponse> admin() {
        return ResponseEntity.ok(dashboardService.adminDashboard());
    }
}
