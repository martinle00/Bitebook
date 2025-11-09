package com.bitebook.Proxies;

import com.bitebook.Interfaces.GooglePlacesApiClient;
import com.bitebook.Models.PlaceDetailsListResponse;
import com.bitebook.Models.PlaceDetailsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Component
public class GooglePlacesApiClientProxy implements GooglePlacesApiClient {
    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String apiKey;

    public GooglePlacesApiClientProxy(RestTemplate restTemplate,
                                      @Value("${google.places.base-url:https://places.googleapis.com/v1/places}") String baseUrl,
                                      @Value("${google.places.api-key:}") String apiKey) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    @Override
    public PlaceDetailsResponse getPlaceDetails(String googlePlaceId) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Google Places API key is not configured. Set 'google.places.api-key' in application.properties or an environment variable.");
        }

        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl)
                    .pathSegment(googlePlaceId)
                    .queryParam("key", apiKey)
                    .queryParam("fields", "*");
            String url = builder.toUriString();

            ResponseEntity<PlaceDetailsResponse> resp = restTemplate.exchange(url, HttpMethod.GET, null, PlaceDetailsResponse.class);
            return resp.getBody();
        } catch (RestClientException ex) {
            throw new RuntimeException("Failed to fetch place: " + googlePlaceId, ex);
        }
    }

    @Override
    public PlaceDetailsListResponse getPlaceDetailsByName(String placeName) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Google Places API key is not configured. Set 'google.places.api-key' in application.properties or an environment variable.");
        }
        try {
            String base = "https://content-places.googleapis.com/v1/places:searchText";
            UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(base)
                    .queryParam("key", apiKey)
                    .queryParam("fields", "*")
                    .queryParam("alt", "json");
            String url = builder.toUriString();

            String requestBody = "{\"textQuery\":\"" + placeName +  " Sydney" + "\"}";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<PlaceDetailsListResponse> resp =
                    restTemplate.exchange(url, HttpMethod.POST, requestEntity, PlaceDetailsListResponse.class);

            return resp.getBody();
        } catch (RestClientException ex) {
            throw new RuntimeException("Failed to fetch place: " + placeName, ex);
        }
    }
}
