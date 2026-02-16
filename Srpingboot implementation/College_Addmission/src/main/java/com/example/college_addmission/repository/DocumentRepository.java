package com.example.college_addmission.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.college_addmission.Model.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

}
