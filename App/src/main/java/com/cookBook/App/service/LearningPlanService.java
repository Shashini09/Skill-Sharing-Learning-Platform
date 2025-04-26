package com.cookBook.App.service;

import com.cookBook.App.model.LearningPlan;
import com.cookBook.App.repository.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LearningPlanService {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    public List<LearningPlan> getAllLearningPlans() {
        return learningPlanRepository.findAll();
    }

    public List<LearningPlan> getLearningPlansByUserId(String userId) {
        return learningPlanRepository.findByUserid(userId);
    }

    public Optional<LearningPlan> getLearningPlanById(String id) {
        return learningPlanRepository.findById(id);
    }

    public LearningPlan createLearningPlan(LearningPlan plan) {
        return learningPlanRepository.save(plan);
    }

    public LearningPlan updateLearningPlan(String id, LearningPlan updatedPlan) {
        return learningPlanRepository.findById(id).map(existingPlan -> {
            existingPlan.setTitle(updatedPlan.getTitle());
            existingPlan.setDescription(updatedPlan.getDescription());
            existingPlan.setStartDate(updatedPlan.getStartDate());
            existingPlan.setActivities(updatedPlan.getActivities());
            existingPlan.setUserid(updatedPlan.getUserid());
            return learningPlanRepository.save(existingPlan);
        }).orElse(null);
    }

    public void deleteLearningPlan(String id) {
        learningPlanRepository.deleteById(id);
    }
}