package com.example.college_addmission.service;

import org.springframework.stereotype.Service;
import java.util.List;
import com.example.college_addmission.Model.Application;
import com.example.college_addmission.repository.ApplicationRepository;

@Service
public class ApplicationService {

    private final ApplicationRepository repo;

    public ApplicationService(ApplicationRepository repo) {
        this.repo = repo;
    }

    public Application save(Application app) {
        return repo.save(app);
    }

    public List<Application> getAll() {
        return repo.findAll();
    }

    public Application getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public Application update(Long id, Application app) {
        app.setApp_id(id);
        return repo.save(app);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
