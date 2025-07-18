package com.example.aichatbotspring.config;
import com.example.aichatbotspring.websocket.ChatWebSocketHandler;
import com.example.aichatbotspring.websocket.DragWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/*
웹소켓을 활성화하고 엔드포인트를 등록하는 config 클래스 작성
 */
@Configuration
@EnableWebSocket //웹소켓 사용 활성화 해주기
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final DragWebSocketHandler dragWebSocketHandler;

    public WebSocketConfig(ChatWebSocketHandler chatWebSocketHandler, DragWebSocketHandler dragWebSocketHandler) {
        this.chatWebSocketHandler = chatWebSocketHandler;
        this.dragWebSocketHandler = dragWebSocketHandler;
    }


    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatWebSocketHandler, "/ws/chat") //이 경로로 들어오는 모든 요청을 웹소켓핸들러가 처리할 수 있도록 등록하기
                .addHandler(dragWebSocketHandler,  "/ws/drag")
                .setAllowedOrigins("*"); // 모든 도메인 접속 허용 -> 나중에 배포할때는 특정 도메인으로 제한하기
    }
}

