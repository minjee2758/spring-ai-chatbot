<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<link rel="stylesheet" href="../../css/drag-chat.css">

<div id="dragActionPopup" class="drag-action-popup">
    <button id="draggedTextActionButton" class="action-button">AI에게 요청하기</button>
</div>

<div id="singleInputChatContainer" class="single-input-chat-container">
    <div id="chatResponseArea" class="chat-response-area" style="display: none;">
    </div>

    <div id="chatInputArea" class="chat-input-area">
        <input type="text" id="aiChatInput" class="chat-input-field" placeholder="궁금한 점을 입력하세요..." disabled>
        <button id="aiChatSendButton" class="chat-send-button" disabled>↑</button>
        <button id="singleChatCloseButton" class="single-chat-close-button">&times;</button>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>