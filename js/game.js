(function () {
const stageText = document.querySelector("#stageText");
const scoreText = document.querySelector("#scoreText");
const roundText = document.querySelector("#roundText");
const growthFill = document.querySelector("#growthFill");
const startBtn = document.querySelector("#startBtn");
const resetBtn = document.querySelector("#resetBtn");
const gamePlant = document.querySelector("#gamePlant");
const gameMessage = document.querySelector("#gameMessage");
const gameGuide = document.querySelector("#gameGuide");
const currentPlantText = document.querySelector("#currentPlantText");
const carePrompt = document.querySelector("#carePrompt");
const careHint = document.querySelector("#careHint");
const miniAction = document.querySelector("#miniAction");
const actionLayer = document.querySelector("#actionLayer");

const plantClasses = ["plant-sunflower", "plant-lavender", "plant-moss", "plant-hydrangea", "plant-cactus"];
const stageClasses = ["stage-seed", "stage-sprout", "stage-bud", "stage-bloom"];
const positiveMoods = ["행복", "평온"];

const actionData = {
  행복: {
    title: "구름을 치워 햇빛을 비춰 주세요",
    guide: "하늘 우상단의 해를 가린 구름을 모두 치우세요.",
    render: renderSunGame
  },
  평온: {
    title: "씨앗에서 피어나는 음표를 잡아 주세요",
    guide: "씨앗 근처에서 랜덤으로 떠오르는 음표를 놓치지 말고 잡으세요.",
    render: renderNoteGame
  },
  피곤: {
    title: "다가오는 방해 요소를 막아 주세요",
    guide: "방해 요소가 씨앗에 닿기 전에 클릭해서 휴식을 지켜 주세요.",
    render: renderShieldGame
  },
  슬픔: {
    title: "씨앗에게 위로가 되는 말을 골라 주세요",
    guide: "말풍선이 하나씩 나타납니다. 마음을 누르는 말은 피하세요.",
    render: renderSpeechGame
  },
  화남: {
    title: "한숨을 길게 내쉬며 감정을 가라앉혀 주세요",
    guide: "버튼을 누르고 있다가 초록 안정 구간에 들어오면 놓으세요.",
    render: renderSighGame
  }
};

let growth = 0;
let chances = 5;
let isPlaying = false;
let activeProfile = null;
let activeTimers = [];
let currentPlant = {
  owner: "",
  mood: "행복",
  plant: "Sunflower",
  korean: "해바라기",
  gameClass: "plant-sunflower",
  level: "보통"
};

function loadPlantFromForm() {
  const saved = localStorage.getItem("moodGardenPlant");

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.gameClass && plantClasses.includes(parsed.gameClass)) {
        currentPlant = parsed;
      }
    } catch (error) {
      localStorage.removeItem("moodGardenPlant");
    }
  }

  gamePlant.classList.remove(...plantClasses);
  gamePlant.classList.add(currentPlant.gameClass);
  currentPlantText.textContent = `오늘의 식물: ${currentPlant.plant} (${currentPlant.korean})`;
}

function getCareProfile() {
  const isPositive = positiveMoods.includes(currentPlant.mood);
  const level = currentPlant.level || "보통";

  if (isPositive) {
    if (level === "높음") return { rounds: 4, start: 18, gain: 34, loss: 5, taskCount: 3, pace: 75, threatDuration: 2800, speechDelay: 4600, label: "좋은 감정이 강하게 남아 있어 성장이 빠릅니다." };
    if (level === "낮음") return { rounds: 5, start: 0, gain: 26, loss: 10, taskCount: 3, pace: 95, threatDuration: 3200, speechDelay: 5200, label: "작은 좋은 감정을 천천히 키워봅니다." };
    return { rounds: 5, start: 8, gain: 30, loss: 8, taskCount: 3, pace: 85, threatDuration: 3000, speechDelay: 5000, label: "안정적인 감정 에너지가 식물을 도와줍니다." };
  }

  if (level === "높음") return { rounds: 6, start: 0, gain: 23, loss: 17, taskCount: 3, pace: 55, threatDuration: 1700, speechDelay: 3000, label: "감정이 크게 올라와 더 빠르고 세심한 돌봄이 필요합니다." };
  if (level === "낮음") return { rounds: 4, start: 8, gain: 31, loss: 9, taskCount: 3, pace: 86, threatDuration: 3400, speechDelay: 5400, label: "감정이 작을 때 부드럽게 돌보면 빠르게 회복됩니다." };
  return { rounds: 5, start: 0, gain: 28, loss: 12, taskCount: 3, pace: 70, threatDuration: 2500, speechDelay: 4400, label: "지금 감정에 맞는 돌봄을 차근차근 선택합니다." };
}

