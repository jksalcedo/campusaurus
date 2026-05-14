import { CampusaurusAPI } from "/api.js";

// Show/Hide the specific zone input based on dropdown selection
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


const urlParams = new URLSearchParams(window.location.search);
const urlNestId = urlParams.get("nest");

function updateSpecificZoneVisibility(val) {
  if (val === "island") {
    specificZoneContainer.style.display = "block";
    specificZoneLabel.innerText = "WHICH ISLAND?";
  } else if (val === "nest") {
    if (urlNestId) {
      specificZoneContainer.style.display = "none";
    } else {
      specificZoneContainer.style.display = "block";
      specificZoneLabel.innerText = "WHICH NEST?";
    }
  } else {
    specificZoneContainer.style.display = "none";
  }
}

if (categorySelect) {
  if (urlNestId) {
    categorySelect.value = "nest";
    updateSpecificZoneVisibility("nest");
  }

  categorySelect.addEventListener("change", (e) => {
    const val = e.target.value;
    updateSpecificZoneVisibility(val);
  });
}

async function resolveNestIdByName(nestName) {
  const raw = (nestName || "").trim();
  if (!raw) return null;

  const normalized = raw.toLowerCase();
  const normalizedWithPrefix = normalized.startsWith("n/")
    ? normalized
    : `n/${normalized}`;

  const response = await fetch("/api/nests");
  const data = await response.json();

  if (!data.nests || data.nests.length === 0) return null;

  const match = data.nests.find((nest) => {
    const name = (nest.name || "").toLowerCase();
    return name === normalized || name === normalizedWithPrefix;
  });

  return match ? match.id : null;
}

// Handle Form Submission
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
    const specificZone = document.getElementById("specificZone").value;
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
        if ((categoryId === 'island' || categoryId === 'nest') && specificZone) {
            // Simplify to just the ID so it matches the navigation URLs
            categoryId = specificZone;
        }

    if (categoryId === "nest") {
      if (urlNestId) {
        categoryId = urlNestId;
      } else if (specificZone) {
        const resolvedId = await resolveNestIdByName(specificZone);
        if (!resolvedId) {
          alert("Nest not found. Create the nest first from the Islands page.");
          resetSubmit();
          return;
        }
        categoryId = resolvedId;
      } else {
        alert("Please specify a nest.");
        resetSubmit();
        return;
      }
    } else if (categoryId === "island" && specificZone) {
      categoryId = `island:${specificZone}`;
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
        window.location.href = "../index/";
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
