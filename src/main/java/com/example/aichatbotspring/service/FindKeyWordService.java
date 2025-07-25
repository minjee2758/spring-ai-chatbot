package com.example.aichatbotspring.service;

import com.example.aichatbotspring.vo.QuestionItem;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class FindKeyWordService {

    private List<QuestionItem> questionItemList;
    private List<String> subjects;
    private final ObjectMapper objectMapper;

    public FindKeyWordService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void initExplanations() {
        try {
            ClassPathResource resource = new ClassPathResource("excellence/excellence_e1.json");
            try (InputStream inputStream = resource.getInputStream()) {
                questionItemList = objectMapper.readValue(inputStream, new TypeReference<List<QuestionItem>>() {});
                log.info("excellence_e1.json 파일이 성공적으로 로드되었습니다. 항목 수: {}", questionItemList.size());
            }
        } catch (IOException e) {
            log.error("excellence_e1.json 파일을 찾거나 읽는 데 실패했습니다. 파일 경로를 확인해주세요.", e);
            questionItemList = List.of();
        }
    }

    @PostConstruct
    public void initSubject() {
        try {
            ClassPathResource resource = new ClassPathResource("excellence/excellence_e1_id.json");
            try (InputStream inputStream = resource.getInputStream()) {
                subjects = objectMapper.readValue(inputStream, new TypeReference<>() {
                });
            }
        } catch (IOException e) {
            log.error("리스트로 초기화 실패", e);
            subjects = List.of(); // 오류 시 빈 리스트로 초기화
        }

    }


    public String find(String questionId) {

        if (questionId == null) {
            return "정보를 로드하지 못했습니다.";
        }

        Optional<QuestionItem> foundQuestions = questionItemList.stream()
                .filter(q -> questionId.equals(q.getSubject()))
                .findFirst();

        return foundQuestions.map(QuestionItem::getDescription)
                .orElse("요청하신 문항의 정보를 찾을 수 없습니다.");
    }

    public List<String> getAllSubjects() {
        return subjects;
    }
}
