
package com.cookBook.App.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;


import java.time.LocalDateTime;

@Document(collection = "comments")

public class Comment {

    @Id
   // @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    private String postId;
    private String user;
    private String text;
    private LocalDateTime timestamp;

    public Comment() {}

    public Comment(String postId, String user, String text) {
        this.postId = postId;
        this.user = user;
        this.text = text;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}