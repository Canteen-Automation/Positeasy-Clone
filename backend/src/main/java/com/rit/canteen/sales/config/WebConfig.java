package com.rit.canteen.sales.config;

import org.springframework.context.annotation.Configuration;

/**
 * WebConfig intentionally left minimal.
 * CORS is now fully managed by SecurityConfig.corsConfigurationSource()
 * to avoid duplicate/conflicting CORS headers.
 */
@Configuration
public class WebConfig {
    // CORS handled by SecurityConfig — do not add CorsRegistry here
}
