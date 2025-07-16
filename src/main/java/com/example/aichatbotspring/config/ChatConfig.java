package com.example.aichatbotspring.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class ChatConfig {
    @Bean
    public RestTemplate RestTemplate() {
        return new RestTemplate();
    }

    @Bean
    public ObjectMapper ObjectMapper() {
        return new ObjectMapper();
    }
}
