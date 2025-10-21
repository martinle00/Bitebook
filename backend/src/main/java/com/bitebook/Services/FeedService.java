package com.bitebook.Services;
import com.bitebook.Models.Place;
import com.bitebook.Models.PlaceType;
import com.bitebook.Repositories.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class FeedService {

    @Autowired
    private PlaceRepository placeRepository;

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


}
