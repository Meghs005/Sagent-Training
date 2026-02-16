package com.example.college_addmission.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.college_addmission.Model.Application;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

}
