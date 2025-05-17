package com.cookBook.App.controller;

import com.cookBook.App.model.Like;
import com.cookBook.App.model.NotificationMessage;
import com.cookBook.App.model.Post;
import com.cookBook.App.repository.LikeRepository;
import com.cookBook.App.repository.PostRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

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
        if (like.getPost() == null || like.getPost().getId() == null) {
            return ResponseEntity.badRequest().body("Post ID is required");
        }

        Optional<Post> postOptional = postRepo.findById(like.getPost().getId());
        if (!postOptional.isPresent()) {
            return ResponseEntity.badRequest().body("Post not found");
        }

        Post post = postOptional.get();
        Optional<Like> existing = likeRepo.findByPostAndUserId(post, like.getUserId());
        if (existing.isPresent()) {
            return ResponseEntity.ok("Already liked");
        }

        like.setPost(post);
        like.setPostCategory(post.getCategory()); // Explicitly set postCategory
        Like savedLike = likeRepo.save(like);

        NotificationMessage notification = new NotificationMessage(
                "LIKE",
                like.getUser(),
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
        if (userId == null) {
            return ResponseEntity.badRequest().body(false);
        }
        Optional<Post> postOptional = postRepo.findById(postId);
        if (!postOptional.isPresent()) {
            return ResponseEntity.badRequest().body(false);
        }
        return ResponseEntity.ok(likeRepo.findByPostAndUserId(postOptional.get(), userId).isPresent());
    }

    @GetMapping("/recommended/{userId}")
    public ResponseEntity<List<Post>> getRecommendedPosts(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            // Fetch user likes
            List<Like> userLikes = likeRepo.findByUserId(userId);
            System.out.println("User " + userId + " likes: " + userLikes.size()); // Debug log

            // Count likes per category
            Map<String, Long> categoryCounts = userLikes.stream()
                    .filter(like -> like.getPostCategory() != null)
                    .collect(Collectors.groupingBy(
                            Like::getPostCategory,
                            Collectors.counting()
                    ));
            System.out.println("Category counts: " + categoryCounts); // Debug log

            // Sort categories by like count (descending)
            List<String> preferredCategories = categoryCounts.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
            System.out.println("Preferred categories: " + preferredCategories); // Debug log

            // Fetch posts with pagination
            Pageable pageable = PageRequest.of(page, size);
            List<Post> allPosts = postRepo.findAll(pageable).getContent();
            List<Post> recommendedPosts = new ArrayList<>();
            Set<String> addedPostIds = new HashSet<>();

            // Helper function to sort posts by like count and timestamp
            Comparator<Post> postComparator = (a, b) -> {
                long likesA = likeRepo.countByPost(a);
                long likesB = likeRepo.countByPost(b);
                if (likesB != likesA) {
                    return Long.compare(likesB, likesA); // Sort by likes descending
                }
                return b.getTimestamp().compareTo(a.getTimestamp()); // Break ties by timestamp
            };

            // Add posts from preferred categories
            for (String category : preferredCategories) {
                List<Post> categoryPosts = allPosts.stream()
                        .filter(post -> category.equals(post.getCategory()) && !addedPostIds.contains(post.getId()))
                        .sorted(postComparator)
                        .collect(Collectors.toList());
                System.out.println("Posts in " + category + ": " + categoryPosts.size()); // Debug log
                recommendedPosts.addAll(categoryPosts);
                categoryPosts.forEach(post -> addedPostIds.add(post.getId()));
            }

            // Add remaining posts
            List<Post> otherPosts = allPosts.stream()
                    .filter(post -> !addedPostIds.contains(post.getId()))
                    .sorted(postComparator)
                    .collect(Collectors.toList());
            recommendedPosts.addAll(otherPosts);

            System.out.println("Total recommended posts: " + recommendedPosts.size()); // Debug log
            return ResponseEntity.ok(recommendedPosts);
        } catch (Exception e) {
            System.err.println("Error in getRecommendedPosts: " + e.getMessage());
            return ResponseEntity.status(500).body(Collections.emptyList());
        }
    }
}