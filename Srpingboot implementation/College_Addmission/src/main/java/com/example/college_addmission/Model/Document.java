package com.example.college_addmission.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Table(name = "document")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long document_id;

    private String file;
}
