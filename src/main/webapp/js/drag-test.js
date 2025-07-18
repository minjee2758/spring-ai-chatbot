class DocumentEditor {
    constructor() {
        this.selectedText = ""
        this.showToolbar = false
        this.toolbarPosition = { top: 0, left: 0 }
        this.selectedTool = null
        this.promptValue = ""
        this.chatMessages = []
        this.isGenerating = false
        this.isToolbarActive = false
        this.isSelecting = false
        this.selectionTimeout = null
        this.lastSelection = ""

        this.toolActions = {
            grammar: {
                label: "오탈자 검사",
                placeholder: "어떤 부분을 수정하고 싶으신가요?",
            },
            improve: {
                label: "글쓰기 개선",
                placeholder: "어떻게 개선하고 싶으신가요?",
            },
            question: {
                label: "질문하기",
                placeholder: "무엇이 궁금하신가요?",
            },
        }

        this.init()
    }

    init() {
        this.bindEvents()
    }

    bindEvents() {
        const documentCard = document.getElementById("container")
        const promptInput = document.getElementById("promptInput")
        const sendButton = document.getElementById("sendButton")

        // 문서 마우스 이벤트
        documentCard.addEventListener("mousedown", () => this.handleMouseDown())
        documentCard.addEventListener("mouseup", () => this.handleMouseUp())

        // 텍스트 선택 이벤트
        document.addEventListener("selectionchange", () => this.handleTextSelection())

        // 툴바 버튼 이벤트
        document.querySelectorAll(".tool-button").forEach((button) => {
            button.addEventListener("click", (e) => {
                const toolId = e.currentTarget.getAttribute("data-tool")
                this.handleToolSelect(toolId)
            })
        })

        // 프롬프트 입력 이벤트
        promptInput.addEventListener("input", (e) => {
            this.promptValue = e.target.value
            sendButton.disabled = !this.promptValue.trim()
        })

        promptInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.handleSendPrompt()
            }
        })

        sendButton.addEventListener("click", () => this.handleSendPrompt())

        // ESC 키 이벤트
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.hideToolbar()
            }
        })

        // 전역 클릭 이벤트
        document.addEventListener("click", (e) => {
            if (
                !e.target.closest(".floating-toolbar") &&
                !e.target.closest(".chat-container") &&
                !e.target.closest(".document-card")
            ) {
                if (this.showToolbar || this.selectedTool || this.isToolbarActive) {
                    this.hideToolbar()
                }
            }
        })

        // 문서 클릭 이벤트
        documentCard.addEventListener("click", (e) => {
            if (!e.target.closest(".floating-toolbar") && !e.target.closest(".chat-container")) {
                if (this.showToolbar || this.selectedTool || this.isToolbarActive) {
                    this.hideToolbar()
                }
            }
        })
    }

    handleMouseDown() {
        if (!this.isToolbarActive) {
            this.isSelecting = true
            if (this.selectionTimeout) {
                clearTimeout(this.selectionTimeout)
            }
        }
    }

    handleMouseUp() {
        if (this.isSelecting && !this.isToolbarActive) {
            this.selectionTimeout = setTimeout(() => {
                const selection = window.getSelection()
                const selectedText = selection?.toString().trim() || ""

                if (selectedText) {
                    this.lastSelection = selectedText
                    this.selectedText = selectedText

                    if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0)
                        const rect = range.getBoundingClientRect()
                        const documentRect = document.getElementById("documentCard").getBoundingClientRect()

                        this.toolbarPosition = {
                            top: rect.top - documentRect.top - 60,
                            left: rect.left - documentRect.left + rect.width / 2,
                        }

                        this.showFloatingToolbar()
                    }
                }
                this.isSelecting = false
            }, 50)
        }
    }

    handleTextSelection() {
        if (this.isToolbarActive || !this.isSelecting) return

        const selection = window.getSelection()
        const selectedText = selection?.toString().trim() || ""

        if (selectedText && selectedText !== this.lastSelection) {
            this.lastSelection = selectedText
        }
    }

    showFloatingToolbar() {
        const toolbar = document.getElementById("floatingToolbar")
        toolbar.style.display = "block"
        toolbar.style.top = `${this.toolbarPosition.top}px`
        toolbar.style.left = `${this.toolbarPosition.left}px`
        toolbar.style.transform = "translateX(-50%)"

        this.showToolbar = true
        this.selectedTool = null
        this.hidePromptContainer()
    }

    hideToolbar() {
        const toolbar = document.getElementById("floatingToolbar")
        toolbar.style.display = "none"

        this.showToolbar = false
        this.selectedTool = null
        this.isToolbarActive = false
        this.promptValue = ""
        this.isSelecting = false

        this.hidePromptContainer()
        this.updateToolButtons()

        const promptInput = document.getElementById("promptInput")
        promptInput.value = ""
        document.getElementById("sendButton").disabled = true
    }

    handleToolSelect(toolId) {
        this.selectedTool = toolId
        const tool = this.toolActions[toolId]

        if (tool) {
            this.promptValue = ""
            this.isToolbarActive = true

            const promptInput = document.getElementById("promptInput")
            promptInput.placeholder = tool.placeholder
            promptInput.value = ""

            this.showPromptContainer()
            this.updateToolButtons()

            setTimeout(() => {
                promptInput.focus()
            }, 100)
        }
    }

    showPromptContainer() {
        const container = document.getElementById("promptContainer")
        container.style.display = "block"
    }

    hidePromptContainer() {
        const container = document.getElementById("promptContainer")
        container.style.display = "none"
    }

    updateToolButtons() {
        document.querySelectorAll(".tool-button").forEach((button) => {
            const toolId = button.getAttribute("data-tool")
            if (toolId === this.selectedTool) {
                button.classList.add("active")
            } else {
                button.classList.remove("active")
            }
        })
    }

    // async handleSendPrompt() {
    //     if (!this.promptValue.trim() || !this.selectedTool) return
    //
    //     const tool = this.toolActions[this.selectedTool]
    //     if (!tool) return
    //
    //     // 선택된 텍스트 메시지 추가
    //     const selectionMessage = {
    //         id: Date.now().toString() + "_selection",
    //         type: "selection",
    //         content: this.selectedText,
    //         timestamp: new Date(),
    //     }
    //
    //     // 사용자 요청 메시지 추가
    //     const userMessage = {
    //         id: Date.now().toString() + "_user",
    //         type: "user",
    //         content: `${tool.label}: "${this.promptValue}"`,
    //         timestamp: new Date(),
    //     }
    //
    //     this.chatMessages.push(selectionMessage, userMessage)
    //     this.updateChatDisplay()
    //
    //     this.isGenerating = true
    //     this.showLoadingMessage()
    //
    //     // 툴바 숨기기
    //     this.hideToolbar()
    //
    //     // AI 응답 시뮬레이션
    //     setTimeout(() => {
    //         let aiResponse = ""
    //
    //         switch (this.selectedTool) {
    //             case "grammar":
    //                 aiResponse = `"${this.selectedText}"에서 발견된 오탈자를 수정했습니다. 더 정확한 표현으로 개선되었습니다.`
    //                 break
    //             case "improve":
    //                 aiResponse = `선택하신 텍스트를 다음과 같이 개선해드렸습니다:\n\n"${this.selectedText.replace("기계 번역, 텍스트 요약, 감정 분석", "기계 번역, 텍스트 요약 및 감성 분석").replace("활용됩니다", "그 효용성을 입증하고 있습니다")}"\n\n더 전문적이고 학술적인 톤으로 수정했습니다.`
    //                 break
    //             case "question":
    //                 aiResponse = `선택하신 텍스트 "${this.selectedText}"에 대해 답변드리겠습니다. 자연어 처리 기술은 현재 다양한 분야에서 혁신적인 변화를 이끌고 있으며, 특히 언급하신 응용 분야들은 AI 기술의 핵심 영역입니다.`
    //                 break
    //             default:
    //                 aiResponse = "요청을 처리했습니다."
    //         }
    //
    //         const aiMessage = {
    //             id: Date.now().toString() + "_ai",
    //             type: "ai",
    //             content: aiResponse,
    //             timestamp: new Date(),
    //         }
    //
    //         this.chatMessages.push(aiMessage)
    //         this.isGenerating = false
    //         this.hideLoadingMessage()
    //         this.updateChatDisplay()
    //     }, 1500)
    // }

    updateChatDisplay() {
        const chatContent = document.getElementById("chatContent")

        if (this.chatMessages.length === 0) {
            chatContent.innerHTML = '<div class="empty-message">텍스트를 선택하고 AI 도구를 사용해보세요</div>'
            return
        }

        let html = ""

        this.chatMessages.forEach((message) => {
            if (message.type === "selection") {
                html += `
                    <div class="message">
                        <svg class="message-icon user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <div class="message-content selection-message">
                            <p class="selection-title">선택한 텍스트</p>
                            <p>"${message.content}"</p>
                        </div>
                    </div>
                `
            } else if (message.type === "user") {
                html += `
                    <div class="message">
                        <svg class="message-icon user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <div class="message-content user-message">
                            <p class="user-title">요청</p>
                            <p>${message.content}</p>
                        </div>
                    </div>
                `
            } else if (message.type === "ai") {
                html += `
                    <div class="message">
                        <svg class="message-icon ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <div class="message-content ai-message">
                            <p class="ai-title">AI 응답</p>
                            <p class="ai-content">${message.content}</p>
                        </div>
                    </div>
                `
            }
        })

        chatContent.innerHTML = html
        chatContent.scrollTop = chatContent.scrollHeight
    }

    showLoadingMessage() {
        const chatContent = document.getElementById("chatContent")
        const loadingHtml = `
            <div class="loading-message" id="loadingMessage">
                <svg class="message-icon ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <div class="loading-content">
                    <p class="ai-title">AI 응답</p>
                    <div class="loading-dots">
                        <div class="dots-container">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                        <span class="loading-text">응답 생성 중...</span>
                    </div>
                </div>
            </div>
        `

        chatContent.insertAdjacentHTML("beforeend", loadingHtml)
        chatContent.scrollTop = chatContent.scrollHeight
    }

    hideLoadingMessage() {
        const loadingMessage = document.getElementById("loadingMessage")
        if (loadingMessage) {
            loadingMessage.remove()
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", () => {
    new DocumentEditor()
})
