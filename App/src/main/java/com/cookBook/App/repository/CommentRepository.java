
package com.cookBook.App.repository;

import com.cookBook.App.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends MongoRepository<Comment, String> {

    List<Comment> findByPostId(String PostId);
}