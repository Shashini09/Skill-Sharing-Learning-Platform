package com.cookBook.App.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "likes")
public class Like {

    @Id
    private String id; // 🛠️ fixed from Long to String
    private  String user;
    private String postId;
    private  String  userId;
    private LocalDateTime timestamp;


    public Like() {}

    public Like(String postId, String user) {
        this.postId = postId;
        this.user = user;
        this.timestamp = LocalDateTime.now();
    }

    public String getUser() {return user; }
    public String getPostId() { return postId; }
   public String getUserId() {return  userId;}
    public LocalDateTime getTimestamp() { return timestamp; }

   public  void setUserId(String userId) {this.userId= userId;}
    public  void  setUser(String user) {this.user = user; }
    public void setPostId(String postId) { this.postId = postId; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
