package com.example.parking_spot_finder.service;

import com.example.parking_spot_finder.model.ParkingSpot;
import com.example.parking_spot_finder.repository.ParkingSpotRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParkingSpotService {

    @Autowired
    private ParkingSpotRepository parkingSpotRepository;

    // ✅ EXISTING - SAVE
    public ParkingSpot saveParkingSpot(ParkingSpot spot) {
        return parkingSpotRepository.save(spot);
    }

    // ✅ EXISTING - GET ALL
    public List<ParkingSpot> getAllSpots() {
        return parkingSpotRepository.findAll();
    }

    // 🔥 NEW - SEARCH BY CITY (Nearby parking)
    public List<ParkingSpot> searchByCity(String city) {
        // Uses the new searchByCity @Query that searches locationCity, location.city, location.areaName
        return parkingSpotRepository.searchByCity(city);
    }


    // 🔥 NEW - ADMIN APPROVAL
    public ParkingSpot approveParkingSpot(Long id) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking spot not found"));

        spot.setApprovalStatus("APPROVED");

        return parkingSpotRepository.save(spot);
    }
    public ParkingSpot rejectParkingSpot(Long id, String reason) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ParkingSpot not found: " + id));
        spot.setApprovalStatus("REJECTED");
        spot.setApprovalReason(reason);
        spot.setApprovalTime(java.time.LocalDateTime.now());
        return parkingSpotRepository.save(spot);
    }




}