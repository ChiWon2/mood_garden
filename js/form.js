const moodData = {
  happy: {
    mood: "행복",
    plant: "Sunflower",
    korean: "해바라기",
    className: "sunflower",
    gameClass: "plant-sunflower",
    message: "행복한 감정은 오늘 하루에 좋은 빛이 있었다는 뜻이에요. 그 기분을 그냥 지나치지 말고, 무엇이 나를 웃게 했는지 기억해 보세요.",
    meaning: "해바라기는 밝은 방향을 향해 자라듯, 오늘의 좋은 순간을 더 오래 바라보게 도와줘요.",
    care: "오늘은 그 좋은 감정을 충분히 인정하고, 해바라기에게 햇빛을 비춰 주세요."
  },
  calm: {
    mood: "평온",
    plant: "Lavender",
    korean: "라벤더",
    className: "lavender",
    gameClass: "plant-lavender",
    message: "평온함은 마음이 잠시 균형을 찾았다는 신호예요. 큰 변화가 없어도 괜찮은 하루가 있습니다.",
    meaning: "라벤더는 조용히 향을 남기듯, 오늘의 차분함을 오래 머물게 해줘요.",
    care: "오늘은 조용한 분위기를 만들고, 라벤더에게 부드러운 음악을 들려 주세요."
  },
  tired: {
    mood: "피곤",
    plant: "Moss",
    korean: "이끼",
    className: "moss",
    gameClass: "plant-moss",
    message: "피곤함은 멈춰야 한다는 몸과 마음의 신호일 수 있어요. 오늘 충분히 애쓴 만큼 회복할 시간이 필요해요.",
    meaning: "이끼는 느리지만 꾸준히 자라며 쉬어가는 마음을 닮았어요.",
    care: "오늘은 더 밀어붙이기보다 잠시 멈추고, 이끼가 쉴 수 있게 방해 요소를 줄여 주세요."
  },
  sad: {
    mood: "슬픔",
    plant: "Hydrangea",
    korean: "수국",
    className: "hydrangea",
    gameClass: "plant-hydrangea",
    message: "슬픔은 약한 감정이 아니라, 마음이 무언가를 소중하게 여겼다는 흔적일 수 있어요.",
    meaning: "수국은 색이 겹겹이 모여 피어나듯, 복잡한 마음도 천천히 바라볼 수 있게 해줘요.",
    care: "오늘은 마음을 재촉하지 말고, 수국에게 따뜻한 말을 건네 주세요."
  },
  angry: {
    mood: "화남",
    plant: "Cactus",
    korean: "선인장",
    className: "cactus",
    gameClass: "plant-cactus",
    message: "화남은 나를 지키려는 마음에서 시작되기도 해요. 다만 그 감정이 나를 다치게 하지 않도록 거리가 필요해요.",
    meaning: "선인장은 가시를 가졌지만 안쪽에는 수분을 품고 있어요.",
    care: "오늘은 바로 반응하기보다 숨을 고르고, 선인장이 차분히 버틸 시간을 주세요."
  }
};

const form = document.querySelector("#moodForm");
const resultCard = document.querySelector("#resultCard");

function getPlantHTML(gameClass) {
  if (gameClass === "plant-moss" || gameClass === "plant-cactus") {
    return "<strong></strong>";
  }

  return "<span></span><span></span><strong></strong>";
}

function escapeHTML(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.querySelector("#userName").value.trim();
  const moodKey = document.querySelector("#moodSelect").value;
  const level = document.querySelector("input[name='level']:checked");
  const note = document.querySelector("#todayNote").value.trim();

  if (!name || !moodKey || !level || !note) {
    resultCard.innerHTML = `
      <p class="eyebrow">Check</p>
      <h2>입력 내용을 확인해 주세요</h2>
      <p>이름, 감정, 감정 강도, 오늘의 한 줄을 모두 입력해야 식물이 생성됩니다.</p>
      <div class="result-plant-preview waiting" id="resultPlant" aria-label="아직 생성되지 않은 감정 식물"></div>
    `;
    return;
  }

  const selected = moodData[moodKey];
  const safeName = escapeHTML(name);
  const safeNote = escapeHTML(note);

  sessionStorage.setItem("moodGardenPlant", JSON.stringify({
    source: "form",
    owner: name,
    mood: selected.mood,
    plant: selected.plant,
    korean: selected.korean,
    gameClass: selected.gameClass,
    level: level.value
  }));

  resultCard.innerHTML = `
    <p class="eyebrow">Today Plant</p>
    <h2>${safeName}님의 식물은 ${selected.plant}</h2>
    <p><strong>${selected.korean}</strong> · 감정 ${selected.mood} · 강도 ${level.value}</p>
    <div class="result-plant-preview" id="resultPlant" aria-label="${selected.korean} 감정 식물">
      <div class="game-plant ${selected.gameClass} stage-bloom">
        ${getPlantHTML(selected.gameClass)}
      </div>
    </div>
    <p>${selected.message}</p>
    <p>${selected.meaning}</p>
    <p><strong>오늘의 돌봄:</strong> ${selected.care}</p>
    <p>오늘의 한 줄: ${safeNote}</p>
    <p>이 식물은 오늘의 정원과 감정 돌보기 게임에 바로 반영됩니다.</p>
    <a class="button primary full" href="game.html">이 식물 키우러 가기</a>
    <a class="button secondary full" href="dictionary.html" style="margin-top: 10px;">감정도감에서 식물 확인하기</a>
  `;
});
function selectMoodFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const moodParam = urlParams.get("mood");

  if (moodParam && moodData[moodParam]) {
    const moodSelect = document.querySelector("#moodSelect");
    if (moodSelect) {
      moodSelect.value = moodParam;
    }
  }
}

function checkSavedPlant() {
  const saved = sessionStorage.getItem("moodGardenPlant");
  if (!saved) return;

  try {
    const plant = JSON.parse(saved);
    let selected = null;
    for (const key in moodData) {
      if (moodData[key].gameClass === plant.gameClass) {
        selected = moodData[key];
        break;
      }
    }

    if (selected) {
      resultCard.innerHTML = `
        <p class="eyebrow">Today Plant</p>
        <h2>지금 "${selected.korean}"이(가) 심어져 있어요</h2>
        <div class="result-plant-preview" id="resultPlant" aria-label="${selected.korean} 감정 식물">
          <div class="game-plant ${selected.gameClass} stage-bloom">
            ${getPlantHTML(selected.gameClass)}
          </div>
        </div>
        <p>폼을 새로 작성하면 이곳에 새로운 오늘의 식물과 성장 메시지가 표시됩니다.</p>
        <a class="button primary full" href="game.html" style="margin-top: 15px;">이 식물 키우러 가기</a>
        <a class="button secondary full" href="dictionary.html" style="margin-top: 10px;">감정도감에서 식물 확인하기</a>
      `;
    }
  } catch (error) {
    console.error("저장된 식물 데이터를 읽는 데 실패했습니다.", error);
  }
}

function initForm() {
  selectMoodFromURL();
  checkSavedPlant();
}

document.addEventListener("DOMContentLoaded", initForm);

