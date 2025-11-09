package com.bitebook.Models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class PlaceDetailsListResponse {
    private List<PlaceDetailsResponse> places;

    public List<PlaceDetailsResponse> getPlaces() {
        return places;
    }

    public void setPlaces(List<PlaceDetailsResponse> places) {
        this.places = places;
    }
}
