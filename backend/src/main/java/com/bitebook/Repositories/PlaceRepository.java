package com.bitebook.Repositories;

import com.bitebook.Models.Place;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PlaceRepository extends JpaRepository<Place, UUID> {
    //@Query("SELECT p FROM Place p WHERE p.Visited = :visited")
    //List<Place> GetVisitedPlaces(boolean visited);
}
