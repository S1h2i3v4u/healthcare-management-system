package com.healthcareapp.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.healthcareapp.security.CustomUserDetailsService;
import com.healthcareapp.security.JwtAuthFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    // ============================================================
    // PASSWORD ENCODER
    // ============================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ============================================================
    // AUTHENTICATION PROVIDER
    // ============================================================

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                        userDetailsService
                );

        provider.setPasswordEncoder(
                passwordEncoder()
        );

        return provider;
    }

    // ============================================================
    // AUTHENTICATION MANAGER
    // ============================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {

        return config.getAuthenticationManager();
    }

    // ============================================================
    // SECURITY FILTER CHAIN
    // ============================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // =================================================
                // CSRF
                // =================================================

                .csrf(csrf ->
                        csrf.disable()
                )

                // =================================================
                // CORS
                // =================================================

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                // =================================================
                // SESSION MANAGEMENT
                // =================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // =================================================
                // AUTHORIZATION RULES
                // =================================================

                .authorizeHttpRequests(auth -> auth

                        // =================================================
                        // AUTHENTICATION
                        // =================================================

                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // =================================================
                        // HOSPITALS
                        // =================================================

                        /*
                         * IMPORTANT:
                         *
                         * This specific admin GET rule MUST come before
                         * the general public hospitals GET rule.
                         */

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/hospitals/admin/**"
                        ).authenticated()

                        // Anyone can view hospitals
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/hospitals/**"
                        ).permitAll()

                        // Only ADMIN can create hospitals
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/hospitals/**"
                        ).hasRole("ADMIN")

                        // Only ADMIN can update hospitals
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/hospitals/**"
                        ).hasRole("ADMIN")

                        // Only ADMIN can patch hospitals
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/hospitals/**"
                        ).hasRole("ADMIN")

                        // Only ADMIN can delete hospitals
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/hospitals/**"
                        ).hasRole("ADMIN")

                        // =================================================
                        // DOCTORS
                        // =================================================

                        /*
                         * Specific authenticated doctor/patient endpoints
                         * should come before public doctor endpoints.
                         */

                        // Current doctor profile
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/doctors/me"
                        ).authenticated()

                        // =================================================
                        // SAVED DOCTORS
                        // =================================================

                        /*
                         * Saved doctors are private.
                         *
                         * Authentication is required here.
                         * The DoctorController additionally checks:
                         *
                         * @PreAuthorize("hasRole('PATIENT')")
                         *
                         * Therefore only PATIENT users can access it.
                         */

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/doctors/saved"
                        ).authenticated()

                        // Public doctor search
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/doctors"
                        ).permitAll()

                        // Public doctor profile
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/doctors/{id}"
                        ).permitAll()

                        // Public doctor availability
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/doctors/{id}/availability"
                        ).permitAll()

                        /*
                         * Doctor schedule management:
                         *
                         * POST /api/doctors/me/availability
                         * GET  /api/doctors/me/availability
                         * DELETE /api/doctors/me/availability/{id}
                         *
                         * These are authenticated here.
                         * @PreAuthorize("hasRole('DOCTOR')")
                         * in DoctorController performs the role check.
                         */

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/doctors/me/availability"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/doctors/me/availability"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/doctors/me/availability/**"
                        ).authenticated()

                        // Doctor hospital linking
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/doctors/me/hospitals/**"
                        ).authenticated()

                        // =================================================
                        // SWAGGER / OPENAPI
                        // =================================================

                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // =================================================
                        // EVERYTHING ELSE
                        // =================================================

                        .anyRequest().authenticated()
                )

                // =================================================
                // AUTHENTICATION PROVIDER
                // =================================================

                .authenticationProvider(
                        authenticationProvider()
                )

                // =================================================
                // JWT FILTER
                // =================================================

                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // ============================================================
    // CORS CONFIGURATION
    // ============================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "http://localhost:5175"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"
                )
        );

        configuration.setAllowCredentials(
                true
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}