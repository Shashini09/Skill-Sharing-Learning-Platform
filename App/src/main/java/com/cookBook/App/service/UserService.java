package com.cookBook.App.service;

import com.cookBook.App.model.User;
import com.cookBook.App.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get a user by ID
    public Optional<User> getUserById(String id) {
        if (id == null || id.trim().isEmpty()) {
            return Optional.empty();
        }
        return userRepository.findById(id);
    }

    // Update user details
    public User updateUser(String id, User userDetails) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        return userRepository.findById(id).map(user -> {
            user.setName(userDetails.getName());
            user.setEmail(userDetails.getEmail());
            user.setPicture(userDetails.getPicture());
            user.setBirthday(userDetails.getBirthday());
            user.setAbout(userDetails.getAbout());
            return userRepository.save(user);
        }).orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
    }

    // Find user by providerId (OAuth2 principal)
    public User findByProviderId(String providerId) {
        if (providerId == null || providerId.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid provider ID");
        }
        return userRepository.findByProviderId(providerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with providerId: " + providerId));
    }

    // Add a user to the current user's following list
    public User followUser(String principal, String userIdToFollow) {
        // Validate inputs
        if (principal == null || principal.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid principal");
        }
        if (userIdToFollow == null || userIdToFollow.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid user ID to follow");
        }

        // Find the current user by providerId (OAuth2 principal)
        User currentUser = findByProviderId(principal);

        // Check if the user to follow exists
        User userToFollow = userRepository.findById(userIdToFollow)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userIdToFollow));

        // Prevent self-following
        if (currentUser.getId().equals(userIdToFollow)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }

        // Add userIdToFollow to the current user's following list if not already present
        List<String> following = currentUser.getFollowing();
        if (!following.contains(userIdToFollow)) {
            following.add(userIdToFollow);
            currentUser.setFollowing(following);
        }

        // Add current user to the userToFollow's followers list if not already present
        List<String> followers = userToFollow.getFollowers();
        if (!followers.contains(currentUser.getId())) {
            followers.add(currentUser.getId());
            userToFollow.setFollowers(followers);
            userRepository.save(userToFollow); // Save the followed user
        }

        // Save and return the updated current user
        return userRepository.save(currentUser);
    }

    // Get followers' details by their IDs
    public List<User> getFollowersByIds(List<String> followerIds) {
        if (followerIds == null || followerIds.isEmpty()) {
            return List.of();
        }
        // Filter out invalid IDs
        List<String> validIds = followerIds.stream()
                .filter(id -> id != null && !id.trim().isEmpty())
                .toList();
        return userRepository.findByIdIn(validIds);
    }

    // Get following users' details by their IDs
    public List<User> getFollowingByIds(List<String> followingIds) {
        if (followingIds == null || followingIds.isEmpty()) {
            return List.of();
        }
        // Filter out invalid IDs
        List<String> validIds = followingIds.stream()
                .filter(id -> id != null && !id.trim().isEmpty())
                .toList();
        return userRepository.findByIdIn(validIds);
    }
}