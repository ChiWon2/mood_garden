document.addEventListener('DOMContentLoaded', () => {
    const siteHeader = document.getElementById('siteHeader');
    const menuToggleBtn = document.getElementById('menuToggleBtn');

    if (siteHeader && menuToggleBtn) {
      menuToggleBtn.addEventListener('click', () => {
        const isOpen = siteHeader.classList.toggle('menu-open');
        menuToggleBtn.textContent = isOpen ? '-' : '+';
      });
    }
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
    angerInput.addEventListener('input', () => {
      let currentLength = angerInput.value.length;
      if (currentLength > 500) {
        angerInput.value = angerInput.value.substring(0, 500);
        currentLength = 500;
      }
      charCount.textContent = currentLength + '/500';
    });
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
    resetBtn.addEventListener('click', resetAction);
    retryBtn.addEventListener('click', resetAction);
  });
