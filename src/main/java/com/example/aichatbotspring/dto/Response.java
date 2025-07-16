package com.example.aichatbotspring.dto;

import com.example.aichatbotspring.vo.Message;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Response {
    private List<Choice> choices;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Choice{
        private Integer index;
        private Message message;
        @JsonProperty("finish_reason")
        private String finishReason;
    }
}
