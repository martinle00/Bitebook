package com.bitebook.Models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdatePlaceRequest {
    private String name;
    private PlaceType type;
    private String cuisine;
    private String location;
    private Double rating;
    private String notes;
    private boolean visited;
}
