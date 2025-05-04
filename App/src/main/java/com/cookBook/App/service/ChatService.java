package com.cookBook.App.service;

import com.cookBook.App.model.ChatMessage;
import com.cookBook.App.model.User;
import com.cookBook.App.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserService userService;

    public void sendMessage(String providerId, String content) {
        try {
            // Find user by providerId (OAuth principal)
            User sender = userService.findByProviderId(providerId);
            if (sender == null) {
                throw new IllegalArgumentException("User not found for providerId: " + providerId);
            }

            ChatMessage message = new ChatMessage(
                    sender.getId(), // Use MongoDB _id as senderId
                    sender.getName(),
                    content,
                    LocalDateTime.now()
            );

            // Save to MongoDB
            ChatMessage savedMessage = chatMessageRepository.save(message);
            System.out.println("Saved message to DB: " + savedMessage.getId());

            // Broadcast to all subscribers
            messagingTemplate.convertAndSend("/topic/groupchat", savedMessage);
        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send message", e);
        }
    }

    public List<ChatMessage> getRecentMessages() {
        return chatMessageRepository.findTop20ByOrderByTimestampDesc();
    }
}