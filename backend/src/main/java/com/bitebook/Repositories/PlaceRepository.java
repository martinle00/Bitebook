package com.bitebook.Repositories;

import com.bitebook.Models.Place;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlaceRepository extends JpaRepository<Place, String> {
    //@Query("SELECT p FROM Place p WHERE p.Visited = :visited")
    //List<Place> GetVisitedPlaces(boolean visited);
}
