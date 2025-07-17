// 전역 변수
let memos = []
let currentCategory = "all"
let editingMemo = null

// 카테고리 정보
const categories = {
    idea: { name: "아이디어 정리", color: "idea" },
    market: { name: "시장 조사", color: "market" },
    pitch: { name: "피치덱 작성", color: "pitch" },
}

// DOM 요소
const elements = {
    emptyState: document.getElementById("empty-state"),
    memoList: document.getElementById("memo-list"),
    fab: document.getElementById("fab"),
    modal: document.getElementById("modal"),
    modalTitle: document.getElementById("modal-title"),
    modalClose: document.getElementById("modal-close"),
    memoForm: document.getElementById("memo-form"),
    memoCategory: document.getElementById("memo-category"),
    memoTitle: document.getElementById("memo-title"),
    memoContent: document.getElementById("memo-content"),
    cancelBtn: document.getElementById("cancel-btn"),
    categoryBtns: document.querySelectorAll(".category-btn"),
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
    loadMemos()
    bindEvents()
    updateDisplay()
})

// 이벤트 바인딩
function bindEvents() {
    // FAB 클릭
    elements.fab.addEventListener("click", openCreateModal)

    // 모달 닫기
    elements.modalClose.addEventListener("click", closeModal)
    elements.cancelBtn.addEventListener("click", closeModal)

    // 모달 배경 클릭시 닫기
    elements.modal.addEventListener("click", (e) => {
        if (e.target === elements.modal) {
            closeModal()
        }
    })

    // 폼 제출
    elements.memoForm.addEventListener("submit", handleFormSubmit)

    // 카테고리 버튼 클릭
    elements.categoryBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const category = this.dataset.category
            setActiveCategory(category)
        })
    })
}

// 로컬 스토리지에서 메모 로드
function loadMemos() {
    const savedMemos = localStorage.getItem("startup-memos")
    if (savedMemos) {
        memos = JSON.parse(savedMemos).map((memo) => ({
            ...memo,
            createdAt: new Date(memo.createdAt),
        }))
    }
}

// 로컬 스토리지에 메모 저장
function saveMemos() {
    localStorage.setItem("startup-memos", JSON.stringify(memos))
}

// 메모 생성 모달 열기
function openCreateModal() {
    editingMemo = null
    elements.modalTitle.textContent = "새 메모 작성"
    elements.memoForm.querySelector('button[type="submit"]').textContent = "작성하기"
    clearForm()
    elements.modal.classList.add("active")
    elements.memoTitle.focus()
}

// 메모 수정 모달 열기
function openEditModal(memo) {
    editingMemo = memo
    elements.modalTitle.textContent = "메모 수정"
    elements.memoForm.querySelector('button[type="submit"]').textContent = "수정하기"

    elements.memoCategory.value = memo.category
    elements.memoTitle.value = memo.title
    elements.memoContent.value = memo.content

    elements.modal.classList.add("active")
    elements.memoTitle.focus()
}

// 모달 닫기
function closeModal() {
    elements.modal.classList.remove("active")
    clearForm()
    editingMemo = null
}

// 폼 초기화
function clearForm() {
    elements.memoCategory.value = "idea"
    elements.memoTitle.value = ""
    elements.memoContent.value = ""
}

// 폼 제출 처리
function handleFormSubmit(e) {
    e.preventDefault()

    const title = elements.memoTitle.value.trim()
    const content = elements.memoContent.value.trim()
    const category = elements.memoCategory.value

    if (!title || !content) {
        alert("제목과 내용을 모두 입력해주세요.")
        return
    }

    if (editingMemo) {
        // 메모 수정
        editingMemo.title = title
        editingMemo.content = content
        editingMemo.category = category
    } else {
        // 새 메모 생성
        const newMemo = {
            id: Date.now().toString(),
            title: title,
            content: content,
            category: category,
            createdAt: new Date(),
        }
        memos.unshift(newMemo)
    }

    saveMemos()
    updateDisplay()
    closeModal()
}

// 메모 삭제
function deleteMemo(id) {
    if (confirm("정말로 이 메모를 삭제하시겠습니까?")) {
        memos = memos.filter((memo) => memo.id !== id)
        saveMemos()
        updateDisplay()
    }
}

// 활성 카테고리 설정
function setActiveCategory(category) {
    currentCategory = category

    // 버튼 활성화 상태 업데이트
    elements.categoryBtns.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.category === category)
    })

    updateDisplay()
}

// 화면 업데이트
function updateDisplay() {
    const filteredMemos = currentCategory === "all" ? memos : memos.filter((memo) => memo.category === currentCategory)

    if (filteredMemos.length === 0) {
        elements.emptyState.style.display = "block"
        elements.memoList.style.display = "none"
    } else {
        elements.emptyState.style.display = "none"
        elements.memoList.style.display = "block"
        renderMemos(filteredMemos)
    }
}

// 메모 목록 렌더링
function renderMemos(memosToRender) {
    elements.memoList.innerHTML = memosToRender
        .map((memo) => {
            const categoryInfo = categories[memo.category]
            const formattedDate = memo.createdAt.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })

            return `
            <div class="memo-card">
                <div class="memo-header">
                    <div class="memo-info">
                        <div class="memo-meta">
                            <span class="memo-badge ${categoryInfo.color}">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M9 12l2 2 4-4"/>
                                </svg>
                                ${categoryInfo.name}
                            </span>
                            <span class="memo-date">${formattedDate}</span>
                        </div>
                        <h3 class="memo-title">${escapeHtml(memo.title)}</h3>
                    </div>
                    <div class="memo-actions">
                        <button class="memo-btn edit" onclick="openEditModal(${JSON.stringify(memo).replace(/"/g, "&quot;")})">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="memo-btn delete" onclick="deleteMemo('${memo.id}')">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="memo-content">${escapeHtml(memo.content)}</div>
            </div>
        `
        })
        .join("")
}

// HTML 이스케이프 함수
function escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}

// 전역 함수로 노출 (onclick 이벤트용)
window.openEditModal = (memo) => {
    openEditModal(memo)
}

window.deleteMemo = (id) => {
    deleteMemo(id)
}
