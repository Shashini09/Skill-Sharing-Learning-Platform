package com.cookBook.App.repository;

import com.cookBook.App.model.Like;
import com.cookBook.App.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface LikeRepository extends MongoRepository<Like, String> {
    Optional<Like> findByPostAndUserId(Post post, String userId);
    Long countByPost(Post post);
    List<Like> findByUserId(String userId);
}