package com.cookBook.App.service;

import com.cookBook.App.model.LearningPlan;
import com.cookBook.App.model.ProgressUpdate;
import com.cookBook.App.model.User;
import com.cookBook.App.repository.LearningPlanRepository;
import com.cookBook.App.repository.ProgressUpdateRepository;
import com.cookBook.App.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ProgressUpdateService {

    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    public ProgressUpdate createProgressUpdate(String userId, String templateType, String content, String learningPlanId) throws Exception {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            throw new Exception("User not found");
        }

        Optional<LearningPlan> learningPlanOptional = learningPlanRepository.findById(learningPlanId);
        if (!learningPlanOptional.isPresent()) {
            throw new Exception("Learning Plan not found");
        }

        ProgressUpdate progressUpdate = new ProgressUpdate();
        progressUpdate.setUser(userOptional.get());
        progressUpdate.setLearningPlan(learningPlanOptional.get());
        progressUpdate.setTemplateType(templateType);
        progressUpdate.setContent(content);
        progressUpdate.setCreatedAt(new Date());

        return progressUpdateRepository.save(progressUpdate);
    }

    public List<ProgressUpdate> getAllProgressUpdates() {
        return progressUpdateRepository.findAll();
    }
}