function getGrowthStage() {
  if (growth >= 80) return "stage-bloom";
  if (growth >= 50) return "stage-bud";
  if (growth >= 20) return "stage-sprout";
  return "stage-seed";
}

function getStageName() {
  const stage = getGrowthStage();
  if (stage === "stage-bloom") return "만개";
  if (stage === "stage-bud") return "봉우리";
  if (stage === "stage-sprout") return "새싹";
  return "씨앗";
}

function updateDisplay() {
  stageText.textContent = getStageName();
  scoreText.textContent = `${growth}%`;
  roundText.textContent = `${chances}회`;
  growthFill.style.width = `${growth}%`;
  gamePlant.classList.remove(...stageClasses);
  gamePlant.classList.add(getGrowthStage());
  gamePlant.classList.toggle("bloom", growth >= 100);
}

function addTimer(timerId, type) {
  activeTimers.push({ timerId, type });
}

function clearActionTimers() {
  activeTimers.forEach(function (timer) {
    if (timer.type === "interval") {
      clearInterval(timer.timerId);
    } else {
      clearTimeout(timer.timerId);
    }
  });
  activeTimers = [];
}

function clearActionLayer() {
  clearActionTimers();
  actionLayer.innerHTML = "";
  actionLayer.className = "action-layer";
}

function setProgress(text) {
  miniAction.innerHTML = `<p class="action-progress">${text}</p>`;
}

function markFeedback(success) {
  actionLayer.classList.remove("success-pulse", "fail-shake");
  window.requestAnimationFrame(function () {
    actionLayer.classList.add(success ? "success-pulse" : "fail-shake");
  });
}

function finishGame(message, guide) {
  isPlaying = false;
  clearActionTimers();
  startBtn.disabled = false;
  gameMessage.textContent = message;
  gameGuide.textContent = guide;
  updateDisplay();
}

function completeCare(success, successText, failText) {
  if (!isPlaying || chances <= 0) return;

  clearActionTimers();
  const profile = activeProfile || getCareProfile();
  growth = Math.max(0, Math.min(100, growth + (success ? profile.gain : -profile.loss)));
  chances -= 1;
  markFeedback(success);

  gameMessage.textContent = success ? "돌봄 성공" : "다시 살펴보기";
  gameGuide.textContent = success ? successText : failText;
  updateDisplay();

  if (growth >= 100) {
    finishGame("감정 식물이 만개했어요", `${currentPlant.mood} 감정을 잘 돌봐 ${currentPlant.plant}가 활짝 피었습니다.`);
    return;
  }

  if (chances <= 0) {
    finishGame("돌봄 종료", `최종 성장률은 ${growth}%입니다. 감정 강도에 맞는 돌봄을 다시 시도해 보세요.`);
    return;
  }

  addTimer(window.setTimeout(renderMiniAction, 650), "timeout");
}

function renderSunGame() {
  clearActionLayer();
  const count = activeProfile.taskCount;
  const clouds = Array.from({ length: count }, function (_, index) {
    return `<button class="sky-cloud cloud-${index + 1}" type="button" aria-label="구름 치우기">구름</button>`;
  }).join("");

  actionLayer.classList.add("sun-action");
  actionLayer.innerHTML = `
    <div class="field-sun">해</div>
    ${clouds}
  `;
  setProgress(`해를 가린 구름 ${count}개를 치워 주세요.`);

  actionLayer.querySelectorAll(".sky-cloud").forEach(function (cloud) {
    cloud.addEventListener("click", function () {
      cloud.classList.add("cleared");
      cloud.disabled = true;
      const left = actionLayer.querySelectorAll(".sky-cloud:not(.cleared)").length;
      setProgress(`남은 구름 ${left}개`);
      if (left === 0) {
        completeCare(true, "햇빛이 식물에게 닿아 좋은 감정이 더 선명해졌어요.", "아직 햇빛이 충분하지 않아요.");
      }
    });
  });
}

