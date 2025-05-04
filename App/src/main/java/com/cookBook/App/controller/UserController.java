package com.cookBook.App.controller;

import com.cookBook.App.model.User;
import com.cookBook.App.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Get a user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        try {
            Optional<User> user = userService.getUserById(id);
            return user.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Update user details
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User userDetails) {
        try {
            User updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Delete a user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            String principal = SecurityContextHolder.getContext().getAuthentication().getName();
            if (principal == null || principal.trim().isEmpty()) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            userService.deleteUser(principal, id);
            return ResponseEntity.ok().body("User deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Follow a user
    @PostMapping("/{id}/follow")
    public ResponseEntity<?> followUser(@PathVariable String id) {
        try {
            String principal = SecurityContextHolder.getContext().getAuthentication().getName();
            if (principal == null || principal.trim().isEmpty()) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            System.out.println("Attempting to follow user " + id + " by principal " + principal);
            User updatedUser = userService.followUser(principal, id);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            System.out.println("Follow failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Unfollow a user
    @PostMapping("/{id}/unfollow")
    public ResponseEntity<?> unfollowUser(@PathVariable String id) {
        try {
            String principal = SecurityContextHolder.getContext().getAuthentication().getName();
            if (principal == null || principal.trim().isEmpty()) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            System.out.println("Attempting to unfollow user " + id + " by principal " + principal);
            User updatedUser = userService.unfollowUser(principal, id);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            System.out.println("Unfollow failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get followers' details for a user by ID
    @GetMapping("/{id}/followers")
    public ResponseEntity<List<User>> getFollowers(@PathVariable String id) {
        try {
            Optional<User> userOptional = userService.getUserById(id);
            if (userOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            User user = userOptional.get();
            List<String> followerIds = user.getFollowers();
            List<User> followers = userService.getFollowersByIds(followerIds);
            return ResponseEntity.ok(followers);
        } catch (IllegalArgumentException e) {
            System.out.println("Failed to fetch followers: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get the current user's followers
    @GetMapping("/me/followers")
    public ResponseEntity<List<User>> getCurrentUserFollowers() {
        try {
            String principal = SecurityContextHolder.getContext().getAuthentication().getName();
            if (principal == null || principal.trim().isEmpty()) {
                return ResponseEntity.status(401).body(null);
            }
            User user = userService.findByProviderId(principal);
            List<String> followerIds = user.getFollowers();
            List<User> followers = userService.getFollowersByIds(followerIds);
            return ResponseEntity.ok(followers);
        } catch (IllegalArgumentException e) {
            System.out.println("Failed to fetch current user's followers: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get the users the current user is following
    @GetMapping("/me/following")
    public ResponseEntity<List<User>> getCurrentUserFollowing() {
        try {
            String principal = SecurityContextHolder.getContext().getAuthentication().getName();
            if (principal == null || principal.trim().isEmpty()) {
                return ResponseEntity.status(401).body(null);
            }
            User user = userService.findByProviderId(principal);
            List<String> followingIds = user.getFollowing();
            List<User> following = userService.getFollowingByIds(followingIds);
            return ResponseEntity.ok(following);
        } catch (IllegalArgumentException e) {
            System.out.println("Failed to fetch current user's following: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }
}