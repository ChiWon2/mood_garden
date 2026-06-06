const gameTitle = document.querySelector("#gameTitle");
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
const gameField = document.querySelector("#gameField");

const plantClasses = [
  "plant-sunflower",
  "plant-lavender",
  "plant-moss",
  "plant-hydrangea",
  "plant-cactus"
];
const stageClasses = ["stage-seed", "stage-sprout", "stage-bud", "stage-bloom"];
const positiveMoods = ["행복", "평온"];

const defaultPlant = {
  owner: "가드너",
  mood: "행복",
  plant: "Sunflower",
  korean: "해바라기",
  gameClass: "plant-sunflower",
  level: "보통"
};

const actionData = {
  행복: {
    title: "구름을 치워 햇빛을 비춰 주세요",
    guide: "좋은 감정이 오래 머물 수 있도록 햇빛 앞의 구름을 모두 클릭하세요.",
    render: renderSunGame
  },
  평온: {
    title: "라벤더에서 떠오르는 음표를 잡아 주세요",
    guide: "차분한 리듬이 흩어지기 전에 떠오르는 음표를 차례대로 클릭하세요.",
    render: renderNoteGame
  },
  피곤: {
    title: "다가오는 방해 요소를 막아 주세요",
    guide: "과제, 알림, 밤샘 같은 피로 요소가 식물에 닿기 전에 클릭해서 막으세요.",
    render: renderShieldGame
  },
  슬픔: {
    title: "식물에게 필요한 따뜻한 말을 골라 주세요",
    guide: "여러 말풍선 중 지금의 마음을 재촉하지 않는 다정한 말을 선택하세요.",
    render: renderSpeechGame
  },
  화남: {
    title: "안정 구간에서 숨을 놓아 주세요",
    guide: "버튼을 누르다가 게이지가 초록 안정 구간에 오면 손을 떼세요.",
    render: renderSighGame
  }
};

let growth = 0;
let chances = 5;
let isPlaying = false;
let activeProfile = null;
let activeTimers = [];
let currentPlant = { ...defaultPlant };

function readSavedPlant() {
  const saved = localStorage.getItem("moodGardenPlant");

  if (!saved) {
    currentPlant = { ...defaultPlant };
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    currentPlant = { ...defaultPlant, ...parsed };

    if (!plantClasses.includes(currentPlant.gameClass)) {
      currentPlant.gameClass = defaultPlant.gameClass;
    }
    if (!actionData[currentPlant.mood]) {
      currentPlant.mood = defaultPlant.mood;
    }
  } catch (error) {
    localStorage.removeItem("moodGardenPlant");
    currentPlant = { ...defaultPlant };
  }
}

function applyPlantToScreen() {
  gamePlant.classList.remove(...plantClasses);
  gamePlant.classList.add(currentPlant.gameClass);
  gameTitle.textContent = `${currentPlant.owner || "가드너"}님의 ${currentPlant.korean} 돌보기`;
  currentPlantText.className = "current-plant";
  currentPlantText.classList.add(`current-${currentPlant.gameClass.replace("plant-", "")}`);

  const plantLabel = document.createElement("span");
  const plantName = document.createElement("strong");
  const plantMeta = document.createElement("span");

  plantLabel.className = "plant-label";
  plantLabel.textContent = "오늘의 식물";
  plantName.textContent = `${currentPlant.plant} (${currentPlant.korean})`;
  plantMeta.textContent = `감정 ${currentPlant.mood} · 강도 ${currentPlant.level || "보통"}`;
  currentPlantText.replaceChildren(plantLabel, plantName, plantMeta);
}

function loadPlantFromForm() {
  readSavedPlant();
  applyPlantToScreen();
}