function renderNoteGame() {
  clearActionLayer();
  let caught = 0;
  const target = activeProfile.taskCount;
  actionLayer.classList.add("note-action");
  setProgress(`씨앗에서 나오는 음표 ${target}개를 잡아 주세요.`);

  function spawnNote() {
    if (!isPlaying || caught >= target) return;
    const note = document.createElement("button");
    note.type = "button";
    note.className = "seed-note";
    note.textContent = "♪";
    note.style.left = `${42 + Math.random() * 26}%`;
    note.style.bottom = `${24 + Math.random() * 18}%`;
    actionLayer.appendChild(note);

    const missTimer = window.setTimeout(function () {
      if (note.isConnected) {
        note.remove();
        completeCare(false, "음표를 잡았어요.", "음표를 놓쳐 평온한 리듬이 흐트러졌어요.");
      }
    }, activeProfile.pace * 18);
    addTimer(missTimer, "timeout");

    note.addEventListener("click", function () {
      if (!note.isConnected) return;
      note.remove();
      caught += 1;
      setProgress(`잡은 음표 ${caught}/${target}`);
      if (caught >= target) {
        completeCare(true, "부드러운 음표가 라벤더 주변에 머물며 마음이 차분해졌어요.", "음표가 더 필요해요.");
      } else {
        spawnNote();
      }
    });
  }

  spawnNote();
}

function renderShieldGame() {
  clearActionLayer();
  let blocked = 0;
  let failed = false;
  const target = activeProfile.taskCount;
  const labels = ["알림", "소음", "걱정", "불빛"];
  const layerRect = actionLayer.getBoundingClientRect();
  const plantRect = gamePlant.getBoundingClientRect();
  const targetX = plantRect.left - layerRect.left + plantRect.width / 2 - 37;
  const targetY = plantRect.top - layerRect.top + plantRect.height * 0.86 - 23;
  const starts = [
    { x: 18, y: 50 },
    { x: Math.max(18, layerRect.width - 100), y: 60 },
    { x: 38, y: Math.max(40, layerRect.height - 92) }
  ];
  actionLayer.classList.add("shield-action");
  setProgress(`방해 요소 ${target}개를 씨앗에 닿기 전에 막아 주세요.`);

  labels.slice(0, target).forEach(function (label, index) {
    const threat = document.createElement("button");
    threat.type = "button";
    threat.className = "threat";
    threat.textContent = label;
    const start = starts[index % starts.length];
    threat.style.left = `${start.x}px`;
    threat.style.top = `${start.y}px`;
    threat.style.setProperty("--tx", `${targetX - start.x}px`);
    threat.style.setProperty("--ty", `${targetY - start.y}px`);
    threat.style.animationDuration = `${activeProfile.threatDuration + index * 120}ms`;
    actionLayer.appendChild(threat);

    const hitTimer = window.setTimeout(function () {
      if (threat.isConnected && !threat.classList.contains("blocked") && !failed) {
        failed = true;
        completeCare(false, "방해 요소를 막았어요.", "방해 요소가 꽃에 닿아 휴식이 깨졌어요.");
      }
    }, activeProfile.threatDuration + index * 120);
    addTimer(hitTimer, "timeout");

    threat.addEventListener("click", function () {
      if (!threat.isConnected || failed) return;
      threat.classList.add("blocked");
      threat.disabled = true;
      blocked += 1;
      setProgress(`막은 방해 요소 ${blocked}/${target}`);
      if (blocked >= target) {
        completeCare(true, "방해 요소를 막아 이끼가 조용히 쉴 수 있게 됐어요.", "아직 휴식 공간이 부족해요.");
      }
    });
  });
}

function renderSpeechGame() {
  clearActionLayer();
  let index = 0;
  let picked = 0;
  const target = activeProfile.taskCount;
  const warm = ["괜찮아", "천천히 해도 돼", "곁에 있어", "버텨줘서 고마워"];
  const cold = ["빨리 잊어", "별일 아니야", "참아", "그만해"];
  const words = warm.slice(0, target).map(function (text) {
    return { text, warm: true };
  }).concat(cold.slice(0, Math.min(target, 3)).map(function (text) {
    return { text, warm: false };
  })).sort(function () { return Math.random() - 0.5; });

  actionLayer.classList.add("speech-action");
  setProgress(`위로가 되는 말 ${target}개를 골라 주세요.`);

  function showBubble() {
    if (!isPlaying || picked >= target) return;
    clearActionTimers();
    if (index >= words.length) {
      completeCare(false, "따뜻한 말을 골랐어요.", "위로가 충분히 모이기 전에 말풍선이 사라졌어요.");
      return;
    }
    const word = words[index];
    index += 1;
    actionLayer.innerHTML = `
      <div class="speech-line"></div>
      <button class="speech-bubble" type="button" data-warm="${word.warm}">${word.text}</button>
    `;

    const bubble = actionLayer.querySelector(".speech-bubble");
    bubble.addEventListener("click", function () {
      const ok = bubble.dataset.warm === "true";
      if (!ok) {
        completeCare(false, "따뜻한 말을 골랐어요.", "그 말은 지금의 슬픔을 충분히 안아주지 못했어요.");
        return;
      }

      picked += 1;
      setProgress(`고른 위로 ${picked}/${target}`);
      if (picked >= target) {
        completeCare(true, "다정한 말이 씨앗에게 닿아 수국의 마음이 부드러워졌어요.", "위로가 더 필요해요.");
      } else {
        showBubble();
      }
    });

    const skipTimer = window.setTimeout(showBubble, activeProfile.speechDelay);
    addTimer(skipTimer, "timeout");
  }

  showBubble();
}

