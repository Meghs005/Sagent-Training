package com.example.parking_spot_finder.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "slot_id", nullable = false)
    private ParkingSlot slot;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    private LocalDate bookingDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String bookingStatus;
    private String bookingCode;
    private BigDecimal estimatedAmt;
    private String cancellationReason;
    private LocalDateTime cancellationTime;
    private LocalDateTime checkoutTime;
    private BigDecimal additionalFee;
    private BigDecimal finalAmt;
    private String checkoutStatus;
}