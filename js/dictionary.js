let dictionaryData = {};
let activePlantKey = "happy";
let activeStage = "stage-bloom";

const moodBgmMap = {
  "happy": "audio/happy.mp3",
  "calm": "audio/calm.mp3",
  "tired": "audio/tired.mp3",
  "sad": "audio/sad.mp3",
  "angry": "audio/angry.mp3"
};

function getPlantHTML(plantKey) {
  if (plantKey === "moss" || plantKey === "cactus") {
    return "<strong></strong>";
  }
  return "<span></span><span></span><strong></strong>";
}

function updateDetailView(plantKey) {
  activePlantKey = plantKey;
  const data = dictionaryData[plantKey];

  if (!data) return;

  // 1. 왼쪽 개요 카드의 정보 업데이트
  document.getElementById("overviewPlantName").textContent = data.plantName;
  document.getElementById("overviewEngName").textContent = data.engName;
  const moodBadge = document.getElementById("overviewMoodBadge");
  if (moodBadge) {
    moodBadge.textContent = data.mood;
    moodBadge.className = `tab-tag ${data.badgeClass || plantKey}`;
  }
  document.getElementById("overviewDescBadge").textContent = data.keywords;
  document.getElementById("formBtn").href = `form.html?mood=${plantKey}`;

  // 2. 대형 식물 그래픽 디스플레이 업데이트
  const visualEl = document.getElementById("detailPlantVisual");
  if (visualEl) {
    visualEl.className = `game-plant ${data.className} ${activeStage}`;
    visualEl.innerHTML = getPlantHTML(plantKey);
  }

  // 3. 오른쪽 상세 설명 텍스트 및 추천 영상 업데이트
  document.getElementById("detailMeaning").textContent = Array.isArray(data.meaning) ? data.meaning.join("\n\n") : data.meaning;
  document.getElementById("detailMessage").textContent = Array.isArray(data.message) ? data.message.join("\n\n") : data.message;
  document.getElementById("detailCare").textContent = Array.isArray(data.care) ? data.care.join("\n\n") : data.care;
  document.getElementById("detailGameInfo").textContent = Array.isArray(data.gameInfo) ? data.gameInfo.join("\n\n") : data.gameInfo;

  const detailVideo = document.getElementById("detailVideo");
  if (detailVideo && data.youtubeId) {
    detailVideo.src = `https://www.youtube.com/embed/${data.youtubeId}?cc_load_policy=1&hl=ko`;
  }

  // 4. 성장 단계별 미리보기 썸네일 업데이트
  const previewItems = document.querySelectorAll(".stage-preview-item");
  previewItems.forEach(function (item) {
    const stage = item.getAttribute("data-stage");
    const plantContainer = item.querySelector(".game-plant");
    if (plantContainer) {
      plantContainer.className = `game-plant ${data.className} ${stage}`;
      plantContainer.innerHTML = getPlantHTML(plantKey);
    }
  });

  // 5. BGM 플레이어 소스 업데이트
  const bgmPlayer = document.getElementById("bgmPlayer");
  if (bgmPlayer) {
    const bgmSrc = moodBgmMap[plantKey] || moodBgmMap["happy"];
    const isPlaying = !bgmPlayer.paused;
    
    bgmPlayer.loop = true;
    bgmPlayer.src = bgmSrc;
    if (isPlaying) {
      bgmPlayer.play().catch(function () {});
    }
  }
}

function initDictionary() {
  // JSON 파일로부터 식물 도감 데이터 로드
  fetch("js/dictionary.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("식물 데이터 로드 실패: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      dictionaryData = data;

      const tabs = document.querySelectorAll(".dictionary-tab");

      // 탭 클릭 이벤트 리스너
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          tabs.forEach(t => t.classList.remove("active"));
          this.classList.add("active");

          const plantKey = this.getAttribute("data-plant");
          
          // 식물 선택 변경 시 활성 단계를 만개(bloom)로 초기화
          activeStage = "stage-bloom";
          const previewItems = document.querySelectorAll(".stage-preview-item");
          previewItems.forEach(function (item) {
            if (item.getAttribute("data-stage") === "stage-bloom") {
              item.classList.add("active");
            } else {
              item.classList.remove("active");
            }
          });

          updateDetailView(plantKey);
        });
      });

      // 성장 단계 미리보기 클릭 이벤트 리스너
      const previewItems = document.querySelectorAll(".stage-preview-item");
      previewItems.forEach(function (item) {
        item.addEventListener("click", function () {
          previewItems.forEach(i => i.classList.remove("active"));
          this.classList.add("active");

          activeStage = this.getAttribute("data-stage");
          const plantData = dictionaryData[activePlantKey];
          const visualEl = document.getElementById("detailPlantVisual");
          if (visualEl) {
            visualEl.className = `game-plant ${plantData.className} ${activeStage}`;
          }
        });
      });

      // 식물 돌보기 버튼 클릭 시 선택된 식물 정보를 로컬 스토리지에 저장하여 게임에 연동
      const gameBtn = document.getElementById("gameBtn");
      if (gameBtn) {
        gameBtn.addEventListener("click", function (event) {
          event.preventDefault();
          const plantData = dictionaryData[activePlantKey];

          // 로컬스토리지에서 owner 값을 불러옴
          let ownerName = "도감 가드너";
          const savedPlant = localStorage.getItem("moodGardenPlant");
          if (savedPlant) {
            try {
              const parsed = JSON.parse(savedPlant);
              if (parsed && parsed.owner) {
                ownerName = parsed.owner;
              }
            } catch (e) {
              console.error(e);
            }
          }

          // 로컬스토리지 값이 없다면 owner: 도감가드너, 난이도는 '보통'으로 기본 세팅
          const plantObj = {
            owner: ownerName,
            mood: plantData.mood,
            plant: plantData.engName,
            korean: plantData.plantName,
            gameClass: plantData.className,
            level: "보통"
          };
          localStorage.setItem("moodGardenPlant", JSON.stringify(plantObj));
          window.location.href = "game.html";
        });
      }

      // 기본 식물(행복-해바라기) 로드
      updateDetailView("happy");
    })
    .catch(error => {
      console.error("도감 데이터를 불러오는 중 오류 발생:", error);
    });
}

document.addEventListener("DOMContentLoaded", initDictionary);
