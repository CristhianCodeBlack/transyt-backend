package com.capacitapro.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

@Configuration
public class SecurityEnhancementConfig {

    @Bean
    public CommonsRequestLoggingFilter requestLoggingFilter() {
        CommonsRequestLoggingFilter loggingFilter = new CommonsRequestLoggingFilter();
        loggingFilter.setIncludeClientInfo(true);
        loggingFilter.setIncludeQueryString(false); // No logear query strings por seguridad
        loggingFilter.setIncludePayload(false); // No logear payload por seguridad
        loggingFilter.setIncludeHeaders(false); // No logear headers por seguridad
        loggingFilter.setMaxPayloadLength(0);
        return loggingFilter;
    }
}