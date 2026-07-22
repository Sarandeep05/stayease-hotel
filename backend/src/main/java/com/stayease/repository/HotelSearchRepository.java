package com.stayease.repository;

import com.stayease.dto.request.HotelSearchRequest;
import com.stayease.model.Hotel;
import com.stayease.model.HotelStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Dynamic hotel search built with MongoTemplate so filters can be composed
 * conditionally (destination, price range, rating, amenities, star rating).
 */
@Repository
@RequiredArgsConstructor
public class HotelSearchRepository {

    private final MongoTemplate mongoTemplate;

    public Page<Hotel> search(HotelSearchRequest req, Pageable pageable) {
        List<Criteria> criteria = new ArrayList<>();

        // Only surface active hotels in public search.
        criteria.add(Criteria.where("status").is(HotelStatus.ACTIVE));

        if (StringUtils.hasText(req.getDestination())) {
            String safe = Pattern.quote(req.getDestination().trim());
            Pattern p = Pattern.compile(safe, Pattern.CASE_INSENSITIVE);
            criteria.add(new Criteria().orOperator(
                    Criteria.where("city").regex(p),
                    Criteria.where("name").regex(p),
                    Criteria.where("country").regex(p),
                    Criteria.where("address").regex(p)
            ));
        }

        if (req.getMinPrice() != null) {
            criteria.add(Criteria.where("startingPrice").gte(req.getMinPrice()));
        }
        if (req.getMaxPrice() != null) {
            criteria.add(Criteria.where("startingPrice").lte(req.getMaxPrice()));
        }
        if (req.getMinRating() != null) {
            criteria.add(Criteria.where("averageRating").gte(req.getMinRating()));
        }
        if (req.getStarRating() != null) {
            criteria.add(Criteria.where("starRating").is(req.getStarRating()));
        }
        if (req.getAmenities() != null && !req.getAmenities().isEmpty()) {
            criteria.add(Criteria.where("amenities").all(req.getAmenities()));
        }

        Query query = new Query();
        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Hotel.class);

        query.with(resolveSort(req.getSortBy()));
        query.with(pageable);

        List<Hotel> hotels = mongoTemplate.find(query, Hotel.class);
        return new PageImpl<>(hotels, pageable, total);
    }

    /**
     * Distinct active-hotel city names that START WITH the given prefix
     * (case-insensitive), for the destination autocomplete dropdown.
     */
    public List<String> suggestCities(String prefix, int limit) {
        Criteria criteria = Criteria.where("status").is(HotelStatus.ACTIVE);
        if (StringUtils.hasText(prefix)) {
            criteria.and("city").regex("^" + Pattern.quote(prefix.trim()), "i");
        }
        Query query = new Query(criteria);
        List<String> cities = mongoTemplate.findDistinct(query, "city", Hotel.class, String.class);
        return cities.stream()
                .filter(Objects::nonNull)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .limit(limit)
                .toList();
    }

    private Sort resolveSort(String sortBy) {
        if (sortBy == null) {
            return Sort.by(Sort.Direction.DESC, "averageRating");
        }
        return switch (sortBy) {
            case "priceAsc" -> Sort.by(Sort.Direction.ASC, "startingPrice");
            case "priceDesc" -> Sort.by(Sort.Direction.DESC, "startingPrice");
            case "ratingDesc" -> Sort.by(Sort.Direction.DESC, "averageRating");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "averageRating");
        };
    }
}
