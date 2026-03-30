package com.example.parking_spot_finder.controller;

import com.example.parking_spot_finder.model.ParkingSpot;
import com.example.parking_spot_finder.service.ParkingSpotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/parking")
public class ParkingController {

    @Autowired
    private ParkingSpotService service;

    @GetMapping("/search")
    public List<ParkingSpot> search(@RequestParam String city) {
        return service.searchByCity(city);
    }

    @PostMapping("/approve/{id}")
    public ParkingSpot approve(@PathVariable Long id) {
        return service.approveParkingSpot(id);
    }
}