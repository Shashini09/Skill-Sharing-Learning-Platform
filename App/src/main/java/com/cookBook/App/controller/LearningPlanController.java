package com.cookBook.App.controller;

import com.cookBook.App.model.LearningPlan;
import com.cookBook.App.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-plans")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    @GetMapping("/all")
    public ResponseEntity<List<LearningPlan>> getAllLearningPlans(@RequestParam String userId) {
        List<LearningPlan> plans = learningPlanService.getLearningPlansByUserId(userId);
        return ResponseEntity.ok(plans);
    }

    @PostMapping("/create")
    public ResponseEntity<LearningPlan> createLearningPlan(@RequestBody LearningPlan plan) {
        LearningPlan createdPlan = learningPlanService.createLearningPlan(plan);
        return ResponseEntity.ok(createdPlan);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningPlan> getLearningPlanById(@PathVariable String id) {
        return learningPlanService.getLearningPlanById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<LearningPlan> updateLearningPlan(@PathVariable String id, @RequestBody LearningPlan plan) {
        LearningPlan updatedPlan = learningPlanService.updateLearningPlan(id, plan);
        return updatedPlan != null
                ? ResponseEntity.ok(updatedPlan)
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteLearningPlan(@PathVariable String id) {
        learningPlanService.deleteLearningPlan(id);
        return ResponseEntity.noContent().build();
    }
}