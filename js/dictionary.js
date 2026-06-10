let dictionaryData = {};
let activePlantKey = "happy";
let activeStage = "stage-bloom";

// 감정별 BGM 매핑
const moodBgmMap = {
  "happy": "audio/happy.mp3",
  "calm": "audio/calm.mp3",
  "tired": "audio/tired.mp3",
  "sad": "audio/sad.mp3",
  "angry": "audio/angry.mp3"
};

/*
 * 식물의 HTML 내부 요소 생성
 * 이끼(moss)와 선인장(cactus)은 줄기나 잎 애니메이션 요소를 사용하지 않으므로 태그만 반환,
 * 그 외 식물은 애니메이션 효과용 <span> 태그 추가
 */
function getPlantHTML(plantKey) {
  if (plantKey === "moss" || plantKey === "cactus") {
    return "<strong></strong>";
  }
  return "<span></span><span></span><strong></strong>";
}

/* 선택된 식물 정보를 바탕으로 도감 상세 화면을 업데이트 */
function updateDetailView(plantKey) {
  activePlantKey = plantKey;
  const data = dictionaryData[plantKey];

  if (!data) return;

  // 식물 기본 정보 업데이트
  document.getElementById("overviewPlantName").textContent = data.plantName;
  document.getElementById("overviewEngName").textContent = data.engName;
  
  const moodBadge = document.getElementById("overviewMoodBadge");
  if (moodBadge) {
    moodBadge.textContent = data.mood;
    moodBadge.className = `tab-tag ${data.badgeClass || plantKey}`;
  }
  document.getElementById("overviewDescBadge").textContent = data.keywords;
  
  // '이 감정 심기' 버튼의 이동 경로에 현재 선택한 감정의 쿼리 스트링 추가
  document.getElementById("formBtn").href = `form.html?mood=${plantKey}`;
  
  // 메인 식물 시각 요소(CSS 그래픽) 설정
  const visualEl = document.getElementById("detailPlantVisual");
  if (visualEl) {
    visualEl.className = `game-plant ${data.className} ${activeStage}`;
    visualEl.innerHTML = getPlantHTML(plantKey);
  }
  
  // 꽃말, 메시지, 가이드, 미니게임 상세 텍스트 정보 반영 (배열인 경우 줄바꿈하여 연결)
  document.getElementById("detailMeaning").textContent = Array.isArray(data.meaning) ? data.meaning.join("\n\n") : data.meaning;
  document.getElementById("detailMessage").textContent = Array.isArray(data.message) ? data.message.join("\n\n") : data.message;
  document.getElementById("detailCare").textContent = Array.isArray(data.care) ? data.care.join("\n\n") : data.care;
  document.getElementById("detailGameInfo").textContent = Array.isArray(data.gameInfo) ? data.gameInfo.join("\n\n") : data.gameInfo;

  // 유튜브 감정 테라피 추천 영상 iframe 주소 설정
  const detailVideo = document.getElementById("detailVideo");
  if (detailVideo && data.youtubeId) {
    detailVideo.src = `https://www.youtube.com/embed/${data.youtubeId}?cc_load_policy=1&hl=ko`;
  }
  
  // 우측 하단 성장 단계별 미리보기 카드들의 시각 요소 업데이트
  const previewItems = document.querySelectorAll(".stage-preview-item");
  previewItems.forEach(function (item) {
    const stage = item.getAttribute("data-stage");
    const plantContainer = item.querySelector(".game-plant");
    if (plantContainer) {
      plantContainer.className = `game-plant ${data.className} ${stage}`;
      plantContainer.innerHTML = getPlantHTML(plantKey);
    }
  });
  
  // BGM 플레이어 음원 설정 및 재생 제어
  const bgmPlayer = document.getElementById("bgmPlayer");
  if (bgmPlayer) {
    const bgmSrc = moodBgmMap[plantKey] || moodBgmMap["happy"];
    const isPlaying = !bgmPlayer.paused; // 현재 BGM이 재생 중인지 체크

    bgmPlayer.loop = true;
    bgmPlayer.src = bgmSrc;
    // 이전에 음악을 재생하고 있던 상태라면 새로운 곡도 자동으로 시작
    if (isPlaying) {
      bgmPlayer.play().catch(function () {});
    }
  }
}

