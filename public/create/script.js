import { CampusaurusAPI } from "/api.js";

const categorySelect = document.getElementById("category");
const specificZoneContainer = document.getElementById(
  "specific-zone-container",
);
const specificZoneLabel = document.getElementById("specificZoneLabel");
const islandSelect = document.getElementById("islandSelect");
const nestPickerContainer = document.getElementById("nest-picker-container");
const nestIslandSelect = document.getElementById("nestIsland");
const nestSelect = document.getElementById("nestSelect");
const nestSearchInput = document.getElementById("nestSearch");

const urlParams = new URLSearchParams(window.location.search);
const urlNestId = urlParams.get("nest");

let nestsByIsland = new Map();
let nestById = new Map();

function resetSelect(selectEl, placeholder, disabled = false) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  const option = document.createElement("option");
  option.value = "";
  option.textContent = placeholder;
  selectEl.appendChild(option);
  selectEl.disabled = disabled;
}

async function loadNests() {
  try {
    const response = await fetch("/api/nests");
    if (!response.ok) return;
    const data = await response.json();
    if (!data.nests) return;

    nestsByIsland = new Map();
    nestById = new Map();

    data.nests.forEach((nest) => {
      if (!nestsByIsland.has(nest.islandId)) {
        nestsByIsland.set(nest.islandId, []);
      }
      nestsByIsland.get(nest.islandId).push(nest);
      nestById.set(nest.id, nest);
    });

    nestsByIsland.forEach((list) =>
      list.sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    );
  } catch (error) {
    console.error("Failed to load nests", error);
  }
}

function filterNests(list, query) {
  if (!query) return list;
  const needle = query.toLowerCase();
  return list.filter((nest) =>
    (nest.name || "").toLowerCase().includes(needle),
  );
}

function populateNestsForIsland(islandId, query = "") {
  if (!nestSelect) return;

  if (!islandId) {
    resetSelect(nestSelect, "Select an island first", true);
    if (nestSearchInput) {
      nestSearchInput.value = "";
      nestSearchInput.disabled = true;
    }
    return;
  }

  if (nestSearchInput) {
    nestSearchInput.disabled = false;
  }

  const nests = nestsByIsland.get(islandId) || [];
  const filtered = filterNests(nests, query);
  resetSelect(
    nestSelect,
    filtered.length ? "Select a nest" : "No nests found",
    filtered.length === 0,
  );

  filtered.forEach((nest) => {
    const option = document.createElement("option");
    option.value = nest.id;
    option.textContent = nest.name;
    nestSelect.appendChild(option);
  });
}

function setCategoryUI(value) {
  if (value === "island") {
    specificZoneContainer.style.display = "block";
    specificZoneLabel.innerText = "CHOOSE ISLAND";
    nestPickerContainer.style.display = "none";
  } else if (value === "nest") {
    specificZoneContainer.style.display = "none";
    nestPickerContainer.style.display = "block";
  } else {
    specificZoneContainer.style.display = "none";
    nestPickerContainer.style.display = "none";
  }
}

async function preselectNestFromUrl() {
  if (!urlNestId || !nestIslandSelect || !nestSelect) return;
  if (nestById.size === 0) {
    await loadNests();
  }

  const nest = nestById.get(urlNestId);
  if (!nest) return;

  nestIslandSelect.value = nest.islandId;
  populateNestsForIsland(nest.islandId);
  nestSelect.value = nest.id;
}

if (categorySelect) {
  categorySelect.addEventListener("change", (e) => {
    setCategoryUI(e.target.value);
  });

  if (urlNestId) {
    categorySelect.value = "nest";
    setCategoryUI("nest");
  }
}

if (nestIslandSelect) {
  nestIslandSelect.addEventListener("change", async (e) => {
    if (nestsByIsland.size === 0) {
      await loadNests();
    }
    populateNestsForIsland(e.target.value, nestSearchInput?.value || "");
  });
}

if (nestSearchInput) {
  nestSearchInput.disabled = true;
  nestSearchInput.addEventListener("input", () => {
    populateNestsForIsland(nestIslandSelect.value, nestSearchInput.value);
  });
}

const createForm = document.getElementById("create-post-form");
if (createForm) {
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submit-btn");
    const resetSubmit = () => {
      submitBtn.innerText = "PUBLISH RECORD";
      submitBtn.disabled = false;
    };

    submitBtn.innerText = "EXCAVATING...";
    submitBtn.disabled = true;

    let categoryId = document.getElementById("category").value;
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    let targetNestId = null;

    if (categoryId === "nest") {
      let selectedNestId = nestSelect?.value;
      if (!selectedNestId && urlNestId) {
        selectedNestId = urlNestId;
      }

      if (!selectedNestId) {
        alert("Please choose a nest.");
        resetSubmit();
        return;
      }
      categoryId = selectedNestId;
      targetNestId = selectedNestId;
    } else if (categoryId === "island") {
      const islandId = islandSelect?.value;
      if (!islandId) {
        alert("Please choose an island.");
        resetSubmit();
        return;
      }
      categoryId = `island:${islandId}`;
    }

    try {
      if (categoryId === "announcement") {
        await CampusaurusAPI.announcements.create({
          title: title,
          body: content,
        });
        alert("Amber Alert Broadcasted Successfully!");
        window.location.href = "../announcements/";
      } else {
        await CampusaurusAPI.posts.create({
          title: title,
          content: content,
          categoryId: categoryId,
        });
        alert("Discovery logged successfully!");
        if (targetNestId) {
          window.location.href = `/index/index.html?nest=${encodeURIComponent(targetNestId)}`;
        } else {
          window.location.href = "../index/";
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to log discovery. System error: " + error.message);
    } finally {
      resetSubmit();
    }
  });
}

(async () => {
  if (urlNestId) {
    await loadNests();
    await preselectNestFromUrl();
  }
})();
