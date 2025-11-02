package com.bitebook.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.bitebook.Services.ParameterStoreService;

@Configuration
public class CorsConfig {

    @Autowired
    ParameterStoreService parameterStoreService;

    @Bean
    public CorsFilter corsFilter() {

        String localhostUrl = parameterStoreService.getSecret("LocalHostURL");
        String prodUrl = parameterStoreService.getSecret("BitebookProd");
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin(localhostUrl);
        config.addAllowedOrigin(prodUrl);
        config.addAllowedOrigin("http://3.107.47.27/");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}