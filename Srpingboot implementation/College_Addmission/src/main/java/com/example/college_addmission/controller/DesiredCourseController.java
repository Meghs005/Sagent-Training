package com.example.college_addmission.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.college_addmission.Model.DesiredCourse;
import com.example.college_addmission.service.DesiredCourseService;

@RestController
@RequestMapping("/courses")
public class DesiredCourseController {

    private final DesiredCourseService service;

    public DesiredCourseController(DesiredCourseService service) {
        this.service = service;
    }

    @PostMapping
    public DesiredCourse create(@RequestBody DesiredCourse course) {
        return service.save(course);
    }

    @GetMapping
    public List<DesiredCourse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public DesiredCourse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public DesiredCourse update(@PathVariable Long id, @RequestBody DesiredCourse course) {
        return service.update(id, course);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Course deleted successfully";
    }
}
