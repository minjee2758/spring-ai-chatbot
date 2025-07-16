package com.example.aichatbotspring.websocket;

import com.example.aichatbotspring.dto.Request;
import com.example.aichatbotspring.dto.Response;
import com.example.aichatbotspring.vo.Message;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class ChatWebSocketHandler extends TextWebSocketHandler {
    @Value("${openai.gpt.model}")
    private String gptModel;

    private final ObjectMapper objectMapper;
    private final ApiClient apiClient;

    public ChatWebSocketHandler(ObjectMapper objectMapper, ApiClient apiClient) {
        this.objectMapper = objectMapper;
        this.apiClient = apiClient;
    }

    private static final String GPT_PROMPT =
            "당신은 기업가를 돕는 10년차 창업과 리더십 전문 챗봇 어시스턴트입니다. " +
                    "저는 기업가이지만 숙련되지는 않았습니다. 가능한 쉽게, " +
                    "핵심을 알기 쉬운 다양한 예시를 들어가며 설명해 주세요." +
                    "허위 정보를 생성하지 마세요." +
                    "모든 답변은 친절하고 간결하게, 200자를 넘지 않도록 합니다. " +
                    "창업, 기업, 리더십 등의 주제와 조금이라도 연결점이 없는 내용에는 답변하지 마세요.\n" +
                    "\n" +
                    "내용이 길어질 경우, 마크업 언어를 사용해 전달합니다.";


    private final Map<String, List<Message>> chattingHistory = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("WebSocket 연결 성공: {}", session.getId());

        List<Message> history = chattingHistory.computeIfAbsent(session.getId(), k -> {
            return new ArrayList<>();
        });

        if (history.isEmpty() || !history.get(0).equals(GPT_PROMPT)) {
            history.add(0, new Message("user", GPT_PROMPT));
        }
    }


    @Override
    protected void handleTextMessage(WebSocketSession session, org.springframework.web.socket.TextMessage message) throws Exception {
        String payload = message.getPayload();

        List<Message> currentHistory = chattingHistory.computeIfAbsent(session.getId(), k -> new ArrayList<>());


        try {
            JsonNode jsonNode = objectMapper.readTree(payload);

            JsonNode chatHistoryNode = jsonNode.get("data");

            if (!jsonNode.has("type") && !"initialChatHistory".equals(jsonNode.get("type").asText())) {
                throw new Exception("JSON 파싱 실패");
            }
            if (chatHistoryNode == null || chatHistoryNode.isEmpty()) {
                throw new Exception("세션에서 로컬 스토리지 채팅 내역이 없습니다.");
            }

            JsonNode messagesNode = chatHistoryNode.get("messages");
            log.info("세션 {} 에서 로컬 스토리지 채팅 내역 수신. 이전 메시지 수: {}",
                    session.getId(), messagesNode.size());

            // 로컬 스토리지에서 가져온 대화 기록을 currentHistory에 추가
            for (JsonNode jnode : messagesNode) {
                String text = jnode.has("text") ? jnode.get("text").asText() : "";
                String role = jnode.has("role") ? jnode.get("role").asText() : "";

                if (!text.isEmpty() && !role.isEmpty()) {
                    currentHistory.add(new Message(role, text));
                }
            }

            return;

        }catch (Exception e) {
            log.debug("JSON 파싱 실패, 일반 텍스트 메시지로 처리합니다: {}", payload);
        }

        String userMessageContent = payload;

        currentHistory.add(new Message("user", userMessageContent));

        Request userRequest = new Request(
                gptModel,
                currentHistory);

        Response gptResponse = apiClient.callGptApi(userRequest);

        if (gptResponse !=null && gptResponse.getChoices() != null && !gptResponse.getChoices().isEmpty()){
            Message assistantMessage = gptResponse.getChoices().get(0).getMessage();

            if (assistantMessage != null) {
                currentHistory.add(assistantMessage);
                log.info("지금 전달되는 형식 : currentHistory: {} \n assistentMessage : {} : ", currentHistory.get(0).getContent(), assistantMessage);
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(assistantMessage)));
                log.info("{} 세션에서 GPT응답 : {}", session.getId(), assistantMessage.getContent());
            }
        }



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

