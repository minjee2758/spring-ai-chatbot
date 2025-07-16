document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 참조 ---
    const fabChatbotButton = document.getElementById('fabChatbotButton');
    const chatbotModalOverlay = document.getElementById('chatbotModalOverlay');
    const closeModalButton = document.getElementById('closeModalButton');
    const chatMessagesContainer = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const sendMessageButton = document.getElementById('sendMessageButton');

    // --- 상수 정의 ---
    const WEBSOCKET_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/chat`;
    const CHAT_SESSION_PREFIX = 'chat_session_'; // 로컬 스토리지 키 접두사
    const BOT_AVATAR_PATH = '/resources/common/img/robot-icon.png';

    // --- 상태 변수 ---
    let ws; // 웹소켓 인스턴스
    let isTyping = false; // 봇이 입력 중인지 여부
    let messageIdCounter = 0; // 메시지 고유 ID 생성을 위한 카운터
    let currentChatSessionKey = null; // 현재 페이지의 채팅 세션 키 (로컬 스토리지 관리용)

    // --- 헬퍼 함수: SVG 아이콘 생성 ---
    function createSvgIcon(iconName, width = 16, height = 16, className = '') {
        const svgMap = {
            'send': '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M9 9l5 5"/>',
            'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
            'message-circle': '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
            'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
        };
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.classList.add(className);
        svg.innerHTML = svgMap[iconName] || '';
        return svg;
    }

    // --- 로컬 스토리지 관리 함수 ---

    /**
     * 로컬 스토리지에 현재 채팅 내역을 저장합니다.
     * currentChatSessionKey가 설정되어 있어야 합니다.
     */
    function saveChatHistory() {
        if (!currentChatSessionKey) {
            console.warn('currentChatSessionKey가 없어 채팅 기록을 저장할 수 없습니다.');
            return;
        }

        const messages = [];
        chatMessagesContainer.querySelectorAll('.chat-message-container').forEach(msgDiv => {
            const role = msgDiv.classList.contains('user') ? 'user' : 'assistant';
            // chat-bubble 내부의 HTML을 그대로 저장합니다.
            const bubbleElement = msgDiv.querySelector('.chat-bubble');
            const text = bubbleElement.getAttribute('data-original-text');
            messages.push({ text: text || bubbleElement.textContent, role: role });
        });

        const chatData = {
            messages: messages,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(currentChatSessionKey, JSON.stringify(chatData));
        console.log(`Chat history saved to ${currentChatSessionKey}`);
    }

    /**
     * 로컬 스토리지에서 가장 최근의 채팅 내역을 불러와 화면에 표시합니다.
     * 새로운 세션 키를 생성하거나 기존 세션 키를 설정합니다.
     * @returns {boolean} 채팅 기록 로드 성공 여부
     */
    function loadChatHistory() {
        chatMessagesContainer.innerHTML = ''; // 기존 채팅 내역 삭제

        let latestSessionKey = null;
        let latestTimestamp = 0;
        const allKeys = Object.keys(localStorage);

        // 현재 페이지 경로에 해당하는 가장 최근의 채팅 세션 키를 찾습니다.
        const currentPagePath = window.location.pathname.replace(/[^a-zA-Z0-9]/g, '_');
        allKeys.forEach(key => {
            if (key.startsWith(`${CHAT_SESSION_PREFIX}${currentPagePath}`)) {
                try {
                    const chatData = JSON.parse(localStorage.getItem(key));
                    if (chatData && chatData.lastUpdated) {
                        const timestamp = new Date(chatData.lastUpdated).getTime();
                        if (timestamp > latestTimestamp) {
                            latestTimestamp = timestamp;
                            latestSessionKey = key;
                        }
                    }
                } catch (e) {
                    console.error(`Error parsing chat data for key ${key}:`, e);
                    localStorage.removeItem(key); // 파싱 오류 시 해당 키 삭제
                }
            }
        });

        if (latestSessionKey) {
            currentChatSessionKey = latestSessionKey; // 찾은 최신 키로 현재 세션 키 설정
            const chatData = JSON.parse(localStorage.getItem(currentChatSessionKey));

            if (chatData && chatData.messages && chatData.messages.length > 0) {
                // 저장된 메시지가 있다면 화면에 추가
                chatData.messages.forEach(msg => {
                    appendMessageToChat(msg.text, msg.role);
                });
                scrollToBottom();
                console.log(`Chat history loaded from ${currentChatSessionKey}`);
                return true; // 불러오기 성공
            }
        }

        // 불러올 대화 내역이 없거나 비어있는 경우
        currentChatSessionKey = generateSessionKey(); // 새 세션 키 생성
        console.log(`No chat history found for this page. New session key: ${currentChatSessionKey}`);
        return false; // 불러오기 실패 (새 세션 시작)
    }

    /**
     * 현재 시각과 페이지 경로를 기반으로 새로운 세션 키를 생성 (페이지별 유지)
     * -> 실제 서비스에 넣은 후에는 유저ID + 페이지 경로를 기반으로 세션키를 생성해야함.
     */
    function generateSessionKey() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        // 현재 페이지의 경로를 포함하여 페이지별로 구분되도록 합니다.
        const pagePath = window.location.pathname.replace(/[^a-zA-Z0-9]/g, '_'); // 경로를 유효한 문자열로 변환
        return `${CHAT_SESSION_PREFIX}${pagePath}_${year}${month}${day}_${hours}${minutes}${seconds}`;
    }

    // --- 메시지 표시 및 관리 함수 ---

    /**
     * 채팅 컨테이너에 메시지를 추가합니다.
     */
    function appendMessageToChat(text, role) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('chat-message-container', role);
        messageContainer.setAttribute('data-message-id', messageIdCounter++);

        const bubbleWrapper = document.createElement('div');
        bubbleWrapper.classList.add('chat-bubble-wrapper');

        const avatar = document.createElement('div');
        avatar.classList.add('chat-avatar'); // 아바타 공통 클래스
        if (role === 'user') {
            avatar.appendChild(createSvgIcon('user', 12, 12, 'icon-user'));
        } else {
            const botImage = document.createElement('img');
            botImage.src = BOT_AVATAR_PATH; // 봇 아바타 이미지 경로
            botImage.alt = 'Bot Avatar';
            botImage.classList.add('bot-avatar-image');
            avatar.appendChild(botImage);
        }

        const bubble = document.createElement('div');
        bubble.classList.add('chat-bubble');

        bubble.setAttribute('data-original-text', text);

        if (role === 'assistant') {
            bubble.innerHTML = marked.parse(text);
        } else {
            // 사용자 메시지는 일반 텍스트로 처리
            bubble.innerHTML = text;
        }

        bubbleWrapper.appendChild(avatar);
        bubbleWrapper.appendChild(bubble);
        messageContainer.appendChild(bubbleWrapper);
        chatMessagesContainer.appendChild(messageContainer);
    }

    /**
     * 챗봇 응답 시 '입력 중...' 인디케이터를 표시합니다.
     */
    function showTypingIndicator() {
        if (isTyping) return; // 이미 표시 중이면 중복 방지

        const typingContainer = document.createElement('div');
        typingContainer.classList.add('typing-indicator', 'assistant'); // 봇 역할 클래스 추가
        typingContainer.id = 'typingIndicator';

        const bubbleWrapper = document.createElement('div');
        bubbleWrapper.classList.add('chat-bubble-wrapper');

        const avatar = document.createElement('div');
        avatar.classList.add('chat-avatar', 'bot');
        const botImage = document.createElement('img');
        botImage.src = '/resources/common/img/robot-icon.png'; // 봇 아바타 이미지 경로
        botImage.alt = 'Bot Avatar';
        botImage.classList.add('bot-avatar-image');
        avatar.appendChild(botImage);

        const bubble = document.createElement('div');
        bubble.classList.add('chat-bubble');

        const dotsContainer = document.createElement('div');
        dotsContainer.classList.add('typing-dots');
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            dot.style.animationDelay = `${i * 0.1}s`;
            dotsContainer.appendChild(dot);
        }

        bubble.appendChild(dotsContainer);

        bubbleWrapper.appendChild(avatar);
        bubbleWrapper.appendChild(bubble);
        typingContainer.appendChild(bubbleWrapper);
        chatMessagesContainer.appendChild(typingContainer);

        isTyping = true;
        scrollToBottom();
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
     * 채팅창을 가장 아래로 스크롤합니다.
     */
    function scrollToBottom() {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // --- UI 상태 관리 함수 ---

    /**
     * 메시지 입력창의 내용에 따라 전송 버튼의 활성화 상태를 업데이트합니다.
     */
    function updateSendButtonState() {
        sendMessageButton.disabled = chatInput.value.trim() === '';
    }

    // --- 웹소켓 연결 및 이벤트 처리 ---

    /**
     * 웹소켓 연결을 설정하거나 이미 연결되어 있으면 스킵합니다.
     * 모달이 열릴 때 호출됩니다.
     */
    function connectWebSocket() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            console.log('WebSocket is already connected.');
            return;
        }

        ws = new WebSocket(WEBSOCKET_URL);

        ws.onopen = (event) => {
            console.log('WebSocket 연결 성공:', event);
            chatInput.disabled = false; // 연결되면 입력창 활성화
            updateSendButtonState(); // 초기 상태 반영

            // 서버에 로컬 스토리지 채팅 내역 유무를 알리는 메시지 전송 (초기화 목적으로 사용됨)
            const chatHistoryData = localStorage.getItem(currentChatSessionKey);
            if (chatHistoryData) {
                console.log(`서버에 로컬 스토리지 데이터 유무 알림: ${currentChatSessionKey}`);
                // 서버가 파싱할 수 있도록 JSON.parse()된 객체를 그대로 전송
                ws.send(JSON.stringify({ type: 'initialChatHistory', data: JSON.parse(chatHistoryData) }));
            } else {
                console.log('서버에 로컬 스토리지 데이터 없음 알림.');
                ws.send(JSON.stringify({ type: 'initialChatHistory', data: null }));
            }
        };

        ws.onmessage = function(event) {
            removeTypingIndicator(); // 응답이 오면 입력 중... 제거
            const responseData = JSON.parse(event.data);
            const message = responseData.content;
            // 서버에서 보낸 메시지가 'system' 타입의 메시지인지 확인하여 사용자에게 보여줄지 말지 결정.
            // 현재 서버는 챗봇 답변 외에 다른 메시지를 보내지 않으므로, 모든 메시지는 챗봇 답변으로 간주.
            appendMessageToChat(message, 'assistant'); // 봇 메시지 화면에 추가
            scrollToBottom();
            saveChatHistory(); // 새로운 메시지 추가 후 기록 저장
        };

        ws.onclose = function(event) {
            console.log('웹소켓 연결 종료:', event.code, event.reason);
            chatInput.disabled = true; // 연결 끊기면 입력창 비활성화
            sendMessageButton.disabled = true;
            removeTypingIndicator(); // 혹시 남아있을 수 있는 입력 중... 제거
            chatInput.removeEventListener('input', updateSendButtonState);
            // 사용자에게 연결 끊김 알림 (선택 사항)
            // appendMessageToChat('챗봇 연결이 끊어졌습니다. 다시 챗봇을 열어주세요.', 'system');
        };

        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
            appendMessageToChat('챗봇 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.', 'assistant');
            removeTypingIndicator();
            chatInput.disabled = true;
            sendMessageButton.disabled = true;
        };

        // 입력창 내용 변경 시 전송 버튼 상태 업데이트 리스너 추가
        chatInput.addEventListener('input', updateSendButtonState);
    }

    // --- 모달 열기/닫기 함수 ---

    /**
     * 챗봇 모달을 엽니다.
     * 로컬 스토리지에서 채팅 기록을 불러오고, 웹소켓 연결을 시작합니다.
     */
    function openModal() {
        chatbotModalOverlay.classList.add('open');
        const historyLoaded = loadChatHistory(); // 채팅 기록 불러오기 시도

        // 채팅 기록이 없으면 초기 안내 메시지를 표시합니다.
        if (!historyLoaded) {
            chatMessagesContainer.innerHTML = `
                <div class="chat-initial-message">
                   <img src="/resources/common/img/mini-robot.png" alt="미니 로봇 아바타" class="initial-bot-avatar">
                    <p class="initial-greeting">안녕하세요!</p>
                    <p class="initial-prompt">창업이나 리더십에 대해 궁금한 점을 물어보세요</p>
                </div>
            `;
        }

        // 웹소켓 연결 (이미 연결되어 있으면 재연결 안 함)
        connectWebSocket();
    }

    /*
     챗봇 모달을 닫습니다.
     * 현재 대화 기록을 로컬 스토리지에 저장하고, 웹소켓 연결을 종료합니다.
     */
    function closeModal() {
        chatbotModalOverlay.classList.remove('open');
        saveChatHistory(); // 모달 닫기 전에 현재 대화 기록 저장

        // 웹소켓 연결 종료 (리소스 절약)
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
            console.log('웹소켓 연결을 명시적으로 종료했습니다.');
        }
    }


    // --- 이벤트 리스너 설정 ---
    fabChatbotButton.addEventListener('click', openModal);
    closeModalButton.addEventListener('click', closeModal);
    chatbotModalOverlay.addEventListener('click', (e) => {
        if (e.target === chatbotModalOverlay) {
            closeModal();
        }
    });

    // --- FAB 툴팁 표시/숨김 로직 ---
    const fabTooltip = document.getElementById('fabTooltip');
    function showAndHideFabTooltip() {
        // 모달이 열려있지 않을 때만 툴팁 표시 로직 실행
        if (!chatbotModalOverlay.classList.contains('open')) {
            setTimeout(() => {
                fabTooltip.classList.add('show');
            }, 2000); // 2초 뒤 표시 시작

            setTimeout(() => {
                fabTooltip.classList.remove('show');
            }, 10000); // 총 10초 뒤 (표시 시작 후 8초 뒤) 자동 숨김
        }
    }
    showAndHideFabTooltip(); // 페이지 로드 시 툴팁 실행

    // FAB 버튼 클릭 시 툴팁 즉시 숨김
    fabChatbotButton.addEventListener('click', () => {
        fabTooltip.classList.remove('show');
        openModal(); // 모달 열기
    });

    // --- 초기 상태 설정 ---
    // 페이지 로드 시 웹소켓은 연결하지 않고, 모달이 열릴 때 연결합니다.
    chatInput.disabled = true; // 초기에는 입력창 비활성화
    sendMessageButton.disabled = true; // 초기에는 전송 버튼 비활성화

    // 폼 제출 이벤트 핸들러
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault(); // 기본 폼 제출 방지
        const message = chatInput.value.trim();

        if (message) {
            appendMessageToChat(message, 'user'); // 사용자 메시지를 화면에 추가
            chatInput.value = ''; // 입력 필드 초기화
            updateSendButtonState(); // 전송 버튼 상태 업데이트
            showTypingIndicator(); // '입력 중...' 표시
            scrollToBottom(); // 스크롤 최하단으로

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(message); // 웹소켓으로 메시지 전송
                // saveChatHistory(); // 메시지 전송 후 저장 (봇 응답 후 저장으로 변경)
            } else {
                console.error('WebSocket이 연결되지 않았습니다.');
                appendMessageToChat('챗봇이 연결되지 않았습니다. 잠시 후 다시 시도해주세요.', 'assistant');
                removeTypingIndicator(); // 연결되지 않았으면 입력 중... 제거
            }
        }
    });
});