let latestSelectedText = '';

document.addEventListener('DOMContentLoaded', function() {
    async function sendTextToBackend(text) {
        try {
            const response = await fetch('/api/process-dragged-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ draggedText: text })
            });

            if (response.ok) {
                const result = await response.json();
                console.log("백엔드 응답:", result);
                alert("텍스트가 성공적으로 전송되었습니다!");
            } else {
                console.error("백엔드 전송 실패:", response.status, response.statusText);
                alert("텍스트 전송에 실패했습니다.");
            }
        } catch (error) {
            console.error("네트워크 오류:", error);
            alert("네트워크 오류가 발생했습니다.");
        }
    }

    document.addEventListener('mouseup', function(event) {
        const isActionButton = event.target.id === 'dragged-text-action-button';
        if (isActionButton) return; // 버튼 클릭은 무시!


        const selection = window.getSelection();

        const selectedText = selection.toString().trim();
        latestSelectedText = selectedText; // 값 보존
        console.log("드래그된 텍스트 : ", latestSelectedText);

        const existingButton = document.getElementById('dragged-text-action-button');
        if (existingButton) {
            existingButton.remove();
        }

        if (selectedText.length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            const buttonX = rect.left + window.scrollX + (rect.width / 2) - 50; // Centered above selection
            const buttonY = rect.top + window.scrollY - 40;

            const actionButton = document.createElement('button');
            actionButton.id = 'dragged-text-action-button';
            actionButton.textContent = 'AI에게 요청하기';
            Object.assign(actionButton.style, {
                position: 'absolute',
                left: `${buttonX}px`,
                top: `${buttonY}px`,
                zIndex: '9999',
                padding: '5px 10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                fontSize: '12px',
                userSelect: 'none'
            });

            actionButton.addEventListener('click', function (e) {
                e.stopPropagation();
                alert(`"${latestSelectedText}" 텍스트를 검색합니다!`);
                sendTextToBackend(latestSelectedText);
                console.log("버튼 클릭됨: sendTextToBackend 호출됨");
                actionButton.remove();
            });

            console.log("버튼 생성됨: ", actionButton);
            document.body.appendChild(actionButton);

        }
    });

    // 버튼 누를 때는 selection 제거 안 하도록
    document.addEventListener('mousedown', function(event) {
        const isActionButton = event.target.id === 'dragged-text-action-button';
        if (!isActionButton) {
            window.getSelection().empty();
            const existingButton = document.getElementById('dragged-text-action-button');
            if (existingButton) existingButton.remove();
        }
    });
});
