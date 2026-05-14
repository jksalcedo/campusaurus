import { CampusaurusAPI } from "/api.js";

// Show/Hide the specific zone input based on dropdown selection
const categorySelect = document.getElementById("category");
const specificZoneContainer = document.getElementById(
  "specific-zone-container",
);
const specificZoneLabel = document.getElementById("specificZoneLabel");

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
