package com.stayease.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Flexible dashboard payload reused for Customer, Manager and Admin views.
 */
@Data
@Builder
public class DashboardResponse {

    /** Scalar KPI cards, e.g. {"totalBookings": 12, "revenue": 3400.0}. */
    private Map<String, Object> stats;

    /** Time-series / grouped data for charts, e.g. revenue by month. */
    private List<Map<String, Object>> charts;

    /** Recent activity rows (bookings, reviews, etc.). */
    private List<Map<String, Object>> recent;
}
