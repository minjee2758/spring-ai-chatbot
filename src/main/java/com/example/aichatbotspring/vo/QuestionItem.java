package com.example.aichatbotspring.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class QuestionItem {
    @JsonProperty("id")
    private String subject;

    @JsonProperty("question")
    private String description;

}
