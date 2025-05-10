package com.cookBook.App.controller;

import com.cookBook.App.model.ChatMessage;
import com.cookBook.App.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload String content) {
        try {
            String principal = SecurityContextHolder.getContext().getAuthentication().getName();
            if (principal == null || principal.trim().isEmpty()) {
                throw new IllegalArgumentException("Authentication required");
            }
            System.out.println("Received message from " + principal + ": " + content);
            chatService.sendMessage(principal, content);
        } catch (Exception e) {
            System.err.println("Error processing message: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @MessageMapping("/updateMessage")
    public void updateMessage(@Payload UpdateMessagePayload payload) {
        try {
            String principal = SecurityContextHolder.getContext().getAuthentication().getName();
            if (principal == null || principal.trim().isEmpty()) {
                throw new IllegalArgumentException("Authentication required");
            }
            chatService.updateMessage(payload.getMessageId(), principal, payload.getContent());
        } catch (Exception e) {
            System.err.println("Error updating message: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @MessageMapping("/deleteMessage")
    public void deleteMessage(@Payload String messageId) {
        try {
            String principal = SecurityContextHolder.getContext().getAuthentication().getName();
            if (principal == null || principal.trim().isEmpty()) {
                throw new IllegalArgumentException("Authentication required");
            }
            System.out.println("Attempting to delete message: " + messageId + " by user: " + principal);
            chatService.deleteMessage(messageId, principal);
        } catch (Exception e) {
            System.err.println("Error deleting message: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public List<ChatMessage> getChatHistory() {
        return chatService.getRecentMessages();
    }
}

class UpdateMessagePayload {
    private String messageId;
    private String content;

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}