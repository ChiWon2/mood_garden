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
  document.getElementById("overviewPlantName").textContent = data.plantName;
  document.getElementById("overviewEngName").textContent = data.engName;
  const moodBadge = document.getElementById("overviewMoodBadge");
  if (moodBadge) {
    moodBadge.textContent = data.mood;
    moodBadge.className = `tab-tag ${data.badgeClass || plantKey}`;
  }
  document.getElementById("overviewDescBadge").textContent = data.keywords;
  document.getElementById("formBtn").href = `form.html?mood=${plantKey}`;
  const visualEl = document.getElementById("detailPlantVisual");
  if (visualEl) {
    visualEl.className = `game-plant ${data.className} ${activeStage}`;
    visualEl.innerHTML = getPlantHTML(plantKey);
  }
  document.getElementById("detailMeaning").textContent = Array.isArray(data.meaning) ? data.meaning.join("\n\n") : data.meaning;
  document.getElementById("detailMessage").textContent = Array.isArray(data.message) ? data.message.join("\n\n") : data.message;
  document.getElementById("detailCare").textContent = Array.isArray(data.care) ? data.care.join("\n\n") : data.care;
  document.getElementById("detailGameInfo").textContent = Array.isArray(data.gameInfo) ? data.gameInfo.join("\n\n") : data.gameInfo;

  const detailVideo = document.getElementById("detailVideo");
  if (detailVideo && data.youtubeId) {
    detailVideo.src = `https://www.youtube.com/embed/${data.youtubeId}?cc_load_policy=1&hl=ko`;
  }
  const previewItems = document.querySelectorAll(".stage-preview-item");
  previewItems.forEach(function (item) {
    const stage = item.getAttribute("data-stage");
    const plantContainer = item.querySelector(".game-plant");
    if (plantContainer) {
      plantContainer.className = `game-plant ${data.className} ${stage}`;
      plantContainer.innerHTML = getPlantHTML(plantKey);
    }
  });
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

function getPlantKeyFromGameClass(gameClass) {
  const map = {
    "plant-sunflower": "happy",
    "plant-lavender": "calm",
    "plant-moss": "tired",
    "plant-hydrangea": "sad",
    "plant-cactus": "angry"
  };
  return map[gameClass] || "";
}

function getInitialPlantKey() {
  if (sessionStorage.getItem("moodGardenReloaded") === "true") {
    sessionStorage.removeItem("moodGardenShowLastPlantInDictionary");
    return "happy";
  }

  const urlParams = new URLSearchParams(window.location.search);
  const plantParam = urlParams.get("plant");

  if (plantParam && dictionaryData[plantParam]) {
    sessionStorage.removeItem("moodGardenShowLastPlantInDictionary");
    return plantParam;
  }

  if (sessionStorage.getItem("moodGardenPlantedThisSession") === "true") {
    try {
      const savedPlant = JSON.parse(localStorage.getItem("moodGardenPlant") || "{}");
      const savedPlantKey = getPlantKeyFromGameClass(savedPlant.gameClass);
      if (savedPlantKey && dictionaryData[savedPlantKey]) {
        return savedPlantKey;
      }
    } catch (error) {
      localStorage.removeItem("moodGardenPlant");
    }
  }

  if (sessionStorage.getItem("moodGardenShowLastPlantInDictionary") === "true") {
    const lastPlant = localStorage.getItem("moodGardenLastPlant");
    sessionStorage.removeItem("moodGardenShowLastPlantInDictionary");
    if (lastPlant && dictionaryData[lastPlant]) {
      return lastPlant;
    }
  }

  return "happy";
}

function activateTab(plantKey) {
  const tabs = document.querySelectorAll(".dictionary-tab");
  tabs.forEach(function (tab) {
    tab.classList.toggle("active", tab.getAttribute("data-plant") === plantKey);
  });
}

function initDictionary() {
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
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          tabs.forEach(t => t.classList.remove("active"));
          this.classList.add("active");

          const plantKey = this.getAttribute("data-plant");
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
      const gameBtn = document.getElementById("gameBtn");
      if (gameBtn) {
        gameBtn.addEventListener("click", function (event) {
          event.preventDefault();
          window.location.href = `form.html?mood=${activePlantKey}`;
        });
      }
      const initialPlantKey = getInitialPlantKey();
      activeStage = "stage-bloom";
      activateTab(initialPlantKey);
      updateDetailView(initialPlantKey);
    })
    .catch(error => {
      console.error("도감 데이터를 불러오는 중 오류 발생:", error);
    });
}

document.addEventListener("DOMContentLoaded", initDictionary);

