package com.example.aichatbotspring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {
    @GetMapping("/chat-gpt")
    public String showChatbotPage(){
        return "chatbot";
    }
}
