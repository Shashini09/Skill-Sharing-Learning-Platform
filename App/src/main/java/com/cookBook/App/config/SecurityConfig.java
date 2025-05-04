//package com.cookBook.App.config;
//
//
//import com.cookBook.App.service.AuthService;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
//import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
//import org.springframework.security.web.authentication.logout.LogoutHandler;
//import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//
//import java.util.List;
//
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity
//public class SecurityConfig {
//
//    @Autowired
//    private AuthService authService;
//
//    @Value("${frontend.url:http://localhost:5173}") // Inject frontend URL from properties
//    private String frontendUrl;
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                // CORS configuration: Allows cross-origin requests from the specified frontend URL
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//
//                // Disabling CSRF as this is a stateless application (no browser form-based login)
//                .csrf(csrf -> csrf.disable())
//
//                // Session management: Using session creation policy as required and applying session fixation protection
//                .sessionManagement(session -> session
//                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
//                        .sessionFixation().migrateSession() // Prevents session fixation attacks by migrating the session
//                )
//
//                // Authorization rules: Define which URLs can be accessed and who can access them
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/login", "/error", "/api/auth/user").permitAll() // Public endpoints
//                        .requestMatchers("/user/profile", "/logout").authenticated() // Requires authentication for these endpoints
//                        .anyRequest().authenticated() // All other requests require authentication
//                )
//
//                // OAuth2 login configuration: Sets up OAuth2 login with a custom user service
//                .oauth2Login(oauth2 -> oauth2
//                        .userInfoEndpoint(userInfo -> userInfo.userService(authService)) // Use AuthService for user info retrieval
//                        .successHandler((request, response, authentication) -> {
//                            request.getSession().setAttribute("user", authentication.getPrincipal()); // Store authenticated user in session
//                            String redirectUrl = (String) request.getSession().getAttribute("redirectAfterLogin"); // Get redirect URL from session
//                            if (redirectUrl == null) {
//                                redirectUrl = frontendUrl + "/profile"; // Default redirect if no URL is stored
//                            }
//                            System.out.println("OAuth Success - Redirecting to: " + redirectUrl); // Log the redirect URL
//                            response.sendRedirect(redirectUrl); // Redirect to the appropriate page
//                        })
//                        .failureUrl("/login?error=true") // Redirect URL on OAuth failure
//                )
//
//                // Logout configuration: Customizes logout behavior and handles session invalidation and cookie deletion
//                .logout(logout -> logout
//                        .logoutUrl("/logout") // URL for logging out
//                        .invalidateHttpSession(true) // Invalidate the HTTP session
//                        .clearAuthentication(true) // Clear authentication information
//                        .deleteCookies("JSESSIONID") // Delete session cookie
//                        .addLogoutHandler(logoutHandler()) // Add a custom logout handler
//                        .logoutSuccessHandler((request, response, authentication) -> {
//                            response.setStatus(HttpServletResponse.SC_OK); // Set successful logout status
//                            response.getWriter().write("Logout successful"); // Write response message
//                        })
//                        .permitAll() // Allow everyone to access the logout URL
//                )
//
//                // Exception handling configuration: Customizes the response when authentication fails
//                .exceptionHandling(exception -> exception
//                        .authenticationEntryPoint((request, response, authException) -> {
//                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"); // Send unauthorized error
//                        })
//                );
//
//        return http.build(); // Builds and returns the security filter chain
//    }
//
//    // Bean for the logout handler, to handle user logout
//    @Bean
//    public LogoutHandler logoutHandler() {
//        return new SecurityContextLogoutHandler(); // Default logout handler that clears security context
//    }
//
//    // CORS configuration to allow cross-origin requests from the frontend URL
//    @Bean
//    public CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//        configuration.setAllowedOrigins(List.of(frontendUrl)); // Allow requests only from the frontend URL
//        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Define allowed HTTP methods
//        configuration.setAllowedHeaders(List.of("*")); // Allow any headers in the request
//        configuration.setAllowCredentials(true); // Allow credentials (cookies, authorization headers, etc.)
//        configuration.setExposedHeaders(List.of("Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials")); // Expose certain headers to the frontend
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration); // Register CORS configuration for all endpoints
//        return source; // Return the CORS configuration source
//
//    }
//    }
//
//
//

package com.cookBook.App.config;

import com.cookBook.App.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private AuthService authService;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                        .sessionFixation().migrateSession()
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login", "/error", "/api/auth/user").permitAll()
                        .requestMatchers("/user/profile", "/logout", "/messages/**").authenticated() // Add /messages/**
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(authService))
                        .successHandler((request, response, authentication) -> {
                            request.getSession().setAttribute("user", authentication.getPrincipal());
                            String redirectUrl = (String) request.getSession().getAttribute("redirectAfterLogin");
                            if (redirectUrl == null) {
                                redirectUrl = frontendUrl + "/profile";
                            }
                            System.out.println("OAuth Success - Redirecting to: " + redirectUrl);
                            response.sendRedirect(redirectUrl);
                        })
                        .failureUrl("/login?error=true")
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .addLogoutHandler(logoutHandler())
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(HttpServletResponse.SC_OK);
                            response.getWriter().write("Logout successful");
                        })
                        .permitAll()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                );

        return http.build();
    }

    @Bean
    public LogoutHandler logoutHandler() {
        return new SecurityContextLogoutHandler();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(frontendUrl));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}