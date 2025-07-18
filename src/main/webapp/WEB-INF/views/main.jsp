<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Start-Up SPOT</title>
    <link rel="stylesheet" href="../../css/main.css">
</head>
<body>
<!-- Header -->
<header class="header">
    <div class="container">
        <h1 class="header-title">📓 Start-Up NOTE</h1>
        <p class="header-subtitle">스타트업 아이디어부터 사업 계획까지, 모든 창업 준비 과정을 체계적으로 정리해보세요.</p>
    </div>
</header>

<!-- Main Content -->
<main class="main-content">
    <div class="container">
        <div class="content-wrapper">
            <!-- Sidebar -->
            <aside class="sidebar">
                <div class="sidebar-card">
                    <h2 class="sidebar-title">카테고리</h2>
                    <div class="category-buttons">
                        <button class="category-btn active" data-category="all">
                            전체 메모
                        </button>
                        <button class="category-btn" data-category="idea">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M9 12l2 2 4-4"/>
                                <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                                <path d="M15.5 7.5c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5z"/>
                            </svg>
                            아이디어 정리
                        </button>
                        <button class="category-btn" data-category="market">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                            </svg>
                            시장 조사
                        </button>
                        <button class="category-btn" data-category="pitch">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10,9 9,9 8,9"/>
                            </svg>
                            피치덱 작성
                        </button>
                    </div>
                </div>
            </aside>

            <!-- Main Content Area -->
            <div class="main-area">
                <!-- Empty State -->
                <div id="empty-state" class="empty-state">
                    <div class="empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                        </svg>
                    </div>
                    <p class="empty-title">아직 메모가 없습니다</p>
                    <p class="empty-subtitle">오른쪽 하단의 + 버튼을 눌러 첫 메모를 작성해보세요!</p>
                </div>

                <!-- Memo List -->
                <div id="memo-list" class="memo-list"></div>
            </div>
        </div>
    </div>
</main>

<%--<!-- Floating Action Button -->--%>
<%--<button id="fab" class="fab">--%>
<%--    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">--%>
<%--        <line x1="12" y1="5" x2="12" y2="19"/>--%>
<%--        <line x1="5" y1="12" x2="19" y2="12"/>--%>
<%--    </svg>--%>
<%--</button>--%>

<%--<!-- Modal -->--%>
<%--<div id="modal" class="modal">--%>
<%--    <div class="modal-content">--%>
<%--        <div class="modal-header">--%>
<%--            <h2 id="modal-title">새 메모 작성</h2>--%>
<%--            <button id="modal-close" class="modal-close">--%>
<%--                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">--%>
<%--                    <line x1="18" y1="6" x2="6" y2="18"/>--%>
<%--                    <line x1="6" y1="6" x2="18" y2="18"/>--%>
<%--                </svg>--%>
<%--            </button>--%>
<%--        </div>--%>

<%--        <form id="memo-form" class="modal-form">--%>
<%--            <div class="form-group">--%>
<%--                <label for="memo-category">카테고리</label>--%>
<%--                <select id="memo-category" class="form-select">--%>
<%--                    <option value="idea">아이디어 정리</option>--%>
<%--                    <option value="market">시장 조사</option>--%>
<%--                    <option value="pitch">피치덱 작성</option>--%>
<%--                </select>--%>
<%--            </div>--%>
<%--            <div class="form-group">--%>
<%--                <label for="memo-title">제목</label>--%>
<%--                <input type="text" id="memo-title" class="form-input" placeholder="메모 제목을 입력하세요">--%>
<%--            </div>--%>
<%--            <div class="form-group">--%>
<%--                <label for="memo-content">내용</label>--%>
<%--                <textarea id="memo-content" class="form-textarea" placeholder="마크다운 형식으로 자유롭게 작성하세요...--%>

<%--예시:--%>
<%--# 제목--%>
<%--## 소제목--%>
<%--- 리스트 항목--%>
<%--**굵은 글씨**--%>
<%--*기울임*"></textarea>--%>
<%--            </div>--%>
<%--            <div class="form-actions">--%>
<%--                <button type="submit" class="btn-primary">작성하기</button>--%>
<%--                <button type="button" id="cancel-btn" class="btn-secondary">취소</button>--%>
<%--            </div>--%>
<%--        </form>--%>

<%--    </div>--%>
</div>
<%--<script src="../../js/drag.js"></script>--%>
<%--<script src="../../js/main.js"></script>--%>
</body>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<%--<jsp:include page="../views/drag-chat.jsp" />--%>
<jsp:include page="../views/chatbot.jsp" />
<jsp:include page="../views/floatingBar.jsp" />
</html>
