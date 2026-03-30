package com.example.parking_spot_finder.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parking_slot")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long slotId;

    @ManyToOne
    @JoinColumn(name = "spot_id", nullable = false)
    private ParkingSpot spot;

    @Column(nullable = false)
    private String slotNo;

    @Column(nullable = false)
    private String status;
}