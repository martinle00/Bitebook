package com.bitebook.Controllers;

import com.bitebook.Models.AddPlaceRequest;
import com.bitebook.Models.Place;
import com.bitebook.Services.FeedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/places")
public class FeedController {

    @Autowired
    private FeedService feedService;

    @GetMapping("/feed")
    public List<Place> GetFeed(
            @RequestParam(name = "type", defaultValue = "all") String type,
            @RequestParam(required = false) boolean visited) {
        // Type placeType = Type.valueOf(type.toUpperCase());
        return feedService.GetFeed(type, visited);
    }

//    @PostMapping("/add")
//    public void AddPlace(@RequestBody AddPlaceRequest request) {
//        feedService.AddPlace(request);
//    }
}
