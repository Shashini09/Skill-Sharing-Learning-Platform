package com.cookBook.App.service;

import com.cookBook.App.model.Post;
import com.cookBook.App.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    public Post createPost(Post post) {
        post.setTimestamp(LocalDateTime.now());
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Optional<Post> getPostById(String id) {
        return postRepository.findById(id);
    }

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
}
