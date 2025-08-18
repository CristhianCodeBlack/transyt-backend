package com.capacitapro.backend.service.impl;

import com.capacitapro.backend.entity.Usuario;
import com.capacitapro.backend.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + correo));

        return new User(usuario.getCorreo(), usuario.getClave(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getRol())));
    }
    // 🔽 Agregado este método para obtener el Usuario completo desde el Principal
    public Usuario getUsuarioFromPrincipal(Principal principal) {
        return usuarioRepository.findByCorreo(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + principal.getName()));
    }
}
