package com.cookBook.App.controller;

import com.cookBook.App.model.Like;
import com.cookBook.App.model.NotificationMessage;
import com.cookBook.App.model.Post;
import com.cookBook.App.repository.LikeRepository;
import com.cookBook.App.repository.PostRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "*")
public class LikeController {

    private final LikeRepository likeRepo;
    private final PostRepository postRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public LikeController(LikeRepository likeRepo, PostRepository postRepo, SimpMessagingTemplate messagingTemplate) {
        this.likeRepo = likeRepo;
        this.postRepo = postRepo;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
    public ResponseEntity<?> likePost(@RequestBody Like like) {
        if (like.getPost() == null || like.getPost().getId() == null) { // Fixed condition
            return ResponseEntity.badRequest().body("Post ID is required");
        }

        Optional<Post> postOptional = postRepo.findById(like.getPost().getId());
        if (!postOptional.isPresent()) {
            return ResponseEntity.badRequest().body("Post not found");
        }

        Optional<Like> existing = likeRepo.findByPostAndUserId(postOptional.get(), like.getUserId());
        if (existing.isPresent()) {
            return ResponseEntity.ok("Already liked");
        }

        like.setPost(postOptional.get());
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
        Optional<Post> postOptional = postRepo.findById(postId);
        if (!postOptional.isPresent()) {
            return ResponseEntity.badRequest().body(0L);
        }
        return ResponseEntity.ok(likeRepo.countByPost(postOptional.get()));
    }

    @GetMapping("/{postId}/user/{userId}")
    public ResponseEntity<Boolean> isLiked(@PathVariable String postId, @PathVariable String userId) {
        Optional<Post> postOptional = postRepo.findById(postId);
        if (!postOptional.isPresent()) {
            return ResponseEntity.badRequest().body(false);
        }
        return ResponseEntity.ok(likeRepo.findByPostAndUserId(postOptional.get(), userId).isPresent());
    }
}