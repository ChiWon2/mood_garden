document.addEventListener('DOMContentLoaded', () => {
    // 모바일 헤더 토글 제어 인터페이스
    const siteHeader = document.getElementById('siteHeader');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
  
    if (siteHeader && menuToggleBtn) {
      menuToggleBtn.addEventListener('click', () => {
        const isOpen = siteHeader.classList.toggle('menu-open');
        // 기획서 스펙에 맞춰 열리면 -, 닫히면 + 로 텍스트 스위칭
        menuToggleBtn.textContent = isOpen ? '-' : '+';
      });
    }
  
    // 기존 소각장 폼 컴포넌트들
    const angerInput = document.getElementById('angerInput');
    const charCount = document.getElementById('charCount');
    const speedSelect = document.getElementById('speedSelect');
    const burnBtn = document.getElementById('burnBtn');
    const resetBtn = document.getElementById('resetBtn');
    const retryBtn = document.getElementById('retryBtn');
    const angerPaper = document.getElementById('angerPaper');
    const resultMessage = document.getElementById('resultMessage');
  
    if (!angerInput || !charCount || !speedSelect || !burnBtn || !resetBtn || !retryBtn || !angerPaper || !resultMessage) {
      console.error("소각장 필수 HTML 요소를 로드하지 못했습니다.");
      return;
    }
  
    // 공통 리셋 동작 함수
    function resetAction() {
      angerInput.value = '';
      charCount.textContent = '0/500';
      
      angerPaper.classList.remove('burning');
      angerPaper.style.removeProperty('--burn-duration');
      angerPaper.style.display = 'flex';
      resultMessage.style.display = 'none';
      
      burnBtn.disabled = false;
      resetBtn.disabled = false;
      angerInput.disabled = false;
      angerInput.focus();
    }
  
    // 1. 실시간 글자수 카운트
    angerInput.addEventListener('input', () => {
      let currentLength = angerInput.value.length;
      if (currentLength > 500) {
        angerInput.value = angerInput.value.substring(0, 500);
        currentLength = 500;
      }
      charCount.textContent = currentLength + '/500';
    });
  
    // 2. 태우기 버튼 애니메이션 트리거
    burnBtn.addEventListener('click', () => {
      if (!angerInput.value.trim()) {
        alert('태워버릴 마음의 글을 먼저 작성해 주세요.');
        return;
      }
  
      burnBtn.disabled = true;
      resetBtn.disabled = true;
      angerInput.disabled = true;
  
      const selectedDuration = speedSelect.value;
      angerPaper.style.setProperty('--burn-duration', selectedDuration);
      
      angerPaper.classList.remove('burning');
      void angerPaper.offsetWidth; 
      angerPaper.classList.add('burning');
  
      const durationMs = parseFloat(selectedDuration) * 1000;
  
      setTimeout(() => {
        angerPaper.style.display = 'none';
        resultMessage.style.display = 'flex';
      }, durationMs);
    });
  
    // 3. 버튼 이벤트 리스너 연결
    resetBtn.addEventListener('click', resetAction);
    retryBtn.addEventListener('click', resetAction);
  });