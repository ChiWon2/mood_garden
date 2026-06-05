const mainPlant = document.querySelector("#mainPlant");
const gardenPlants = document.querySelectorAll(".garden-scene .plant");
const gardenScene = document.querySelector(".garden-scene");

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

