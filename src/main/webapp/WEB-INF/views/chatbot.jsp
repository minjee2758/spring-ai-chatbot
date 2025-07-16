<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<link rel="stylesheet" href="../../css/chatbot.css">
<div id="fabTooltip" class="fab-tooltip">
    질문해보세요!
    <div class="fab-tooltip-arrow"></div>
</div>
<button id="fabChatbotButton" aria-label="챗봇 열기">
    <img src="${pageContext.request.contextPath}/resources/common/img/mini-robot.png" class= "fab-button" alt="챗봇 버튼" />
</button>

<div id="chatbotModalOverlay" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <div>
                <h2 class="modal-title">KeyStone AI 챗봇</h2>
                <p class="modal-subtitle">창업과 리더십 관련 질문에 답변합니다</p>
            </div>
            <button id="closeModalButton" class="close-button" aria-label="챗봇 닫기">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
        </div>

        <div id="chatMessages" class="chat-messages">
        </div>

        <div class="input-form-container">
            <form id="chatForm" class="chat-input-form">
                <input type="text" id="chatInput" placeholder="질문을 입력하세요..." class="chat-input" />
                <button type="submit" id="sendMessageButton" class="send-button">
                    <img src="${pageContext.request.contextPath}/resources/common/img/send.svg" width="16" height="16" alt="전송 버튼" />
                </button>
            </form>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="../../js/chatbot.js"></script>
