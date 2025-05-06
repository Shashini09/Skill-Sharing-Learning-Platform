package com.cookBook.App.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "likes")
public class Like {

    @Id
    private String id; // 🛠️ fixed from Long to String

    private String postId;
    private String userId;
    private LocalDateTime timestamp;

    public String getPostId() { return postId; }
    public String getUserId() { return userId; }
    public LocalDateTime getTimestamp() { return timestamp; }

    public void setPostId(String postId) { this.postId = postId; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
