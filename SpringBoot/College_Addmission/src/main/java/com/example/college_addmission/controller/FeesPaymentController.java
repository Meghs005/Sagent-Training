package com.example.college_addmission.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.college_addmission.Model.FeesPayment;
import com.example.college_addmission.service.FeesPaymentService;

@RestController
@RequestMapping("/payments")
public class FeesPaymentController {

    private final FeesPaymentService service;

    public FeesPaymentController(FeesPaymentService service) {
        this.service = service;
    }

    @PostMapping
    public FeesPayment create(@RequestBody FeesPayment payment) {
        return service.save(payment);
    }

    @GetMapping
    public List<FeesPayment> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public FeesPayment getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public FeesPayment update(@PathVariable Long id, @RequestBody FeesPayment payment) {
        return service.update(id, payment);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Payment deleted successfully";
    }
}
