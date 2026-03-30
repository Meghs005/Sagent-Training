package com.example.parking_spot_finder.repository;
import com.example.parking_spot_finder.model.ParkingSpot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {

    /* Original exact-match method — kept for compatibility */
    List<ParkingSpot> findByLocationCity(String city);

    /* New: case-insensitive partial match on locationCity field */
    List<ParkingSpot> findByLocationCityContainingIgnoreCase(String city);

    /* Also search through the linked Location entity's city */
    @Query("SELECT p FROM ParkingSpot p WHERE " +
            "LOWER(p.locationCity) LIKE LOWER(CONCAT('%', :city, '%')) OR " +
            "LOWER(p.location.city) LIKE LOWER(CONCAT('%', :city, '%')) OR " +
            "LOWER(p.location.areaName) LIKE LOWER(CONCAT('%', :city, '%'))")
    List<ParkingSpot> searchByCity(@Param("city") String city);
}
