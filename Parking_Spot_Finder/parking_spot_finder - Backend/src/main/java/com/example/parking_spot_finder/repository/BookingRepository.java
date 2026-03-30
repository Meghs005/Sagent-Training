package com.example.parking_spot_finder.repository;

import com.example.parking_spot_finder.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}