package com.stayease.service;

import com.stayease.dto.request.ReviewRequest;
import com.stayease.dto.response.PagedResponse;
import com.stayease.dto.response.ReviewResponse;
import com.stayease.exception.ConflictException;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.model.BookingStatus;
import com.stayease.model.Review;
import com.stayease.model.User;
import com.stayease.repository.BookingRepository;
import com.stayease.repository.ReviewRepository;
import com.stayease.repository.UserRepository;
import com.stayease.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final HotelService hotelService;

    public PagedResponse<ReviewResponse> getHotelReviews(String hotelId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviews = reviewRepository.findByHotelId(hotelId, pageable);
        return PagedResponse.from(reviews, ReviewResponse::from);
    }

    public ReviewResponse create(ReviewRequest request) {
        String customerId = SecurityUtils.currentUserId();
        // Confirm the hotel exists.
        hotelService.findHotel(request.getHotelId());

        // Only customers who have (or had) a booking at this hotel can review it.
        boolean hasStay = bookingRepository.existsByCustomerIdAndHotelIdAndStatus(
                customerId, request.getHotelId(), BookingStatus.CONFIRMED)
                || bookingRepository.existsByCustomerIdAndHotelIdAndStatus(
                customerId, request.getHotelId(), BookingStatus.COMPLETED);
        if (!hasStay) {
            throw new ForbiddenException("You can only review hotels you have booked");
        }
        if (reviewRepository.existsByHotelIdAndCustomerId(request.getHotelId(), customerId)) {
            throw new ConflictException("You have already reviewed this hotel");
        }

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        Review review = Review.builder()
                .hotelId(request.getHotelId())
                .customerId(customerId)
                .customerName(customer.getFullName())
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);
        hotelService.recomputeRating(request.getHotelId());
        return ReviewResponse.from(review);
    }

    public ReviewResponse update(String id, ReviewRequest request) {
        Review review = findReview(id);
        assertOwner(review);
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        review = reviewRepository.save(review);
        hotelService.recomputeRating(review.getHotelId());
        return ReviewResponse.from(review);
    }

    public void delete(String id) {
        Review review = findReview(id);
        if (!SecurityUtils.hasRole("ADMIN")) {
            assertOwner(review);
        }
        String hotelId = review.getHotelId();
        reviewRepository.delete(review);
        hotelService.recomputeRating(hotelId);
    }

    private Review findReview(String id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
    }

    private void assertOwner(Review review) {
        if (!review.getCustomerId().equals(SecurityUtils.currentUserId())) {
            throw new ForbiddenException("You can only modify your own review");
        }
    }
}
