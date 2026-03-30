package com.example.parking_spot_finder.model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "location")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long locationId;

    private String areaName;
    private String city;
    private String pincode;
    private Double latitude;
    private Double longitude;
}