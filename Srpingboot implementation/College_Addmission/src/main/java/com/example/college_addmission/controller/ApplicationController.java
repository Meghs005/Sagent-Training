package com.example.college_addmission.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.college_addmission.Model.Application;
import com.example.college_addmission.service.ApplicationService;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @PostMapping
    public Application create(@RequestBody Application app) {
        return service.save(app);
    }

    @GetMapping
    public List<Application> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Application getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Application update(@PathVariable Long id, @RequestBody Application app) {
        return service.update(id, app);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Application deleted successfully";
    }
}
