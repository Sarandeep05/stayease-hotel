# StayEase — Backend (Spring Boot API)

REST API for the StayEase hotel reservation platform.

## Stack
Java 17 · Spring Boot 3.3 · Spring Web · Spring Data MongoDB · Spring Security · JWT (jjwt) · Spring Mail · Twilio · springdoc OpenAPI

## Run locally
```bash
cp .env.example .env      # fill in MONGODB_URI and JWT_SECRET (see ../SETUP_CREDENTIALS.md)
mvn spring-boot:run
```
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/api/health

## Build
```bash
mvn clean package         # jar in target/, tests use embedded MongoDB
```

## Package structure
```
com.stayease
├── config        # Security, CORS, OpenAPI, Mongo auditing, async, data seeder, properties
├── security      # JWT service, auth filter, user details, principal, utils
├── model         # Mongo documents + enums (User, Hotel, Room, Booking, Payment, Review)
├── repository    # Spring Data repositories + dynamic hotel search
├── dto           # request / response DTOs
├── service       # business logic (Auth, Hotel, Room, Booking, Payment, Review, Dashboard, Notification)
├── controller    # REST controllers
└── exception     # custom exceptions + global handler
```

## Roles & access
- `CUSTOMER` — search, book, pay, review, customer dashboard
- `HOTEL_MANAGER` — manage own hotels/rooms, view property bookings, manager dashboard
- `ADMIN` — manage all users/hotels, admin dashboard

Public (no auth): hotel search/detail, room listing/availability, hotel reviews.
