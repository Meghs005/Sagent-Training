package com.example.parking_spot_finder.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Updated ParkingSpot model with latitude/longitude fields.
 * Lenders enter their spot's exact coordinates during registration.
 * These are used for map navigation and nearby-spot distance sorting.
 *
 * REPLACE your existing ParkingSpot.java with this file.
 */
@Entity
@Table(name = "parking_spot")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ParkingSpot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long spotId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(nullable = false)
    private String spotName;

    private String address;

    @Column(nullable = false)
    private BigDecimal pricePerHr;

    private String approvalStatus;
    private String approvalReason;
    private LocalDateTime approvalTime;
    private String locationCity;

    /** Exact GPS coordinates of this specific parking spot.
     *  Entered by the lender during spot registration.
     *  Used for: map navigation, distance-based search sorting.
     */
    private Double latitude;
    private Double longitude;
}
