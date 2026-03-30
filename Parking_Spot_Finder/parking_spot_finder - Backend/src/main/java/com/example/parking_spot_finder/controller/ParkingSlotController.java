package com.example.parking_spot_finder.controller;

import com.example.parking_spot_finder.model.ParkingSlot;
import com.example.parking_spot_finder.service.ParkingSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/slots")
public class ParkingSlotController {

    @Autowired
    private ParkingSlotService parkingSlotService;

    @PostMapping
    public ParkingSlot addSlot(@RequestBody ParkingSlot slot) {
        return parkingSlotService.saveSlot(slot);
    }

    @GetMapping
    public List<ParkingSlot> getAllSlots() {
        return parkingSlotService.getAllSlots();
    }

    /** Update slot (lender can block/unblock) */
    @PutMapping("/{id}")
    public ParkingSlot updateSlot(@PathVariable Long id, @RequestBody ParkingSlot slot) {
        slot.setSlotId(id);
        return parkingSlotService.saveSlot(slot);
    }
}
