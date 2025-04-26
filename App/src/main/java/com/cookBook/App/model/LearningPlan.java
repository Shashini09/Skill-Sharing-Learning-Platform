package com.cookBook.App.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "learning_plans")
public class LearningPlan {

    @Id
    private String id;
    private String userid;// Unique identifier
    private String title;           // Title of the learning plan
    private String description;     // Description of the learning plan
    private Date startDate;         // Start date for the learning plan
    private List<Activity> activities; // List of activities

    // Constructors
    public LearningPlan() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    public void setUserid(String userid) {
        this.userid = userid;
    }

    public String getUserid() {
        return userid;
    }



    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public Date getStartDate() {
        return startDate;
    }
    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public List<Activity> getActivities() {
        return activities;
    }
    public void setActivities(List<Activity> activities) {
        this.activities = activities;
    }

    // Nested Activity class
    public static class Activity {
        private String topic;                   // Topic of the activity
        private String description;            // Description of the activity
        private List<Resource> resources;      // List of resources

        // Getters and Setters
        public String getTopic() {
            return topic;
        }
        public void setTopic(String topic) {
            this.topic = topic;
        }

        public String getDescription() {
            return description;
        }
        public void setDescription(String description) {
            this.description = description;
        }

        public List<Resource> getResources() {
            return resources;
        }
        public void setResources(List<Resource> resources) {
            this.resources = resources;
        }
    }

    // Nested Resource class
    public static class Resource {
        private String title;   // Resource title
        private String url;     // Resource URL

        // Getters and Setters
        public String getTitle() {
            return title;
        }
        public void setTitle(String title) {
            this.title = title;
        }

        public String getUrl() {
            return url;
        }
        public void setUrl(String url) {
            this.url = url;
        }
    }
}
