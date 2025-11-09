package com.bitebook.Models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.*;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@Entity
@Table(name = "\"Places\"", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@Access(AccessType.FIELD)
public class Place {

    @Id
    @Column(name = "\"PlaceId\"")
    private UUID placeId;

    @Column(name = "\"Name\"")
    private String name;

    @Column(name = "\"Cuisine\"")
    private String cuisine;

    @Enumerated(EnumType.STRING)
    @Column(name = "\"Type\"")
    private PlaceType type;

    @Column(name = "\"Location\"")
    private String location;

    @Column(name = "\"Influence\"")
    private String influence;

    @Column(name = "\"Visited\"")
    private Boolean visited;

    @Column(name = "\"Notes\"")
    private String notes;

    @Column(name = "\"Rating\"")
    private Double rating;

    @Column(name = "\"Website\"")
    private String website;

    @Column(name = "\"SocialMedia\"")
    private String socialMedia;

    @Column(name="\"GooglePlaceId\"")
    private String googlePlaceId;

    @Column(name="\"LastUpdatedDateTime\"")
    private Date lastUpdatedDateTime;

    @Column(name="\"CreatedDateTime\"")
    private Date createdDateTime;

    @Column(name="\"FullAddress\"")
    private String fullAddress;

    @Column(name="\"IsPermanentlyClosed\"")
    private Boolean isPermanentlyClosed;

    @Transient
    private Map<String, List<OpeningHoursPeriod>> openingHours = new HashMap<>();

    @Getter
    @Setter
    @NoArgsConstructor
    public static class OpeningHoursPeriod {
        private int openingHour;
        private int openingMinute;
        private int closingHour;
        private int closingMinute;
    }
}