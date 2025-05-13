package com.cookBook.App.repository;

import com.cookBook.App.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByUserName(String userName);
    List<Post> findByCategory(String category); // New method for category-based queries
}