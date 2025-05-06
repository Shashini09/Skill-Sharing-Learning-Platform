package com.cookBook.App.controller;

import com.cookBook.App.model.Comment;
import com.cookBook.App.model.Like;
import com.cookBook.App.repository.CommentRepository;
import com.cookBook.App.repository.LikeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "*")
public class LikeController {

    private final LikeRepository likeRepo;

    public LikeController(LikeRepository likeRepo) {
        this.likeRepo = likeRepo;
    }

    @PostMapping
    public ResponseEntity<?> likePost(@RequestBody Like like) {
        Optional<Like> existing = likeRepo.findByPostIdAndUserId(like.getPostId(), like.getUserId());
        if (existing.isPresent()) {
            return ResponseEntity.ok("Already liked");
        }
        return ResponseEntity.ok(likeRepo.save(like));
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
