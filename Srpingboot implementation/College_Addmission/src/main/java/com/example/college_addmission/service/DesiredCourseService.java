package com.example.college_addmission.service;

import org.springframework.stereotype.Service;
import java.util.List;
import com.example.college_addmission.Model.DesiredCourse;
import com.example.college_addmission.repository.DesiredCourseRepository;

@Service
public class DesiredCourseService {

    private final DesiredCourseRepository repo;

    public DesiredCourseService(DesiredCourseRepository repo) {
        this.repo = repo;
    }

    public DesiredCourse save(DesiredCourse course) {
        return repo.save(course);
    }

    public List<DesiredCourse> getAll() {
        return repo.findAll();
    }

    public DesiredCourse getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public DesiredCourse update(Long id, DesiredCourse course) {
        course.setCourse_id(id);
        return repo.save(course);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
