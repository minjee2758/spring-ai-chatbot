<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<link rel="stylesheet" href="../../css/style.css">
<!-- 플로팅 툴바 -->
<div class="floating-toolbar" id="floatingToolbar" style="display: none;">
    <div class="toolbar-buttons">
        <button class="tool-button" data-tool="grammar">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            <span>오탈자 검사</span>
        </button>
        <button class="tool-button" data-tool="improve">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>글쓰기 개선</span>
        </button>
        <button class="tool-button" data-tool="question">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <point cx="12" cy="17" r="1"></point>
            </svg>
            <span>질문하기</span>
        </button>
    </div>

    <!-- 프롬프트 입력창 -->
    <div class="prompt-container" id="promptContainer" style="display: none;">
        <div class="prompt-card">
            <div class="prompt-input-wrapper">
                <input type="text" class="prompt-input" id="promptInput" placeholder="">
                <button class="send-button" id="sendButton" disabled>
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</div>

<%--<script src="../../js/drag-test.js"></script>--%>