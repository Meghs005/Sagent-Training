package com.example.parking_spot_finder.repository;

import com.example.parking_spot_finder.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
}