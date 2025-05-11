package com.cookBook.App.controller;

import com.cookBook.App.model.Comment;
import com.cookBook.App.model.NotificationMessage;
import com.cookBook.App.repository.CommentRepository;
import com.cookBook.App.repository.PostRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.stream.Collectors;
import com.cookBook.App.model.Post;


import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentRepository commentRepo;
    private final SimpMessagingTemplate messagingTemplate;
    private final PostRepository postRepository;


    public CommentController(CommentRepository commentRepo, SimpMessagingTemplate messagingTemplate, PostRepository postRepository) {
        this.commentRepo = commentRepo;
        this.messagingTemplate = messagingTemplate;
        this.postRepository = postRepository;
    }

    // ✅ Create comment
    @PostMapping
    public ResponseEntity<Comment> createComment(@RequestBody Comment comment) {
        comment.setTimestamp(LocalDateTime.now());
        Comment savedComment = commentRepo.save(comment);

        // Send WebSocket notification
        NotificationMessage notification = new NotificationMessage(
                "COMMENT",
                comment.getUser(),  // assuming Comment has getAuthor()
                comment.getText()
        );
        messagingTemplate.convertAndSend("/topic/notifications", notification);

        return ResponseEntity.ok(savedComment);
    }



    // 📄 Get comments by postId
    @GetMapping("/{postId}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable String postId) {
        return ResponseEntity.ok(commentRepo.findByPostId(postId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable String id, @RequestBody Comment updatedComment) {
        return commentRepo.findById(id)
                .map(comment -> {
                    comment.setText(updatedComment.getText());
                    comment.setTimestamp(LocalDateTime.now());
                    return ResponseEntity.ok(commentRepo.save(comment));
                })
                .orElse(ResponseEntity.notFound().build());
    }


    // 🧑‍🤝‍🧑 Get close friends by userId (based on comment count)
    @GetMapping("/close-friends/by-user/{userName}")
    public ResponseEntity<?> getCloseFriendsByUsername(@PathVariable String userName) {
        List<Post> userPosts = postRepository.findByUserName(userName); // new field

        List<String> postIds = userPosts.stream().map(Post::getId).toList();
        List<Comment> allComments = commentRepo.findByPostIdIn(postIds);

        Map<String, Long> commentCounts = allComments.stream()
                .filter(comment -> !comment.getUser().equals(userName))
                .collect(Collectors.groupingBy(Comment::getUser, Collectors.counting()));

        List<Map.Entry<String, Long>> sortedFriends = commentCounts.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .toList();

        return ResponseEntity.ok(sortedFriends);
    }
    


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable String id) {
        if (!commentRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        commentRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
