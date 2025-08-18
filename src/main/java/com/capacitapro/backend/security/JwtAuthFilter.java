package com.capacitapro.backend.security;

import com.capacitapro.backend.service.impl.UsuarioServiceImpl;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.util.List;


import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioServiceImpl usuarioService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        if (path.startsWith("/api/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        final String token;
        final String correo;

        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        token = authHeader.substring(7);
        
        try {
            correo = jwtUtil.getCorreoFromToken(token);
            
            if (correo != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                var userDetails = usuarioService.loadUserByUsername(correo);
                if (jwtUtil.isTokenValid(token)) {
                    String rol = jwtUtil.getRolFromToken(token);
                    System.out.println("Rol del token: " + rol);
                    var authority = new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + rol);
                    System.out.println("Authority creada: " + authority.getAuthority());

                    var authToken = new UsernamePasswordAuthenticationToken(userDetails, null, List.of(authority));
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token is invalid, continue without authentication
        }

        filterChain.doFilter(request, response);
    }

}
