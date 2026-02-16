package com.example.college_addmission.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.college_addmission.Model.Document;
import com.example.college_addmission.service.DocumentService;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService service;

    public DocumentController(DocumentService service) {
        this.service = service;
    }

    @PostMapping
    public Document create(@RequestBody Document doc) {
        return service.save(doc);
    }

    @GetMapping
    public List<Document> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Document getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Document update(@PathVariable Long id, @RequestBody Document doc) {
        return service.update(id, doc);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Document deleted successfully";
    }
}
