package com.example.aichatbotspring.controller;


import com.example.aichatbotspring.websocket.DragWebSocketHandler;
import lombok.Getter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class DraggedTextController {

    private final DragWebSocketHandler dragWebSocketHandler;

    public DraggedTextController(DragWebSocketHandler dragWebSocketHandler) {
        this.dragWebSocketHandler = dragWebSocketHandler;
    }

    @PostMapping("/api/process-dragged-text") // 프론트엔드 fetch URL과 일치해야 함
    public ResponseEntity<Map<String, String>> processDraggedText(@RequestBody DraggedTextRequest request) {
        String userMessage = "\""+ request.getDraggedText() + "\" 라는 내용에 대한 사용자 요청 : " + request.getAdditionalQuestion();
        System.out.println("백엔드에서 받은 드래그된 텍스트: " + userMessage);

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "텍스트를 성공적으로 받았습니다.");
        return ResponseEntity.ok(response);
    }
}

// 요청 바디를 받을 DTO 클래스
@Getter
class DraggedTextRequest {
    private String draggedText;
    private String additionalQuestion;

}