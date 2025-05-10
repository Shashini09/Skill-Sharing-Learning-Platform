
package com.cookBook.App.repository;

import com.cookBook.App.model.Comment;
import com.cookBook.App.model.Like;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;;

public interface LikeRepository extends MongoRepository<Like, String> {
    Optional<Like> findByPostIdAndUserId(String postId, String user);
    Long countByPostId(String postId);
}
