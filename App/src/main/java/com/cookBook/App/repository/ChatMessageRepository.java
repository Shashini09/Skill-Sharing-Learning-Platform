package com.cookBook.App.repository;

import com.cookBook.App.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findTop20ByOrderByTimestampDesc();
    Optional<ChatMessage> findByContentAndSenderIdAndTimestamp(String content, String senderId, LocalDateTime timestamp);
}