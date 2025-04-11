package com.cookBook.App.repository;

import com.cookBook.App.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderId(String providerId);
    List<User> findByIdIn(List<String> ids);
}
