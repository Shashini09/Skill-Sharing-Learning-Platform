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
            User sender = userService.findByProviderId(providerId);
            if (sender == null) {
                throw new IllegalArgumentException("User not found for providerId: " + providerId);
            }

            ChatMessage message = new ChatMessage(
                    sender.getId(),
                    sender.getName(),
                    content,
                    LocalDateTime.now()
            );

            ChatMessage savedMessage = chatMessageRepository.save(message);
            System.out.println("Saved message to DB: " + savedMessage.getId());

            messagingTemplate.convertAndSend("/topic/groupchat", savedMessage);
        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send message", e);
        }
    }

    public void updateMessage(String messageId, String providerId, String newContent) {
        try {
            User sender = userService.findByProviderId(providerId);
            if (sender == null) {
                throw new IllegalArgumentException("User not found for providerId: " + providerId);
            }

            ChatMessage message = chatMessageRepository.findById(messageId)
                    .orElseThrow(() -> new IllegalArgumentException("Message not found: " + messageId));

            if (!message.getSenderId().equals(sender.getId())) {
                throw new SecurityException("User not authorized to edit this message");
            }

            message.setContent(newContent);
            message.setTimestamp(LocalDateTime.now());

            ChatMessage updatedMessage = chatMessageRepository.save(message);
            messagingTemplate.convertAndSend("/topic/groupchat", updatedMessage);
        } catch (Exception e) {
            System.err.println("Error updating message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update message", e);
        }
    }

    public void deleteMessage(String messageId, String providerId) {
        try {
            User sender = userService.findByProviderId(providerId);
            if (sender == null) {
                throw new IllegalArgumentException("User not found for providerId: " + providerId);
            }

            ChatMessage message = chatMessageRepository.findById(messageId)
                    .orElseThrow(() -> new IllegalArgumentException("Message not found: " + messageId));

            if (!message.getSenderId().equals(sender.getId())) {
                throw new SecurityException("User not authorized to delete this message");
            }

            chatMessageRepository.deleteById(messageId);
            // Send a delete notification with the deleted message ID
            ChatMessage deleteNotification = new ChatMessage(
                    sender.getId(),
                    sender.getName(),
                    "[DELETED]",
                    LocalDateTime.now()
            );
            deleteNotification.setId(messageId); // Reuse the same ID for tracking
            messagingTemplate.convertAndSend("/topic/groupchat", deleteNotification);
        } catch (Exception e) {
            System.err.println("Error deleting message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete message", e);
        }
    }

    public List<ChatMessage> getRecentMessages() {
        return chatMessageRepository.findTop20ByOrderByTimestampDesc();
    }
}