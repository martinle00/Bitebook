package com.bitebook.Models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdatePlaceRequest {
    private Double rating;
    private String notes;
}
