package com.cookBook.App.controller;

import com.cookBook.App.model.Like;
import com.cookBook.App.model.NotificationMessage;
import com.cookBook.App.repository.LikeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "*")
public class LikeController {

    private final LikeRepository likeRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public LikeController(LikeRepository likeRepo, SimpMessagingTemplate messagingTemplate) {
        this.likeRepo = likeRepo;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping

    public ResponseEntity<?> likePost(@RequestBody Like like) {
        Optional<Like> existing = likeRepo.findByPostIdAndUserId(like.getPostId(), like.getUserId());
        if (existing.isPresent()) {
            return ResponseEntity.ok("Already liked");
        }

        Like savedLike = likeRepo.save(like);

        NotificationMessage notification = new NotificationMessage(
                "LIKE",
                like.getUser(),  // ✅ display name for frontend
                null
        );
        messagingTemplate.convertAndSend("/topic/notifications", notification);

        return ResponseEntity.ok(savedLike);
    }


    @GetMapping("/{postId}/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable String postId) {
        return ResponseEntity.ok(likeRepo.countByPostId(postId));
    }

    @GetMapping("/{postId}/user/{userId}")
    public ResponseEntity<Boolean> isLiked(@PathVariable String postId, @PathVariable String userId) {
        return ResponseEntity.ok(likeRepo.findByPostIdAndUserId(postId, userId).isPresent());
    }
}
