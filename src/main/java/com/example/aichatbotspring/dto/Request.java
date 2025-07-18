package com.example.aichatbotspring.dto;

import com.example.aichatbotspring.vo.Message;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Request {
    private String model;
    private List<Message> messages;

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Drag{
        private String model;
        private String input;
    }
}
