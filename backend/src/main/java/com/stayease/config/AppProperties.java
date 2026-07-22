package com.stayease.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Strongly-typed access to the {@code app.*} configuration namespace.
 */
@Data
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Cors cors = new Cors();
    private Mail mail = new Mail();
    private Twilio twilio = new Twilio();
    private Seed seed = new Seed();

    @Data
    public static class Jwt {
        private String secret;
        private long accessTokenExpirationMs;
        private long refreshTokenExpirationMs;
    }

    @Data
    public static class Cors {
        private String allowedOrigins;
    }

    @Data
    public static class Mail {
        private String from;
        private boolean enabled;
    }

    @Data
    public static class Twilio {
        private String accountSid;
        private String authToken;
        private String fromNumber;
        private boolean enabled;
    }

    @Data
    public static class Seed {
        private boolean enabled;
    }
}
