package com.cookBook.App.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "likes")
public class Like {

    @Id
    private String id;
    private String user;

    @DBRef
    private Post post;
    private String postCategory; // New field to store Post's category
    private String userId;
    private LocalDateTime timestamp;

    public Like() {}

    public Like(Post post, String user, String userId) {
        this.post = post;
        this.postCategory = post != null ? post.getCategory() : null; // Set category from Post
        this.user = user;
        this.userId = userId;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }

    public Post getPost() { return post; }
    public void setPost(Post post) {
        this.post = post;
        this.postCategory = post != null ? post.getCategory() : null; // Update category when setting Post
    }

    public String getPostCategory() { return postCategory; }
    public void setPostCategory(String postCategory) { this.postCategory = postCategory; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    // Helper method for compatibility
    public String getPostId() { return post != null ? post.getId() : null; }
    public void setPostId(String postId) {
        if (post == null) post = new Post();
        post.setId(postId);
    }
}