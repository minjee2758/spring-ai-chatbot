package com.example.aichatbotspring.websocket;

import com.example.aichatbotspring.dto.Request;
import com.example.aichatbotspring.dto.Response;
import com.example.aichatbotspring.vo.Message;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class DragWebSocketHandler extends TextWebSocketHandler {
    @Value("${openai.gpt.model}")
    private String gptModel;

    private final ObjectMapper objectMapper;
    private final ApiClient apiClient;

    public DragWebSocketHandler(ObjectMapper objectMapper, ApiClient apiClient) {
        this.objectMapper = objectMapper;
        this.apiClient = apiClient;
    }

    //프롬프트 설정하기
    private static final String GPT_PROMPT ="" +
            "사용자가 요청한 내용에 대해 간결하게 설명해주세요." +
            "만약 글을 수정, 첨삭과 비슷한 요청이 들어왔다면, 해당 글을 의도에 맞게 첨삭한 뒤 깔끔하게 정리하여 전달." +
            "허위정보를 전달하지 않을것. 마크업언어를 사용" +
            "유저 요청 : \"";

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("WebSocket 연결 성공: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();

        JsonNode jsonNode = objectMapper.readTree(payload);

        List<Message> userMessageToList = new ArrayList<>();
        String userMessage = GPT_PROMPT+ jsonNode.get("content").toString() + "\"";
        userMessageToList.add(new Message("assistant", userMessage));

        Request userRequest = new Request(
                gptModel,
                userMessageToList);

        Response gptResponse = apiClient.callGptApi(userRequest);
        Message assistantMessage = gptResponse.getChoices().get(0).getMessage();
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(assistantMessage)));


    }


    /*
3. 웹소켓 연결이 종료
*/
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        log.info("웹소켓 세션 종료 : {} (이유: {})", session.getId(), status.getReason());
    }

    /*
    웹소켓 전송 중 에러가 발생했을 때 호출
     */
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("웹소켓 전송 중 에러가 발생했습니다. 세션 {}: {}", session.getId(), exception.getMessage(), exception);
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

}
