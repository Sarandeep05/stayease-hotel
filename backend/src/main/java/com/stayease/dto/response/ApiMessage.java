package com.stayease.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiMessage {
    private boolean success;
    private String message;

    public static ApiMessage ok(String message) {
        return new ApiMessage(true, message);
    }
}
