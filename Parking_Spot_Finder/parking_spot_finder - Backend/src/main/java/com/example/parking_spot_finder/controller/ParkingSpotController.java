package com.example.parking_spot_finder.controller;

import com.example.parking_spot_finder.model.ParkingSpot;
import com.example.parking_spot_finder.service.ParkingSpotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/spots")
public class ParkingSpotController {

    @Autowired
    private ParkingSpotService parkingSpotService;

    @PostMapping
    public ParkingSpot addSpot(@RequestBody ParkingSpot spot) {
        return parkingSpotService.saveParkingSpot(spot);
    }

    @GetMapping
    public List<ParkingSpot> getAllSpots() {
        return parkingSpotService.getAllSpots();
    }

    @GetMapping("/search")
    public List<ParkingSpot> search(@RequestParam String city) {
        return parkingSpotService.searchByCity(city);
    }

    @PostMapping("/approve/{id}")
    public ParkingSpot approve(@PathVariable Long id) {
        return parkingSpotService.approveParkingSpot(id);
    }

    /* ── NEW: reject endpoint ── */
    @PostMapping("/reject/{id}")
    public ParkingSpot reject(@PathVariable Long id,
                              @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null) ? body.getOrDefault("reason", "Rejected by admin") : "Rejected by admin";
        return parkingSpotService.rejectParkingSpot(id, reason);
    }
}
