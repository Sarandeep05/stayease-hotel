package com.stayease.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enables {@code @Async} so notifications don't block request threads.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
