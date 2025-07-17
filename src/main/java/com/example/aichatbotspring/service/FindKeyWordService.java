package com.example.aichatbotspring.service;

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

    private List<Map<String, String>> explanationsData;
    private List<String> subjects;
    private final ObjectMapper objectMapper;

    public FindKeyWordService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void initExplanations() {
        try {
            ClassPathResource resource = new ClassPathResource("explanations.json");
            try (InputStream inputStream = resource.getInputStream()) {
                explanationsData = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, String>>>() {});
                log.info("explanations.json 파일이 성공적으로 로드되었습니다. 항목 수: {}", explanationsData.size());
            }
        } catch (IOException e) {
            // 오류 메시지를 더 구체적으로 변경
            log.error("explanations.json 파일을 찾거나 읽는 데 실패했습니다. 파일 경로를 확인해주세요.", e);
            explanationsData = List.of();
        }
    }

    @PostConstruct
    public void initSubject() {
        try {
            ClassPathResource resource = new ClassPathResource("explanations-id.json");
            try (InputStream inputStream = resource.getInputStream()) {
                subjects = objectMapper.readValue(inputStream, new TypeReference<>() {
                });
            }
        } catch (IOException e) {
            log.error("리스트로 초기화 실패", e);
            explanationsData = List.of(); // 오류 시 빈 리스트로 초기화
        }

    }


    public String find(String questionId) {

        if (questionId == null) {
            return "정보를 로드하지 못했습니다.";
        }

        Optional<Map<String, String >> foundQuestions = explanationsData.stream()
                .filter(q -> questionId.equals(q.get("id")))
                .findFirst();

        return foundQuestions.map(q -> q.get("question"))
                .orElse("요청하신 문항의 정보를 찾을 수 없습니다.");
    }

    public List<String> getAllSubjects() {
        return subjects;
    }
}
