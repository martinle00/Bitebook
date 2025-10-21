package com.bitebook.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {

//        String localhostUrl = parameterStoreService.getSecret("LocalHostURL");
//        String prodUrl = parameterStoreService.getSecret("ProdURL");
        String localhostUrl = "http://localhost:3000";
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin(localhostUrl);
        // config.addAllowedOrigin(prodUrl);
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}