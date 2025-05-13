package com.cookBook.App.service;

import com.cookBook.App.model.Post;
import com.cookBook.App.model.User;
import com.cookBook.App.repository.PostRepository;
import com.cookBook.App.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostService.class);

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Post createPost(Post post) {
        if (post.getCategory() == null || post.getCategory().trim().isEmpty()) {
            post.setCategory("general"); // Default category
        }
        post.setTimestamp(LocalDateTime.now());
        Post savedPost = postRepository.save(post);
        logger.info("Created post with ID: {}", savedPost.getId());
        return savedPost;
    }

    public List<Post> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        return posts.stream().map(post -> {
            try {
                if (post.getUserId() == null) {
                    logger.warn("Post {} has null userId", post.getId());
                    post.setUserName("Anonymous");
                    return post;
                }
                Optional<User> user = userRepository.findById(post.getUserId());
                post.setUserName(user.map(User::getName).orElse("Anonymous"));
                return post;
            } catch (Exception e) {
                logger.error("Error processing post {}: {}", post.getId(), e.getMessage(), e);
                post.setUserName("Anonymous");
                return post;
            }
        }).toList();
    }

    public List<Post> getPostsByCategory(String category) {
        List<Post> posts = postRepository.findByCategory(category);
        return posts.stream().map(post -> {
            try {
                if (post.getUserId() == null) {
                    logger.warn("Post {} has null userId", post.getId());
                    post.setUserName("Anonymous");
                    return post;
                }
                Optional<User> user = userRepository.findById(post.getUserId());
                post.setUserName(user.map(User::getName).orElse("Anonymous"));
                return post;
            } catch (Exception e) {
                logger.error("Error processing post {}: {}", post.getId(), e.getMessage(), e);
                post.setUserName("Anonymous");
                return post;
            }
        }).toList();
    }

    public Optional<Post> getPostById(String id) {
        Optional<Post> post = postRepository.findById(id);
        post.ifPresent(p -> {
            try {
                if (p.getUserId() == null) {
                    logger.warn("Post {} has null userId", p.getId());
                    p.setUserName("Anonymous");
                    return;
                }
                Optional<User> user = userRepository.findById(p.getUserId());
                p.setUserName(user.map(User::getName).orElse("Anonymous"));
            } catch (Exception e) {
                logger.error("Error processing post {}: {}", p.getId(), e.getMessage(), e);
                p.setUserName("Anonymous");
            }
        });
        return post;
    }

    @Transactional
    public Post updatePost(String id, Post updatedPost) {
        return postRepository.findById(id).map(post -> {
            if (updatedPost.getTopic() != null) post.setTopic(updatedPost.getTopic());
            if (updatedPost.getDescription() != null) post.setDescription(updatedPost.getDescription());
            if (updatedPost.getCategory() != null) post.setCategory(updatedPost.getCategory());
            if (updatedPost.getMediaUrls() != null) post.setMediaUrls(updatedPost.getMediaUrls());
            if (updatedPost.getMediaTypes() != null) post.setMediaTypes(updatedPost.getMediaTypes());
            post.setPrivate(updatedPost.isPrivate());
            if (updatedPost.getTaggedFriends() != null) post.setTaggedFriends(updatedPost.getTaggedFriends());
            if (updatedPost.getLocation() != null) post.setLocation(updatedPost.getLocation());
            return postRepository.save(post);
        }).orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
    }

    @Transactional
    public void deletePost(String id) {
        if (!postRepository.existsById(id)) {
            throw new RuntimeException("Post not found with id: " + id);
        }
        postRepository.deleteById(id);
    }
}