package com.example.college_addmission.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.college_addmission.Model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

}
