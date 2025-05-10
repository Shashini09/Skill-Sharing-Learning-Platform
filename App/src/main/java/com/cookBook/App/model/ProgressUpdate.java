package com.cookBook.App.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "progress_updates")
public class ProgressUpdate {

        @Id
        private String id;
        private String content;
        private String templateType;
        @DBRef
        private User user;
        @DBRef
        private LearningPlan learningPlan;
        private Date createdAt;

        // Default constructor
        public ProgressUpdate() {
            this.createdAt = new Date();
        }

        // Constructor
        public ProgressUpdate(String content, String templateType, User user, LearningPlan learningPlan) {
            this.content = content;
            this.templateType = templateType;
            this.user = user;
            this.learningPlan = learningPlan;
            this.createdAt = new Date();
        }

        // Getters and Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getTemplateType() {
            return templateType;
        }

        public void setTemplateType(String templateType) {
            this.templateType = templateType;
        }

        public User getUser() {
            return user;
        }

        public void setUser(User user) {
            this.user = user;
        }

        public LearningPlan getLearningPlan() {
            return learningPlan;
        }

        public void setLearningPlan(LearningPlan learningPlan) {
            this.learningPlan = learningPlan;
        }

        public Date getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Date createdAt) {
            this.createdAt = createdAt;
        }



    }