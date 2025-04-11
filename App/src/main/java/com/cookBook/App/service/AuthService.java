package com.cookBook.App.service;

import com.cookBook.App.model.User;
import com.cookBook.App.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google" or "facebook"
        String providerId = "google".equals(provider) ? oAuth2User.getAttribute("sub") : oAuth2User.getAttribute("id");
        if (providerId == null) {
            throw new OAuth2AuthenticationException("Provider ID not found for " + provider);
        }

        String name = oAuth2User.getAttribute("name");
        String email = oAuth2User.getAttribute("email");
        String picture = oAuth2User.getAttribute("picture");

        // Check if user exists by providerId
        User user = userRepository.findByProviderId(providerId).orElse(null);

        if (user == null) {
            // Check if user exists by email (for users who might have signed up with different providers)
            Optional<User> existingUserByEmail = userRepository.findByEmail(email);
            if (existingUserByEmail.isPresent()) {
                // Update existing user with new provider info
                user = existingUserByEmail.get();
                user.setProviderId(providerId);
                user.setProvider(provider);
            } else {
                // Create new user
                user = new User();
                user.setProviderId(providerId);
                user.setProvider(provider);
                user.setName(name);
                user.setEmail(email);
                user.setPicture(picture);
            }
        } else {
            // Update syncable fields for existing user
            user.setEmail(email);
            if (user.getPicture() == null || user.getPicture().isEmpty()) {
                user.setPicture(picture);
            }
        }

        userRepository.save(user);
        return oAuth2User;
    }

    public Optional<User> findByProviderId(String providerId) {
        return userRepository.findByProviderId(providerId);
    }
}

