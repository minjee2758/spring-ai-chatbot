package com.example.aichatbotspring.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class DraggedTextController {

    @PostMapping("/api/process-dragged-text") // 프론트엔드 fetch URL과 일치해야 함
    public ResponseEntity<Map<String, String>> processDraggedText(@RequestBody DraggedTextRequest request) {
        String draggedText = request.getDraggedText();
        System.out.println("백엔드에서 받은 드래그된 텍스트: " + draggedText);

        // 필요한 로직 수행...
        // 예: DB 저장, 외부 API 호출 등

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "텍스트를 성공적으로 받았습니다.");
        return ResponseEntity.ok(response);
    }
}

// 요청 바디를 받을 DTO 클래스
class DraggedTextRequest {
    private String draggedText;

    public String getDraggedText() {
        return draggedText;
    }

    public void setDraggedText(String draggedText) {
        this.draggedText = draggedText;
    }
}