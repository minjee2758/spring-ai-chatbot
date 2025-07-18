<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Editor</title>
    <link rel="stylesheet" href="../../css/style.css">
</head>
<body>
<div class="container">
    <main class="main-content">
        <div class="document-card" id="documentCard">
            <div class="document-content">
                <p class="selectable-text">
                    인공지능은 현대 사회의 여러 분야에서 중요한 역할을 하고 있습니다. 특히 자연어 처리 기술의 발전은 우리가
                    소통하고 정보를 처리하는 방식을 혁신적으로 바꾸고 있습니다. 이 기술은 기계 번역, 텍스트 요약, 감정 분석 등
                    다양한 응용 분야에서 활용됩니다. 이러한 발전은 앞으로 더 많은 가능성을 열어줄 것입니다. 머신러닝과
                    딥러닝의 발전으로 인해 자연어 이해 능력이 크게 향상되었으며, 이는 챗봇, 가상 비서, 자동 번역 서비스 등에서
                    실질적인 성과를 보여주고 있습니다.
                </p>
            </div>

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
        </div>
    </main>

    <!-- 채팅창 -->
    <div class="chat-container">
        <div class="chat-card">

        </div>
    </div>
</div>

<script src="../../js/drag-test.js"></script>
</body>
</html>
