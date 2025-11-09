package com.bitebook.Models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.databind.JsonDeserializer;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.io.IOException;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class PlaceDetailsResponse {

    private String name;

    @JsonProperty("id")
    private String googlePlaceId;

    @JsonProperty("formattedAddress")
    private String formattedAddress;

    @JsonProperty("nationalPhoneNumber")
    private String phoneNumber;

    @JsonProperty("regularOpeningHours")
    private OpeningHour openingHours;

    @JsonProperty("websiteUri")
    private String website;

    @JsonProperty("businessStatus")
    private String businessStatus;


    private List<String> types;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
    public static class Geometry {
        private Location location;
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
    public static class Location {
        private Double lat;
        private Double lng;
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
    @JsonDeserialize(using = OpeningHour.OpeningHourDeserializer.class)
    public static class OpeningHour {
        private HashMap<String, List<Period>> openingHours;
        private boolean openNow;

        static class OpeningHourDeserializer extends JsonDeserializer<OpeningHour> {
            @Override
            public OpeningHour deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
                JsonNode node = p.getCodec().readTree(p);
                OpeningHour result = new OpeningHour();
                result.openingHours = new HashMap<>();

                if (node.has("openNow")) {
                    result.openNow = node.get("openNow").asBoolean();
                }

                if (node.has("periods")) {
                    for (JsonNode periodNode : node.get("periods")) {
                        if (periodNode.has("open")) {
                            JsonNode openNode = periodNode.get("open");
                            int dayNum = openNode.get("day").asInt();
                            String dayName = formattedDayString(dayNum);

                            Period period = new Period();
                            period.setOpeningHour(openNode.get("hour").asInt());
                            period.setOpeningMinute(openNode.get("minute").asInt());

                            if (periodNode.has("close")) {
                                JsonNode closeNode = periodNode.get("close");
                                period.setClosingHour(closeNode.get("hour").asInt());
                                period.setClosingMinute(closeNode.get("minute").asInt());
                            }

                            result.openingHours
                                    .computeIfAbsent(dayName, k -> new ArrayList<>())
                                    .add(period);
                        }
                    }
                }

                return result;
            }

            private static String formattedDayString(int day) {
                final String[] NAMES = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
                return NAMES[day];
            }
        }
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
    public static class Period {
        private int openingHour;
        private int openingMinute;
        private int closingHour;
        private int closingMinute;
    }
}
