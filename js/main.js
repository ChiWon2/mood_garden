const mainPlant = document.querySelector("#mainPlant");
const gardenPlants = document.querySelectorAll(".garden-scene .plant");
const gardenScene = document.querySelector(".garden-scene");
const points = document.querySelectorAll(".snap-point");

let currentIndex = -1;
let isScrolling = false;

if (points.length) {
  window.addEventListener("wheel", (event) => {
    if (isScrolling) return;

    isScrolling = true;

    if (event.deltaY > 0) {
      currentIndex = Math.min(currentIndex + 1, points.length - 1);
    } else {
      currentIndex = Math.max(currentIndex - 1, -1);
    }

    if (currentIndex === -1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      points[currentIndex].scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setTimeout(() => {
      isScrolling = false;
    }, 200);
  });
}

const mascot = document.querySelector(".mascot");
const pupils = document.querySelectorAll(".pupil");
const eyes = document.querySelectorAll(".eye");
let isJumping = false;

if (pupils.length) {
  document.addEventListener("mousemove", (event) => {
    pupils.forEach((pupil) => {
      const eye = pupil.parentElement;
      const rect = eye.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(
        event.clientY - centerY,
        event.clientX - centerX
      );
      const radius = 8;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      pupil.style.transform = `translate(${x}px, ${y}px)`;
    });
  });
}

function blink(closedEyeTime = 120) {
  eyes.forEach((eye) => {
    eye.classList.add("blink");
  });

  setTimeout(() => {
    eyes.forEach((eye) => {
      eye.classList.remove("blink");
    });
  }, closedEyeTime);
}

if (eyes.length) {
  setInterval(() => {
    if (Math.random() > 0.5) {
      blink();
    }
  }, 1000);
}

if (mascot) {
  mascot.addEventListener("click", () => {
    if (isJumping) return;

    isJumping = true;
    mascot.classList.remove("jump");

    void mascot.offsetWidth;

    mascot.classList.add("jump");

    setTimeout(() => {
      mascot.classList.remove("jump");
      isJumping = false;
    }, 700);
  });
}

const plantClasses = [
  "plant-sunflower",
  "plant-lavender",
  "plant-moss",
  "plant-hydrangea",
  "plant-cactus"
];

function loadMainPlant() {
  const saved = sessionStorage.getItem("moodGardenPlant");

  gardenPlants.forEach(function (gardenPlant) {
    gardenPlant.classList.remove(...plantClasses);
    gardenPlant.classList.add("plant-sunflower");
  });

  if (gardenScene) {
    gardenScene.setAttribute("aria-label", "MoodGarden Sunflower garden");
  }

  if (!saved || !mainPlant) {
    return;
  }

  try {
    const plant = JSON.parse(saved);

    if (!plant.gameClass || !plantClasses.includes(plant.gameClass)) {
      return;
    }

    gardenPlants.forEach(function (gardenPlant) {
      gardenPlant.classList.remove(...plantClasses);
      gardenPlant.classList.add(plant.gameClass);
    });

    if (gardenScene) {
      gardenScene.setAttribute("aria-label", `MoodGarden ${plant.plant} garden`);
    }
  } catch (error) {
    localStorage.removeItem("moodGardenPlant");
  }
}

loadMainPlant();

