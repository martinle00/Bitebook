package com.bitebook.Interfaces;

import com.bitebook.Models.PlaceDetailsResponse;

public interface GooglePlacesApiClient {
    PlaceDetailsResponse getPlaceDetails(String googlePlaceId);
}
