package com.cookBook.App.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // Enable simple in-memory broker
        config.setApplicationDestinationPrefixes("/app"); // Prefix for client messages
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chat-websocket")
                .setAllowedOrigins("http://localhost:5173") // Adjust for production
                .withSockJS(); // Enable SockJS fallback
    }

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
                .simpDestMatchers("/app/**").authenticated() // Require authentication for sending messages
                .simpSubscribeDestMatchers("/topic/**").authenticated(); // Require authentication for subscribing
    }

    @Override
    protected boolean sameOriginDisabled() {
        return true; // Disable CSRF for WebSocket (enable in production with proper config)
    }
}