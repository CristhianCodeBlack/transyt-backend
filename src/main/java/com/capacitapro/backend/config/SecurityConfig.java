package com.capacitapro.backend.config;

import com.capacitapro.backend.security.JwtAuthFilter;
import com.capacitapro.backend.service.impl.UsuarioServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;
import java.util.stream.Collectors;

@EnableMethodSecurity
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UsuarioServiceImpl usuarioService;
    
    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:5174,http://localhost:5175,https://transyt-frontend.onrender.com}")
    private String[] allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // Endpoints para empleados autenticados
                        .requestMatchers(HttpMethod.GET, "/api/cursos/**").hasAnyAuthority("ROLE_EMPLEADO", "ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/modulos/**").hasAnyAuthority("ROLE_EMPLEADO", "ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        .requestMatchers("/api/empleado/**").hasAnyAuthority("ROLE_EMPLEADO", "ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        .requestMatchers("/api/modulo-progreso/**").hasAnyAuthority("ROLE_EMPLEADO", "ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/certificados/**").hasAnyAuthority("ROLE_EMPLEADO", "ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        // Endpoints para instructores y admins
                        .requestMatchers("/api/evaluaciones/**").hasAnyAuthority("ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        .requestMatchers("/api/seguimiento-tests/**").hasAnyAuthority("ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        .requestMatchers("/api/capacitaciones-vivo/**").hasAnyAuthority("ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        .requestMatchers("/api/instructor-stats/**").hasAnyAuthority("ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        // Endpoints solo para admins
                        .requestMatchers(HttpMethod.POST, "/api/cursos/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/cursos/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/cursos/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/modulos/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/modulos/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/modulos/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/reportes/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/certificados/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/certificados/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/certificados/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/usuarios/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/files/**").hasAnyAuthority("ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        .anyRequest().authenticated()
                )
                .userDetailsService(usuarioService)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Aumentar rounds para mayor seguridad
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Separar los orígenes por comas y limpiar espacios
        java.util.List<String> origins = java.util.Arrays.stream(allowedOrigins)
            .flatMap(origin -> java.util.Arrays.stream(origin.split(",")))
            .map(String::trim)
            .collect(java.util.stream.Collectors.toList());
            
        configuration.setAllowedOrigins(origins);
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight por 1 hora

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
