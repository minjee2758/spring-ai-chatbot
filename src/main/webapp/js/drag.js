let latestSelectedText = ''; // 드래그된 텍스트를 저장

document.addEventListener('DOMContentLoaded', function() {
    // --- DOM 요소 참조 ---
    const dragActionPopup = document.getElementById('dragActionPopup'); // "AI에게 요청하기" 버튼 팝업
    const draggedTextActionButton = document.getElementById('draggedTextActionButton'); // "AI에게 요청하기" 버튼

    const singleInputChatContainer = document.getElementById('singleInputChatContainer'); // 단발성 질문/답변 UI 컨테이너
    const chatResponseArea = document.getElementById('chatResponseArea'); // AI 답변 표시 영역
    const chatInputArea = document.getElementById('chatInputArea'); // 사용자 입력 필드와 버튼을 포함하는 영역
    const aiChatInput = document.getElementById('aiChatInput'); // 사용자 입력 필드
    const aiChatSendButton = document.getElementById('aiChatSendButton'); // 전송 버튼
    const singleChatCloseButton = document.getElementById('singleChatCloseButton'); // 닫기 버튼

    // --- 상수 정의 ---
    const WEBSOCKET_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/drag`;

    // --- 상태 변수 ---
    let ws; // 웹소켓 인스턴스
    let isTyping = false; // 봇이 입력 중인지 여부

    // --- 유틸리티 함수 ---

    /**
     * '입력 중...' 인디케이터를 표시합니다.
     * 이제 chatResponseArea 내부에 표시됩니다.
     */
    function showTypingIndicator() {
        if (isTyping) return;

        const typingContainer = document.createElement('div');
        typingContainer.classList.add('typing-indicator');
        typingContainer.id = 'typingIndicator';

        const dotsContainer = document.createElement('div');
        dotsContainer.classList.add('typing-dots');
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            dot.style.animationDelay = `${i * 0.1}s`;
            dotsContainer.appendChild(dot);
        }
        typingContainer.appendChild(dotsContainer);
        chatResponseArea.appendChild(typingContainer); // 답변 영역 안에 추가
        isTyping = true;
    }

    /**
     * '입력 중...' 인디케이터를 제거합니다.
     */
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
            isTyping = false;
        }
    }

    /**
     * 메시지 입력창의 내용에 따라 전송 버튼의 활성화 상태를 업데이트합니다.
     */
    function updateSendButtonState() {
        aiChatSendButton.disabled = aiChatInput.value.trim() === '';
    }

    /**
     * 웹소켓 연결을 설정하거나 이미 연결되어 있으면 스킵합니다.
     */
    function connectWebSocket() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            console.log('WebSocket is already connected.');
            return;
        }

        ws = new WebSocket(WEBSOCKET_URL);

        ws.onopen = (event) => {
            console.log('WebSocket 연결 성공:', event);
            aiChatInput.disabled = false; // 연결되면 입력창 활성화
            updateSendButtonState(); // 초기 상태 반영 (입력 없으면 비활성화)
            aiChatInput.focus(); // 입력창에 포커스
        };

        ws.onmessage = function(event) {
            removeTypingIndicator(); // 응답이 오면 입력 중... 제거
            try {
                const responseData = JSON.parse(event.data);
                const messageContent = responseData.content; // AI 답변 내용
                // 답변을 chatResponseArea에 표시
                chatResponseArea.innerHTML = messageContent; // 기존 내용 덮어쓰기
                chatResponseArea.style.display = 'block'; // 답변 영역 보이게
            } catch (e) {
                console.error("웹소켓 메시지 파싱 오류:", e, "원본 데이터:", event.data);
                chatResponseArea.innerHTML = '오류: 서버로부터 알 수 없는 형식의 메시지를 받았습니다.';
                chatResponseArea.style.display = 'block';
            }
        };

        ws.onclose = function(event) {
            console.log('웹소켓 연결 종료:', event.code, event.reason);
            aiChatInput.disabled = true; // 연결 끊기면 입력창 비활성화
            aiChatSendButton.disabled = true;
            removeTypingIndicator();
            chatResponseArea.innerHTML = '챗봇 연결이 끊어졌습니다.';
            chatResponseArea.style.display = 'block';
        };

        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
            chatResponseArea.innerHTML = '챗봇 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
            chatResponseArea.style.display = 'block';
            removeTypingIndicator();
            aiChatInput.disabled = true;
            aiChatSendButton.disabled = true;
        };
    }

    /**
     * 사용자 메시지를 웹소켓으로 전송합니다.
     * @param {string} message - 사용자 입력 메시지 (드래그 + 추가 질문)
     * @param {string} contextText - 드래그된 원본 텍스트 (컨텍스트 제공용)
     */
    function sendUserMessage(message, contextText = '') {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket이 연결되지 않았거나 닫혔습니다.');
            chatResponseArea.innerHTML = '챗봇 연결이 불안정합니다. 다시 시도해주세요.';
            chatResponseArea.style.display = 'block';
            return;
        }

        chatResponseArea.innerHTML = ''; // 이전 답변 또는 오류 메시지 초기화
        showTypingIndicator(); // AI 답변 대기 중 표시

        const data = {
            type: 'user_query', // 단발성 쿼리임을 나타냄
            content: message,
            context_text: contextText // 드래그된 텍스트
        };

        ws.send(JSON.stringify(data));
        console.log('웹소켓으로 메시지 전송:', data);

        aiChatInput.value = ''; // 입력창 초기화
        updateSendButtonState(); // 전송 버튼 비활성화
    }

    // --- 헬퍼 함수 ---
    /**
     * 드래그 액션 팝업을 숨깁니다.
     */
    function hideDragActionPopup() {
        dragActionPopup.classList.remove('active');
    }

    /**
     * 단발성 질문/답변 UI를 숨깁니다.
     * 웹소켓 연결도 함께 닫고 상태를 초기화합니다.
     */
    function hideSingleInputChat() {
        singleInputChatContainer.classList.remove('active');
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
        chatResponseArea.innerHTML = ''; // 답변 영역 초기화
        chatResponseArea.style.display = 'none'; // 답변 영역 숨김
        aiChatInput.value = ''; // 입력창 초기화
        aiChatInput.disabled = true; // 입력창 비활성화
        aiChatSendButton.disabled = true; // 전송 버튼 비활성화
        removeTypingIndicator(); // 혹시 남아있을 수 있는 타이핑 인디케이터 제거
    }


    // --- 이벤트 리스너 ---

    // 1. 드래그 텍스트 처리 및 "AI에게 요청하기" 버튼 팝업 표시
    document.addEventListener('mouseup', function(event) {
        // 단발성 질문 UI 또는 드래그 액션 팝업 자체를 클릭했을 때는 무시
        if (event.target.closest('#singleInputChatContainer') || event.target.closest('#dragActionPopup')) {
            return;
        }

        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        latestSelectedText = selectedText;
        console.log("드래그된 텍스트 : ", latestSelectedText);

        hideDragActionPopup(); // 기존 팝업 숨김
        hideSingleInputChat(); // 혹시 열려있을 수 있는 단발성 질문 UI도 닫음

        if (selectedText.length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // 팝업 위치 계산 (드래그된 텍스트 위)
            const buttonWidth = draggedTextActionButton.offsetWidth || 100; // 버튼이 아직 안 보일 수 있으니 기본값
            const popupX = rect.left + window.scrollX + (rect.width / 2) - (buttonWidth / 2);
            const popupY = rect.top + window.scrollY - 40; // 버튼 높이 + 여백

            // 팝업 위치 설정 및 표시
            Object.assign(dragActionPopup.style, {
                left: `${popupX}px`,
                top: `${popupY}px`,
            });
            dragActionPopup.classList.add('active'); // 팝업 보이기
        }
    });

    // 2. "AI에게 요청하기" 버튼 클릭 시 (가로 인풋 필드 UI 활성화)
    draggedTextActionButton.addEventListener('click', function (e) {
        e.stopPropagation(); // 이벤트 전파 방지

// 드래그된 텍스트의 위치를 다시 사용하여 singleInputChatContainer 위치 계산
        const selection = window.getSelection();
        if (selection.toString().trim().length === 0) {
            // 만약 버튼 클릭 시 선택이 사라졌다면, 기존 latestSelectedText 위치를 사용할 수 없음.
            // 이 경우에는 기본 위치를 사용하거나, 마지막에 버튼이 나타났던 위치를 저장해두는 로직이 필요할 수 있습니다.
            // 여기서는 단순화하여, 선택이 유효하다고 가정합니다.
            // 실제 구현에서는 선택이 없으면 기본 위치에 띄우거나 에러 처리가 필요합니다.
            console.warn("선택된 텍스트가 없어 인풋창 위치를 정확히 계산하기 어렵습니다.");
            // 대안: 화면 중앙이나 특정 고정 위치에 띄우기
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // singleInputChatContainer 위치 계산
        // 드래그된 텍스트의 바로 아래에 위치
        const containerX = rect.left + window.scrollX;
        const containerY = rect.bottom + window.scrollY + 10; // 드래그 텍스트 아래 + 10px 여백

        Object.assign(singleInputChatContainer.style, {
            left: `${containerX}px`,
            top: `${containerY}px`,
            // 오른쪽으로 너무 튀어나가지 않도록 조절 (옵션)
            // right: 'auto', // fixed에서 absolute로 바뀌면서 필요 없을 수 있음
            // bottom: 'auto', // fixed에서 absolute로 바뀌면서 필요 없을 수 있음
        });

        singleInputChatContainer.classList.add('active');
        connectWebSocket();
        aiChatInput.focus();
    });

    // 3. 단발성 질문 UI의 전송 버튼 클릭 시 또는 Enter 키 입력 시 메시지 전송
    aiChatSendButton.addEventListener('click', function() {
        const additionalQuestion = aiChatInput.value.trim();
        if (additionalQuestion) { // 추가 질문이 있을 때만 전송
            sendUserMessage(`${latestSelectedText} ${additionalQuestion}`, latestSelectedText);
        } else { // 추가 질문 없이 드래그 텍스트만 보낼 경우 (버튼 클릭 시)
            sendUserMessage(latestSelectedText, latestSelectedText);
        }
    });

    aiChatInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Enter 키의 기본 동작 방지
            const additionalQuestion = aiChatInput.value.trim();
            if (additionalQuestion) { // 추가 질문이 있을 때만 전송
                sendUserMessage(`${latestSelectedText} ${additionalQuestion}`, latestSelectedText);
            } else { // 추가 질문 없이 드래그 텍스트만 보낼 경우 (Enter 키)
                sendUserMessage(latestSelectedText, latestSelectedText);
            }
        }
    });

    // 4. 단발성 질문 UI의 입력창 내용 변경 시 전송 버튼 활성화/비활성화
    aiChatInput.addEventListener('input', updateSendButtonState);

    // 5. 모달 외부 클릭 시 드래그 액션 팝업 및 단발성 질문 UI 숨김
    document.addEventListener('mousedown', function(event) {
        // 단발성 질문 UI 내부, 드래그 액션 팝업 내부를 클릭했다면 아무것도 하지 않음
        if (event.target.closest('#singleInputChatContainer') || event.target.closest('#dragActionPopup')) {
            return;
        }

        window.getSelection().empty(); // 선택 해제
        hideDragActionPopup(); // 드래그 액션 팝업 숨김
        hideSingleInputChat(); // 단발성 질문 UI 숨김
    });

    // 6. 단발성 질문 UI의 닫기 버튼
    singleChatCloseButton.addEventListener('click', function() {
        hideSingleInputChat();
    });
});