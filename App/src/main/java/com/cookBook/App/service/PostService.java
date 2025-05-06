package com.cookBook.App.service;

import com.cookBook.App.model.Post;

import com.cookBook.App.model.User;
import com.cookBook.App.repository.PostRepository;
import com.cookBook.App.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import java.util.stream.Collectors;


@Service
public class PostService {


    private static final Logger logger = LoggerFactory.getLogger(PostService.class);

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;


    public Post createPost(Post post) {
        post.setTimestamp(LocalDateTime.now());
        return postRepository.save(post);
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
                post.setUserName(user.isPresent() ? user.get().getName() : "Anonymous");
            } catch (Exception e) {
                logger.error("Error processing post {}: {}", post.getId(), e.getMessage(), e);
                post.setUserName("Anonymous");
            }
            return post;
        }).collect(Collectors.toList());
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
                p.setUserName(user.isPresent() ? user.get().getName() : "Anonymous");
            } catch (Exception e) {
                logger.error("Error processing post {}: {}", p.getId(), e.getMessage(), e);
                p.setUserName("Anonymous");
            }
        });
        return post;

    public Post updatePost(String id, Post updatedPost) {
        return postRepository.findById(id).map(post -> {
            post.setTopic(updatedPost.getTopic());
            post.setDescription(updatedPost.getDescription());
            post.setMediaUrls(updatedPost.getMediaUrls());
            post.setMediaTypes(updatedPost.getMediaTypes());
            post.setPrivate(updatedPost.isPrivate());
            post.setTaggedFriends(updatedPost.getTaggedFriends());
            post.setLocation(updatedPost.getLocation());
            return postRepository.save(post);
        }).orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);

}

