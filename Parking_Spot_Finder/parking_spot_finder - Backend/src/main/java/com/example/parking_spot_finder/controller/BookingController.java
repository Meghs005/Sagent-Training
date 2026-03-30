package com.example.parking_spot_finder.controller;

import com.example.parking_spot_finder.dto.BookingRequestDTO;
import com.example.parking_spot_finder.model.*;
import com.example.parking_spot_finder.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired private BookingService service;

    /** STEP 1: Create reservation hold — no payment */
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody BookingRequestDTO dto) {
        try {
            Booking b = new Booking();
            User u = new User();          u.setUserId(dto.getUserId());
            ParkingSlot s = new ParkingSlot(); s.setSlotId(dto.getSlotId());
            Vehicle v = new Vehicle();    v.setVehicleId(dto.getVehicleId());
            b.setUser(u); b.setSlot(s); b.setVehicle(v);

            String start = dto.getStartTime();
            String end   = dto.getEndTime();
            if (start != null && start.length() == 16) start += ":00";
            if (end   != null && end.length()   == 16) end   += ":00";
            b.setStartTime(java.time.LocalDateTime.parse(start));
            b.setEndTime(java.time.LocalDateTime.parse(end));

            return ResponseEntity.ok(service.createBooking(b));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    /** STEP 2: Pay advance — confirms booking */
    @PostMapping("/pay-advance/{id}")
    public ResponseEntity<?> payAdvance(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.payAdvance(id));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(Map.of("message", service.cancelBooking(id)));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/checkout/{id}")
    public ResponseEntity<?> checkout(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.checkout(id));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public List<Booking> getAll() {
        return service.getAllBookings();
    }
}
