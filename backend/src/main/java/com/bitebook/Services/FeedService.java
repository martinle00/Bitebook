package com.bitebook.Services;

import com.bitebook.Interfaces.GooglePlacesApiClient;
import com.bitebook.Models.*;
import com.bitebook.Repositories.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class FeedService {

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private GooglePlacesApiClient googleProxy;

    @Autowired
    private CaffeineCacheManager cacheManager;

    public List<Place> GetAllPlaces() {
        List<Place> places = placeRepository.findAll();
        places.forEach(p -> System.out.println(p.getName()));
        return places;
    }

    @Cacheable("places")
    public Place GetPlace(String placeId) {
        UUID convertedUuid = UUID.fromString(placeId);

        Place place = placeRepository.findById(convertedUuid)
                .orElseThrow(() -> new IllegalArgumentException("Place not found: " + convertedUuid));

        // Enrich place details with Google Places data
        PlaceDetailsResponse placeDetails = place.getGooglePlaceId() == null
                ? GetPlaceDetailsByName(place)
                : GetPlaceDetails(place.getGooglePlaceId());

        if (place.getIsPermanentlyClosed() == null)
        {
            place.setIsPermanentlyClosed(placeDetails.getBusinessStatus().contains("CLOSED"));
        }

        if (placeDetails.getOpeningHours() != null)
        {
            Map<String, List<Place.OpeningHoursPeriod>> openingHoursMap = convertToOpeningHoursMap(placeDetails.getOpeningHours());
            place.setOpeningHours(openingHoursMap);
        }

        return place;
    }

    @Cacheable("placeDetails")
    private PlaceDetailsResponse GetPlaceDetails(String googlePlaceId) {
        return googleProxy.getPlaceDetails(googlePlaceId);
    }
    @Cacheable("placeDetails")
    private PlaceDetailsResponse GetPlaceDetailsByName(Place place) {
        try {
            PlaceDetailsListResponse placeDetails = googleProxy.getPlaceDetailsByName(place.getName());
            List<PlaceDetailsResponse> placeResponse = placeDetails.getPlaces();

            if (placeResponse == null || placeResponse.isEmpty()) {
                throw new IllegalArgumentException("No place found with name: " + place.getName());
            }

            PlaceDetailsResponse matchedPlace = placeResponse.getFirst();
            place.setGooglePlaceId(matchedPlace.getGooglePlaceId());
            place.setFullAddress(matchedPlace.getFormattedAddress());
            place.setWebsite(matchedPlace.getWebsite());
            place.setIsPermanentlyClosed(matchedPlace.getBusinessStatus().contains("CLOSED"));
            placeRepository.save(place);
            invalidateCache("placeDetails", place.getPlaceId().toString());
            return matchedPlace;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<Place> GetFeed(String type, Boolean visited) {
        List<Place> allPlaces = placeRepository.findAll();
        if (type.equalsIgnoreCase("ALL")) {
            return allPlaces;
        }
        PlaceType placeType = PlaceType.valueOf(type);
        if (Boolean.TRUE.equals(visited)) {
            return allPlaces.stream()
                    .filter(place -> placeType.equals(place.getType()) && Boolean.TRUE.equals(place.getVisited()))
                    .toList();
        } else if (Boolean.FALSE.equals(visited)) {
            return allPlaces.stream()
                    .filter(place -> placeType.equals(place.getType()) && Boolean.FALSE.equals(place.getVisited()))
                    .toList();

        }
        return allPlaces.stream()
                .filter(place -> placeType.equals(place.getType()))
                .toList();
    }

    public void AddPlace(AddPlaceRequest request) {
        Place newPlace = new Place();
        newPlace.setPlaceId(UUID.randomUUID());
        newPlace.setName(request.getName());
        newPlace.setCuisine(request.getCuisine());
        newPlace.setType(parsePlaceType(request.getType()));
        newPlace.setLocation(request.getLocation());
        newPlace.setInfluence(request.getInfluence());
        newPlace.setVisited(parseVisited(request.getVisited()));
        newPlace.setNotes(request.getNotes());
        newPlace.setRating(request.getRating());
        newPlace.setWebsite(request.getWebsite());
        newPlace.setSocialMedia(request.getSocialMedia());
        newPlace.setGooglePlaceId(request.getGooglePlaceId());
        newPlace.setLastUpdatedDateTime(new Date());
        newPlace.setCreatedDateTime(new Date());

        PlaceDetailsResponse placeDetails = googleProxy.getPlaceDetails(request.getGooglePlaceId());
        if (placeDetails != null)
        {
            newPlace.setIsPermanentlyClosed(placeDetails.getBusinessStatus().contains("CLOSED"));
            if (!newPlace.getIsPermanentlyClosed())
            {
                newPlace.setOpeningHours(convertToOpeningHoursMap(placeDetails.getOpeningHours()));
            }
            newPlace.setFullAddress(placeDetails.getFormattedAddress());
            newPlace.setWebsite(placeDetails.getWebsite());
        }


        placeRepository.save(newPlace);
    }

    private Map<String, List<Place.OpeningHoursPeriod>> convertToOpeningHoursMap(PlaceDetailsResponse.OpeningHour regularOpeningHours) {
        Map<String, List<Place.OpeningHoursPeriod>> map = new HashMap<>();

        if (regularOpeningHours.getOpeningHours() != null) {
            regularOpeningHours.getOpeningHours().forEach((day, periodList) -> {
                List<Place.OpeningHoursPeriod> hoursPeriods = new ArrayList<>();

                for (PlaceDetailsResponse.Period period : periodList) {
                    Place.OpeningHoursPeriod hoursPeriod = new Place.OpeningHoursPeriod();
                    hoursPeriod.setOpeningHour(period.getOpeningHour());
                    hoursPeriod.setOpeningMinute(period.getOpeningMinute());
                    hoursPeriod.setClosingHour(period.getClosingHour());
                    hoursPeriod.setClosingMinute(period.getClosingMinute());
                    hoursPeriods.add(hoursPeriod);
                }

                map.put(day, hoursPeriods);
            });
        }

        return map;
    }

    @CachePut(value = "places", key = "#placeId")
    public void UpdatePlace(String placeId, UpdatePlaceRequest request)
    {
        UUID convertedUuid = UUID.fromString(placeId);
        Place existingPlace = placeRepository.findById(convertedUuid)
                .orElseThrow(() -> new IllegalArgumentException("Place not found: " + convertedUuid));
        existingPlace.setRating(request.getRating());
        existingPlace.setNotes(request.getNotes());
        existingPlace.setLastUpdatedDateTime(new Date());
        existingPlace.setVisited(true);
        placeRepository.save(existingPlace);
    }

    @CacheEvict(value = "places", key = "#placeId")
    public void DeletePlace(String placeId) {
        UUID convertedUuid = UUID.fromString(placeId);
        placeRepository.deleteById(convertedUuid);
    }

    public void UpdateDb(List<String> idList) {
        for (String placeId : idList) {
            Place place = GetPlace(placeId);
            GetPlaceDetailsByName(place);
        }
    }

    private PlaceType parsePlaceType(String type) {
        if (type == null || type.isBlank()) return null;
        try {
            return PlaceType.valueOf(type.trim());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid place type: " + type, ex);
        }
    }

    private Boolean parseVisited(String visited) {
        if (visited == null || visited.isBlank()) return null;
        return Boolean.valueOf(visited.trim());
    }

    private void invalidateCache(String cacheName, String key) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.evict(key);
        }
    }


}