function getCareProfile() {
  const level = currentPlant.level || "보통";
  const isPositive = positiveMoods.includes(currentPlant.mood);
  const positiveProfiles = {
    낮음: {
      rounds: 5,
      start: 0,
      gain: 26,
      loss: 10,
      pace: 96,
      threatDuration: 3400,
      speechDelay: 5600,
      label: "작은 좋은 감정도 천천히 돌보면 충분히 자랄 수 있어요."
    },
    보통: {
      rounds: 5,
      start: 8,
      gain: 30,
      loss: 8,
      pace: 86,
      threatDuration: 3200,
      speechDelay: 5200,
      label: "오늘의 좋은 감정에 맞춰 균형 잡힌 돌봄을 시작합니다."
    },
    높음: {
      rounds: 4,
      start: 16,
      gain: 34,
      loss: 6,
      pace: 76,
      threatDuration: 3000,
      speechDelay: 4800,
      label: "좋은 감정 에너지가 강해 식물이 빠르게 자랍니다."
    }
  };
  const recoveryProfiles = {
    낮음: {
      rounds: 4,
      start: 8,
      gain: 30,
      loss: 8,
      pace: 90,
      threatDuration: 3600,
      speechDelay: 5600,
      label: "감정이 작을 때 부드럽게 돌보면 빠르게 회복됩니다."
    },
    보통: {
      rounds: 5,
      start: 0,
      gain: 26,
      loss: 12,
      pace: 75,
      threatDuration: 2800,
      speechDelay: 4800,
      label: "오늘의 감정 강도에 맞춰 차분한 회복 돌봄을 시작합니다."
    },
    높음: {
      rounds: 6,
      start: 0,
      gain: 22,
      loss: 16,
      pace: 60,
      threatDuration: 2000,
      speechDelay: 3600,
      label: "감정 강도가 높아 더 빠르고 집중적인 돌봄이 필요합니다."
    }
  };

  const profiles = isPositive ? positiveProfiles : recoveryProfiles;
  const profile = profiles[level] || profiles.보통;
  return {
    ...profile,
    taskCount: 3
  };
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
  if (stage === "stage-bud") return "봉오리";
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
  gameField.classList.remove("sigh-mode");
}

function setProgress(text) {
  miniAction.innerHTML = `<p class="action-progress">${text}</p>`;
}

function markFeedback(success) {
  actionLayer.classList.remove("success-pulse", "fail-shake");
  gamePlant.classList.remove("plant-grow-pop", "plant-wilt-pop");

  window.requestAnimationFrame(function () {
    actionLayer.classList.add(success ? "success-pulse" : "fail-shake");
    gamePlant.classList.add(success ? "plant-grow-pop" : "plant-wilt-pop");
  });
}

function finishGame(message, guide) {
  isPlaying = false;
  clearActionTimers();
  startBtn.disabled = false;
  startBtn.textContent = "한 번 더 돌보기";
  gameMessage.textContent = message;
  gameGuide.textContent = guide;
  updateDisplay();
}

function completeCare(success, successText, failText) {
  if (!isPlaying || chances <= 0) return;

  clearActionTimers();
  const profile = activeProfile || getCareProfile();
  const delta = success ? profile.gain : -profile.loss;
  const beforeGrowth = growth;
  growth = Math.max(0, Math.min(100, growth + delta));
  chances -= 1;
  markFeedback(success);

  gameMessage.textContent = success ? "돌봄 성공" : "다시 돌보기";
  gameGuide.textContent = success ? successText : failText;
  updateDisplay();

  const deltaText = success ? `+${growth - beforeGrowth}% 성장` : `${growth - beforeGrowth}% 감소`;
  setProgress(`${success ? "성공!" : "아쉬워요."} 성장률 ${beforeGrowth}% → ${growth}% (${deltaText})`);

  if (growth >= 100) {
    finishGame(
      "감정 식물이 만개했어요",
      `${currentPlant.owner || "가드너"}님의 ${currentPlant.mood} 감정에서 ${currentPlant.plant}가 활짝 피었습니다. 오늘의 마음을 충분히 돌봤어요.`
    );
    setProgress("만개 완료. 다음에는 새 감정을 심어 다른 식물도 돌볼 수 있어요.");
    return;
  }

  if (chances <= 0) {
    finishGame(
      "오늘의 돌봄 종료",
      `최종 성장률은 ${growth}%입니다. 감정은 한 번에 해결되지 않아도 괜찮아요. 잠시 쉬고 다시 돌봐 주세요.`
    );
    setProgress("남은 돌봄 횟수를 모두 사용했습니다. 다시 하기로 처음부터 시작할 수 있어요.");
    return;
  }

  addTimer(window.setTimeout(renderMiniAction, 900), "timeout");
}

function renderSunGame() {
  clearActionLayer();
  const count = activeProfile.taskCount;
  const clouds = Array.from({ length: count }, function (_, index) {
    return `<button class="sky-cloud cloud-${index + 1}" type="button" aria-label="구름 치우기">구름</button>`;
  }).join("");

  actionLayer.classList.add("sun-action");
  actionLayer.innerHTML = `
    <div class="field-sun">햇빛</div>
    ${clouds}
  `;
  setProgress(`햇빛을 가린 구름 ${count}개를 모두 치워 주세요.`);

  actionLayer.querySelectorAll(".sky-cloud").forEach(function (cloud) {
    cloud.addEventListener("click", function () {
      cloud.classList.add("cleared");
      cloud.disabled = true;
      const left = actionLayer.querySelectorAll(".sky-cloud:not(.cleared)").length;
      setProgress(`남은 구름 ${left}개`);

      if (left === 0) {
        completeCare(
          true,
          "햇빛이 식물에게 닿았어요. 좋은 감정을 더 선명하게 기억할 수 있습니다.",
          "아직 햇빛이 충분하지 않아요."
        );
      }
    });
  });
}

