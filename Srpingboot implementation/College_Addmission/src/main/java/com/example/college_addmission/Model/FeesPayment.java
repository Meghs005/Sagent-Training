package com.example.college_addmission.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Table(name = "fees_payment")
public class FeesPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fees_payment_id;

    private String pay_method;
    private String status;

    @ManyToOne
    @JoinColumn(name = "form_id")
    private Application application;
}
