const mainPlant = document.querySelector("#mainPlant");
const gardenPlants = document.querySelectorAll(".garden-scene .plant");
const gardenScene = document.querySelector(".garden-scene");
// sections except heroSection
const points = document.querySelectorAll(".snap-point");

let currentIndex = -1;
let isScrolling = false;

window.addEventListener("wheel", (e) => {
  if (isScrolling) return;

  isScrolling = true;

  if (e.deltaY > 0) 
  {
    currentIndex = Math.min(currentIndex + 1,points.length - 1);
  } 
  else
  {
    currentIndex = Math.max(currentIndex - 1,-1);
  }

  if (currentIndex === -1) 
  {
    window.scrollTo({top: 0, behavior: "smooth"});
  } 
  else 
  {
    points[currentIndex].scrollIntoView({behavior: "smooth", block: "start"});
  }

  setTimeout(() => { isScrolling = false;}, 200);
});

//TODO CHECK :: can i delete this??
const plantClasses = [
  "plant-sunflower",
  "plant-lavender",
  "plant-moss",
  "plant-hydrangea",
  "plant-cactus"
];

function loadMainPlant() {
  const saved = localStorage.getItem("moodGardenPlant");

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

//TODO CHECK :: can i delete this??

