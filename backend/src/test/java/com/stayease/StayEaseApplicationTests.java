package com.stayease;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Smoke test: verifies the Spring context loads. Uses an embedded MongoDB
 * (de.flapdoodle) so no external database is required. Seeding, mail and SMS
 * are disabled for the test run.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "app.seed.enabled=false",
        "app.mail.enabled=false",
        "app.twilio.enabled=false",
        "app.jwt.secret=test-secret-key-that-is-at-least-64-bytes-long-for-hs512-000000000",
        "spring.mail.host=localhost",
        "spring.mail.port=25"
})
class StayEaseApplicationTests {

    @Test
    void contextLoads() {
        // Fails the build if any bean cannot be created.
    }
}
