package com.example.college_addmission.service;

import org.springframework.stereotype.Service;
import java.util.List;
import com.example.college_addmission.Model.Document;
import com.example.college_addmission.repository.DocumentRepository;

@Service
public class DocumentService {

    private final DocumentRepository repo;

    public DocumentService(DocumentRepository repo) {
        this.repo = repo;
    }

    public Document save(Document doc) {
        return repo.save(doc);
    }

    public List<Document> getAll() {
        return repo.findAll();
    }

    public Document getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public Document update(Long id, Document doc) {
        doc.setDocument_id(id);
        return repo.save(doc);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