function renderNoteGame() {
  clearActionLayer();
  let caught = 0;
  const target = activeProfile.taskCount;
  actionLayer.classList.add("note-action");
  setProgress(`떠오르는 음표 ${target}개를 놓치지 말고 잡아 주세요.`);

  function spawnNote() {
    if (!isPlaying || caught >= target) return;

    const note = document.createElement("button");
    note.type = "button";
    note.className = "seed-note";
    note.textContent = "♪";
    note.style.left = `${42 + Math.random() * 28}%`;
    note.style.bottom = `${22 + Math.random() * 20}%`;
    actionLayer.appendChild(note);

    const missTimer = window.setTimeout(function () {
      if (note.isConnected) {
        note.remove();
        completeCare(
          false,
          "음표를 잡았어요.",
          "리듬이 흩어졌어요. 평온함은 천천히 다시 맞추면 됩니다."
        );
      }
    }, activeProfile.pace * 18);
    addTimer(missTimer, "timeout");

    note.addEventListener("click", function () {
      if (!note.isConnected) return;

      note.remove();
      caught += 1;
      setProgress(`잡은 음표 ${caught}/${target}`);

      if (caught >= target) {
        completeCare(
          true,
          "부드러운 음표가 마음을 차분하게 감싸 주었어요.",
          "아직 리듬이 조금 더 필요해요."
        );
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
  const labels = ["과제", "알림", "밤샘", "걱정"];
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
  setProgress(`방해 요소 ${target}개가 식물에 닿기 전에 막아 주세요.`);

  labels.slice(0, target).forEach(function (label, index) {
    const threat = document.createElement("button");
    threat.type = "button";
    threat.className = "threat";
    threat.textContent = label;

    const start = starts[index % starts.length];
    const duration = activeProfile.threatDuration + index * 140;
    threat.style.left = `${start.x}px`;
    threat.style.top = `${start.y}px`;
    threat.style.setProperty("--tx", `${targetX - start.x}px`);
    threat.style.setProperty("--ty", `${targetY - start.y}px`);
    threat.style.animationDuration = `${duration}ms`;
    actionLayer.appendChild(threat);

    const hitTimer = window.setTimeout(function () {
      if (threat.isConnected && !threat.classList.contains("blocked") && !failed) {
        failed = true;
        completeCare(
          false,
          "방해 요소를 막아 보세요.",
          "방해 요소가 식물 가까이 닿았어요. 피곤한 마음에는 작은 휴식 공간이 필요합니다."
        );
      }
    }, duration);
    addTimer(hitTimer, "timeout");

    threat.addEventListener("click", function () {
      if (!threat.isConnected || failed) return;

      threat.classList.add("blocked");
      threat.disabled = true;
      blocked += 1;
      setProgress(`막은 방해 요소 ${blocked}/${target}`);

      if (blocked >= target) {
        completeCare(
          true,
          "방해 요소를 막아 식물이 쉴 공간을 지켜 주었어요.",
          "아직 휴식 공간이 부족해요."
        );
      }
    });
  });
}

function renderSpeechGame() {
  clearActionLayer();
  let picked = 0;
  const target = activeProfile.taskCount;
  const warmWords = ["괜찮아", "천천히 해도 돼", "곁에 있어", "버텨줘서 고마워", "울어도 돼"];
  const coldWords = ["별일 아니야", "빨리 잊어", "참아", "그만해", "왜 그래"];

  actionLayer.classList.add("speech-action");
  setProgress(`세 말풍선 중 식물에게 힘이 되는 말 ${target}개를 골라 주세요.`);

  function shuffle(list) {
    return list
      .map(function (item) {
        return { item, order: Math.random() };
      })
      .sort(function (a, b) {
        return a.order - b.order;
      })
      .map(function (entry) {
        return entry.item;
      });
  }

  function showChoices() {
    if (!isPlaying || picked >= target) return;
    clearActionTimers();

    const warmWord = warmWords[picked % warmWords.length];
    const coldChoices = shuffle(coldWords)
      .slice(0, 2)
      .map(function (text) {
        return { text, warm: false };
      });
    const choices = shuffle([{ text: warmWord, warm: true }].concat(coldChoices));

    actionLayer.innerHTML = `
      <div class="speech-options">
        ${choices.map(function (choice) {
          return `<button class="speech-bubble" type="button" data-warm="${choice.warm}">${choice.text}</button>`;
        }).join("")}
      </div>
    `;

    actionLayer.querySelectorAll(".speech-bubble").forEach(function (bubble) {
      bubble.addEventListener("click", function () {
        const ok = bubble.dataset.warm === "true";

        if (!ok) {
          completeCare(
            false,
            "다정한 말을 골라야 해요.",
            "그 말은 지금의 슬픔을 충분히 안아 주지 못했어요."
          );
          return;
        }

        picked += 1;
        setProgress(`고른 따뜻한 말 ${picked}/${target}`);

        if (picked >= target) {
          completeCare(
            true,
            "다정한 말이 식물에게 닿아 마음을 부드럽게 데워 줬어요.",
            "아직 따뜻한 말이 더 필요해요."
          );
        } else {
          showChoices();
        }
      });
    });

    addTimer(window.setTimeout(function () {
      completeCare(
        false,
        "다정한 말을 골라야 해요.",
        "따뜻한 말을 고르기 전에 말풍선이 사라졌어요."
      );
    }, activeProfile.speechDelay), "timeout");
  }

  showChoices();
}

function renderSighGame() {
  clearActionLayer();
  let exhale = 0;
  let holding = false;

  gameField.classList.add("sigh-mode");
  actionLayer.classList.add("sigh-action");
  actionLayer.innerHTML = `
    <div class="sigh-cloud"></div>
    <div class="sigh-meter">
      <span class="calm-zone">안정</span>
      <i id="sighFill"></i>
    </div>
    <button class="sigh-button" type="button">길게 숨 내쉬기</button>
  `;
  setProgress("버튼을 누르고 있다가 게이지가 안정 구간에 들어오면 손을 떼세요.");

  const button = actionLayer.querySelector(".sigh-button");
  const fill = actionLayer.querySelector("#sighFill");
  const cloud = actionLayer.querySelector(".sigh-cloud");

  function startHold(event) {
    event.preventDefault();
    holding = true;
  }

  function endHold() {
    if (!holding || !isPlaying) return;

    holding = false;
    const ok = exhale >= 58 && exhale <= 78;
    completeCare(
      ok,
      "긴 숨을 내쉬며 날카로운 마음이 조금 가라앉았어요.",
      "숨이 너무 짧거나 길었어요. 안정 구간을 보고 다시 시도해 보세요."
    );
  }

  button.addEventListener("pointerdown", startHold);
  button.addEventListener("pointerup", endHold);
  button.addEventListener("pointerleave", endHold);
  button.addEventListener("pointercancel", endHold);

  const meterTimer = window.setInterval(function () {
    if (!isPlaying) return;

    if (holding) {
      exhale = Math.min(100, exhale + (100 - activeProfile.pace) / 12 + 2.8);
    } else {
      exhale = Math.max(0, exhale - 2);
    }

    fill.style.width = `${exhale}%`;
    cloud.style.opacity = `${Math.min(0.8, exhale / 100)}`;

    if (exhale >= 100) {
      completeCare(
        false,
        "숨을 골라야 해요.",
        "숨을 너무 오래 참았어요. 화난 마음은 조금씩 빼내야 가라앉습니다."
      );
    }
  }, 60);
  addTimer(meterTimer, "interval");
}

function renderMiniAction() {
  clearActionLayer();
  if (!isPlaying) return;

  const action = actionData[currentPlant.mood] || actionData[defaultPlant.mood];
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
  startBtn.textContent = "돌보는 중";
  resetBtn.textContent = "처음으로";
  gameMessage.textContent = "식물 주변에서 직접 돌봄을 시작하세요.";
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
  startBtn.textContent = "게임 시작";
  resetBtn.textContent = "다시 하기";
  clearActionLayer();
  carePrompt.textContent = "오늘의 감정 식물이 돌봄을 기다리고 있어요.";
  careHint.textContent = `${currentPlant.mood} 감정 · ${currentPlant.level || "보통"} 강도에 맞는 돌봄이 식물 주변에서 시작됩니다.`;
  setProgress(`${activeProfile.label} 성공하면 성장률이 바로 오르고, 실패하면 조금 줄어듭니다.`);
  gameMessage.textContent = "감정 강도까지 반영해 식물이 자랍니다.";
  gameGuide.textContent = "행복과 평온은 좋은 감정을 오래 머물게 하고, 피곤·슬픔·화남은 마음을 회복시키는 액션으로 연결됩니다.";
  updateDisplay();
}

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

resetGame();
