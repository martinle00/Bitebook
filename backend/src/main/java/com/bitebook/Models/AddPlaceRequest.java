package com.bitebook.Models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AddPlaceRequest {
    private String name;
    private String cuisine;
    private String type;
    private String location;
    private String influence;
    private String visited;
    private String notes;
    private String website;
    private String socialMedia;
    private Double rating;
    private String googlePlaceId;
}
