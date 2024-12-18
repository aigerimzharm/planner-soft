package ru.javabegin.micro.planner.plannergateway.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration // данный класс будет считан как конфиг для spring контейнера
public class CorsConfig{

    @Value("${client.url}")
    private String clientURL; // клиентский URL

    @Bean
    public CorsWebFilter corsFilter() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowCredentials(true);
        configuration.setAllowedOrigins(Arrays.asList(clientURL));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return new CorsWebFilter(source);
    }



}
