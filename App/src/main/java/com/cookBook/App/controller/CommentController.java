
package com.cookBook.App.controller;

import com.cookBook.App.model.Comment;
import com.cookBook.App.repository.CommentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentRepository commentRepo;

    public CommentController(CommentRepository commentRepo) {
        this.commentRepo = commentRepo;
    }

    // ✅ Create comment
    @PostMapping
    public ResponseEntity<Comment> createComment(@RequestBody Comment comment) {
        comment.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(commentRepo.save(comment));
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


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable String id) {
        if (!commentRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        commentRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