function renderSighGame() {
  clearActionLayer();
  let exhale = 0;
  let holding = false;
  actionLayer.classList.add("sigh-action");
  actionLayer.innerHTML = `
    <div class="sigh-cloud"></div>
    <div class="sigh-meter">
      <span class="calm-zone">안정</span>
      <i id="sighFill"></i>
    </div>
    <button class="sigh-button" type="button">길게 한숨 내쉬기</button>
  `;
  setProgress("버튼을 누르고 있다가 초록 안정 구간에서 놓으세요.");

  const button = actionLayer.querySelector(".sigh-button");
  const fill = actionLayer.querySelector("#sighFill");

  function startHold(event) {
    event.preventDefault();
    holding = true;
  }

  function endHold() {
    if (!holding || !isPlaying) return;
    holding = false;
    const ok = exhale >= 58 && exhale <= 78;
    completeCare(ok, "긴 숨을 내쉬자 선인장의 날카로운 마음이 조금 가라앉았어요.", "숨이 너무 짧거나 길었어요. 안정 구간을 다시 노려 보세요.");
  }

  button.addEventListener("pointerdown", startHold);
  button.addEventListener("pointerup", endHold);
  button.addEventListener("pointerleave", endHold);

  const meterTimer = window.setInterval(function () {
    if (!isPlaying) return;
    if (holding) {
      exhale = Math.min(100, exhale + (100 - activeProfile.pace) / 12 + 2.8);
    } else {
      exhale = Math.max(0, exhale - 2);
    }
    fill.style.width = `${exhale}%`;
    actionLayer.querySelector(".sigh-cloud").style.opacity = `${Math.min(0.8, exhale / 100)}`;
    if (exhale >= 100) {
      completeCare(false, "숨을 골랐어요.", "숨을 너무 오래 참아 감정이 다시 올라왔어요.");
    }
  }, 60);
  addTimer(meterTimer, "interval");
}

function renderMiniAction() {
  clearActionLayer();
  if (!isPlaying) return;
  const action = actionData[currentPlant.mood] || actionData.행복;
  carePrompt.textContent = action.title;
  careHint.textContent = action.guide;
  action.render();
}

function startGame() {
  loadPlantFromForm();
  activeProfile = getCareProfile();
  growth = activeProfile.start;
  chances = activeProfile.rounds;
  isPlaying = true;
  startBtn.disabled = true;
  gameMessage.textContent = "식물 화면에서 직접 돌봄을 시작하세요";
  gameGuide.textContent = activeProfile.label;
  updateDisplay();
  renderMiniAction();
}

function resetGame() {
  loadPlantFromForm();
  activeProfile = getCareProfile();
  growth = activeProfile.start;
  chances = activeProfile.rounds;
  isPlaying = false;
  startBtn.disabled = false;
  clearActionLayer();
  carePrompt.textContent = "오늘의 감정 식물이 기다리고 있어요.";
  careHint.textContent = `${currentPlant.mood} 감정 · ${currentPlant.level || "보통"} 강도에 맞는 돌봄이 식물 화면에서 시작됩니다.`;
  setProgress(activeProfile.label);
  gameMessage.textContent = "감정 강도까지 반영해 돌봄이 달라집니다";
  gameGuide.textContent = "행복과 평온은 강도가 높을수록 성장 보너스를 받고, 피곤·슬픔·화남은 강도가 높을수록 더 세심한 돌봄이 필요합니다.";
  updateDisplay();
}

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

resetGame();
})();
