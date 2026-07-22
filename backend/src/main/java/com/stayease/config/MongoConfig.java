package com.stayease.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Enables auditing so {@code @CreatedDate} / {@code @LastModifiedDate} populate.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
}
