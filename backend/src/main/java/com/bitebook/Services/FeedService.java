package com.bitebook.Services;

import com.bitebook.Interfaces.GooglePlacesApiClient;
import com.bitebook.Models.AddPlaceRequest;
import com.bitebook.Models.Place;
import com.bitebook.Models.PlaceType;
import com.bitebook.Models.UpdatePlaceRequest;
import com.bitebook.Repositories.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class FeedService {

    @Autowired
    private PlaceRepository placeRepository;

    // Depend on the interface so the implementation can be swapped or mocked in tests.
    @Autowired
    private GooglePlacesApiClient googleProxy;

    public List<Place> GetAllPlaces() {
        List<Place> places = placeRepository.findAll();
        places.forEach(p -> System.out.println(p.getName()));
        return places;
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

        placeRepository.save(newPlace);
    }

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

    public void DeletePlace(String placeId) {
        UUID convertedUuid = UUID.fromString(placeId);
        placeRepository.deleteById(convertedUuid);
    }

    public void TestGoogle()
    {
        googleProxy.getPlaceDetails("ChIJN1t_tDeuEmsRUsoyG83frY4");
    }

    // Return details from Google Places for testing/diagnostics
    public com.bitebook.Models.PlaceDetailsResponse TestGoogleReturn() {
        return googleProxy.getPlaceDetails("ChIJMenicgakEmsRyjNyd22MYGg");
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


}
