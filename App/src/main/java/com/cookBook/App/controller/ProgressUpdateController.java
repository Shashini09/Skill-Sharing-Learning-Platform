package com.cookBook.App.controller;


import com.cookBook.App.model.ProgressUpdate;
import com.cookBook.App.service.ProgressUpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress-updates")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProgressUpdateController {

    @Autowired
    private ProgressUpdateService progressUpdateService;

    @PostMapping("/create")
    public ResponseEntity<?> createProgressUpdate(@RequestBody ProgressUpdateRequest request) {
        try {
            ProgressUpdate progressUpdate = progressUpdateService.createProgressUpdate(
                    request.getUserId(),
                    request.getTemplateType(),
                    request.getContent(),
                    request.getLearningPlanId()
            );
            return ResponseEntity.ok(progressUpdate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DTO for request body
    public static class ProgressUpdateRequest {
        private String userId;
        private String templateType;
        private String content;
        private String learningPlanId;

        // Getters and Setters
        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getTemplateType() {
            return templateType;
        }

        public void setTemplateType(String templateType) {
            this.templateType = templateType;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getLearningPlanId() {
            return learningPlanId;
        }

        public void setLearningPlanId(String learningPlanId) {
            this.learningPlanId = learningPlanId;
        }
    }
}