/* 도감 접속 시 처음에 어떤 식물을 보여줄지 판단하는 함수 */
function getInitialPlantKey() {
  // 세션 스토리지에서 현재 심어진 식물 확인
  const savedPlant = sessionStorage.getItem("moodGardenPlant");
  if (savedPlant) {
    try {
      const parsed = JSON.parse(savedPlant);
      const gameClass = parsed.gameClass; // "plant-sunflower", "plant-lavender", etc.

      // gameClass를 도감 영문 키값으로 변환
      const map = {
        "plant-sunflower": "happy",
        "plant-lavender": "calm",
        "plant-moss": "tired",
        "plant-hydrangea": "sad",
        "plant-cactus": "angry"
      };

      const plantKey = map[gameClass];
      if (plantKey && dictionaryData[plantKey]) {
        return plantKey;
      }
    } catch (e) {
      console.error("저장된 식물 데이터를 읽는 데 실패했습니다.", e);
    }
  }

  // 기본값 (해바라기)
  return "happy";
}

/* 특정 식물 탭에 active 클래스를 적용, 시각적으로 선택 표시를 해주는 함수 */
function activateTab(plantKey) {
  const tabs = document.querySelectorAll(".dictionary-tab");
  tabs.forEach(function (tab) {
    tab.classList.toggle("active", tab.getAttribute("data-plant") === plantKey);
  });
}

/* 도감 페이지 초기화 */
function initDictionary() {
  // 식물 상세 정보가 담긴 JSON 데이터 로드
  fetch("js/dictionary.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("식물 데이터 로드 실패: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      dictionaryData = data;

      // 식물 전환 상단 탭에 클릭 이벤트 설정
      const tabs = document.querySelectorAll(".dictionary-tab");
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          // 기존 활성화된 탭 비활성화 후 클릭한 탭 활성화
          tabs.forEach(t => t.classList.remove("active"));
          this.classList.add("active");

          const plantKey = this.getAttribute("data-plant");
          activeStage = "stage-bloom"; // 탭 변경 시 성장 단계를 '만개' 상태로 리셋
          
          // 성장 단계 미리보기 버튼들도 '만개'로 활성화 상태 변경
          const previewItems = document.querySelectorAll(".stage-preview-item");
          previewItems.forEach(function (item) {
            if (item.getAttribute("data-stage") === "stage-bloom") {
              item.classList.add("active");
            } else {
              item.classList.remove("active");
            }
          });

          // 상세 화면 정보 업데이트
          updateDetailView(plantKey);
        });
      });

      // 성장 단계(씨앗, 새싹, 봉우리, 만개) 클릭 이벤트 설정
      const previewItems = document.querySelectorAll(".stage-preview-item");
      previewItems.forEach(function (item) {
        item.addEventListener("click", function () {
          // 클릭한 단계에 active 표시
          previewItems.forEach(i => i.classList.remove("active"));
          this.classList.add("active");

          // 선택한 단계로 메인 식물 시각 요소(CSS 애니메이션) 이미지 업데이트
          activeStage = this.getAttribute("data-stage");
          const plantData = dictionaryData[activePlantKey];
          const visualEl = document.getElementById("detailPlantVisual");
          if (visualEl) {
            visualEl.className = `game-plant ${plantData.className} ${activeStage}`;
          }
        });
      });

      // 도감 최초 진입 시, 적절한 초기 식물 정보 설정 및 로드
      const initialPlantKey = getInitialPlantKey();
      activeStage = "stage-bloom";
      activateTab(initialPlantKey);
      updateDetailView(initialPlantKey);
    })
    .catch(error => {
      console.error("도감 데이터를 불러오는 중 오류 발생:", error);
    });
}

// DOM이 완전히 로드된 후 도감 초기화 시작
document.addEventListener("DOMContentLoaded", initDictionary);
