package com.example.aichatbotspring.websocket;

import com.example.aichatbotspring.dto.Request;
import com.example.aichatbotspring.dto.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class ApiClient {
    private final RestTemplate restTemplate;

    @Value("${GPT_URL}")
    private String gptUrl;

    @Value("${GPT_KEY}")
    private String gptApiKey;


    public ApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Response callGptApi(Request request) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON); //json타입으로 설정하기
        httpHeaders.setBearerAuth(gptApiKey); //api키 넣기


        HttpEntity<Request> requestEntity = new HttpEntity<>(request, httpHeaders);


        ResponseEntity<Response> responseEntity = restTemplate.exchange(
                gptUrl,
                HttpMethod.POST, // HTTP POST 메서드
                requestEntity,   // 헤더와 본문을 포함한 HttpEntity
                Response.class     // 응답을 String으로 받음 (나중에 응답 DTO로 변경 가능)
        );

        if (responseEntity.getBody().getChoices().isEmpty() || responseEntity.getBody().getChoices() == null) {
            throw new IllegalStateException("답변을 받지 못했습니다");
        }

        return new Response(responseEntity.getBody().getChoices());
    }
}
