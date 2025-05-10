package com.cookBook.App.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notification message")
public class NotificationMessage {
    private String type;
    private String user;
    private String text;

    public NotificationMessage() {
    }

    public NotificationMessage(String type, String user, String text) {
        this.type = type;
        this.user = user;
        this.text = text;
    }

    // Getter and Setter for 'type'
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    // Getter and Setter for 'user'
    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    // Getter and Setter for 'text'
    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
