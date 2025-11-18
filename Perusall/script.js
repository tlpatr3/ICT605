// ================================
// VIEW SWITCHING (Dashboard ↔ Reading)
// ================================
const dashboardView = document.getElementById("dashboardView");
const readingView = document.getElementById("readingView");
const globalNav = document.getElementById("globalNav");
const openReadingBtn = document.getElementById("openReadingBtn");

openReadingBtn.addEventListener("click", () => {
  dashboardView.classList.remove("active");
  readingView.classList.add("active");
  globalNav.style.display = "none"; // hide homepage nav in reading mode
});

// ================================
// SLIDE-OUT MENU + HAMBURGER
// ================================
const readingShell = document.getElementById("readingShell");
const hamburgerBtn = document.getElementById("hamburgerBtn");
const readingBackdrop = document.getElementById("readingBackdrop");

function toggleMenu(open) {
  const shouldOpen =
    typeof open === "boolean" ? open : !readingShell.classList.contains("menu-open");
  if (shouldOpen) {
    readingShell.classList.add("menu-open");
  } else {
    readingShell.classList.remove("menu-open");
  }
}

hamburgerBtn.addEventListener("click", () => toggleMenu());
readingBackdrop.addEventListener("click", () => toggleMenu(false));

document.querySelectorAll(".slide-menu button[data-nav]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const dest = btn.getAttribute("data-nav");
    if (dest === "courses") {
      // Simulate going back to dashboard
      readingView.classList.remove("active");
      dashboardView.classList.add("active");
      globalNav.style.display = "flex";
    }
    toggleMenu(false);
  });
});

// ================================
// ZOOM CONTROLS
// ================================
const readingPane = document.getElementById("readingPane");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomLevelLabel = document.getElementById("zoomLevelLabel");

let zoomLevel = 100;

function applyZoom() {
  const scale = zoomLevel / 100;
  readingPane.style.transformOrigin = "top left";
  readingPane.style.transform = "scale(" + scale + ")";
  zoomLevelLabel.textContent = zoomLevel + "%";
  zoomOutBtn.disabled = zoomLevel <= 80;
  zoomInBtn.disabled = zoomLevel >= 140;
}

zoomOutBtn.addEventListener("click", () => {
  if (zoomLevel > 80) {
    zoomLevel -= 10;
    applyZoom();
  }
});

zoomInBtn.addEventListener("click", () => {
  if (zoomLevel < 140) {
    zoomLevel += 10;
    applyZoom();
  }
});

// ================================
// ANNOTATION SYSTEM
// ================================
const readingContent = document.getElementById("readingContent");
const addAnnotationBtn = document.getElementById("addAnnotationBtn");

const modal = document.getElementById("annotationModal");
const modalSnippet = document.getElementById("modalSnippet");
const modalTextarea = document.getElementById("modalTextarea");
const cancelAnnotationBtn = document.getElementById("cancelAnnotationBtn");
const saveAnnotationBtn = document.getElementById("saveAnnotationBtn");

const annotationsList = document.getElementById("annotationsList");
const annotationCount = document.getElementById("annotationCount");

const readingProfile = document.getElementById("readingProfile");
const homeProfile = document.getElementById("homeProfile");

let currentRange = null;
let currentSelectionText = "";
const annotations = [];

function clearSelectionState() {
  currentRange = null;
  currentSelectionText = "";
  addAnnotationBtn.disabled = true;
}

// Enable "Add annotation" only when there's selected text in the reading pane
document.addEventListener("selectionchange", () => {
  if (!readingView.classList.contains("active")) return;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    clearSelectionState();
    return;
  }

  const range = sel.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const selectedText = sel.toString().trim();

  const isInsideReading = readingContent.contains(container);

  if (!isInsideReading || selectedText.length === 0) {
    clearSelectionState();
    return;
  }

  currentRange = range;
  currentSelectionText = selectedText;
  addAnnotationBtn.disabled = false;
});

// Modal helpers
function openModal() {
  modalSnippet.textContent = currentSelectionText;
  modalTextarea.value = "";
  modal.classList.add("active");
  modalTextarea.focus();
}

function closeModal() {
  modal.classList.remove("active");
}

addAnnotationBtn.addEventListener("click", () => {
  if (!currentRange || !currentSelectionText) return;
  openModal();
});

cancelAnnotationBtn.addEventListener("click", () => {
  closeModal();
});

// Save annotation
saveAnnotationBtn.addEventListener("click", () => {
  const note = modalTextarea.value.trim();
  if (!note) {
    alert("Please enter a note for your annotation.");
    return;
  }

  // Wrap the selected text in a span.highlight
  const span = document.createElement("span");
  span.className = "highlight";
  span.setAttribute("data-annotation-id", String(annotations.length));

  try {
    currentRange.surroundContents(span);
  } catch (e) {
    console.warn("Could not highlight selection:", e);
    // If selection is messy (spans multiple elements), we still save the annotation
  }

  const timestamp = new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const annotation = {
    id: annotations.length,
    text: note,
    snippet: currentSelectionText,
    author: "You",
    time: timestamp,
    replies: [],
  };

  annotations.push(annotation);
  renderAnnotations();
  clearSelectionState();
  closeModal();

  // Show notification dots
  readingProfile.classList.add("has-notifications");
  homeProfile.classList.add("has-notifications");
});

// Render annotations in the sidebar
function renderAnnotations() {
  annotationsList.innerHTML = "";
  annotationCount.textContent = annotations.length;

  if (annotations.length === 0) {
    annotationsList.innerHTML =
      '<div class="annotation-empty">No annotations yet. Select text in the reading to add one.</div>';
    return;
  }

  annotations.forEach((ann) => {
    const card = document.createElement("div");
    card.className = "annotation-card";

    const meta = document.createElement("div");
    meta.className = "annotation-meta";
    meta.innerHTML =
      "<span>" + ann.author + "</span><span>" + ann.time + "</span>";

    const body = document.createElement("div");
    body.className = "annotation-body";
    body.textContent = ann.text;

    const snippet = document.createElement("div");
    snippet.className = "annotation-snippet";
    snippet.textContent = ann.snippet;

    const actions = document.createElement("div");
    actions.className = "annotation-actions";
    const replyBtn = document.createElement("button");
    replyBtn.className = "link-btn";
    replyBtn.textContent = "Reply";
    actions.appendChild(replyBtn);

    const replyBlock = document.createElement("div");
    replyBlock.className = "reply-block";
    replyBlock.style.display = "none";

    const replyTextarea = document.createElement("textarea");
    replyTextarea.className = "reply-textarea";
    replyTextarea.placeholder = "Write a reply…";

    const replyActions = document.createElement("div");
    replyActions.style.display = "flex";
    replyActions.style.justifyContent = "flex-end";
    replyActions.style.gap = "0.4rem";

    const replyCancel = document.createElement("button");
    replyCancel.className = "btn-ghost";
    replyCancel.style.fontSize = "0.78rem";
    replyCancel.textContent = "Cancel";

    const replySave = document.createElement("button");
    replySave.className = "btn-primary";
    replySave.style.fontSize = "0.78rem";
    replySave.textContent = "Post";

    replyActions.appendChild(replyCancel);
    replyActions.appendChild(replySave);

    const repliesList = document.createElement("div");
    repliesList.className = "reply-meta";
    if (ann.replies.length > 0) {
      repliesList.textContent = ann.replies
        .map((r) => r.author + " · " + r.text)
        .join("   ·   ");
    }

    replyBlock.appendChild(replyTextarea);
    replyBlock.appendChild(replyActions);

    // Reply interactions
    replyBtn.addEventListener("click", () => {
      replyBlock.style.display =
        replyBlock.style.display === "none" ? "flex" : "none";
      if (replyBlock.style.display === "flex") {
        replyTextarea.focus();
      }
    });

    replyCancel.addEventListener("click", () => {
      replyTextarea.value = "";
      replyBlock.style.display = "none";
    });

    replySave.addEventListener("click", () => {
      const replyText = replyTextarea.value.trim();
      if (!replyText) return;

      const reply = {
        author: "You",
        text: replyText,
      };
      ann.replies.push(reply);
      replyTextarea.value = "";
      replyBlock.style.display = "none";

      repliesList.textContent = ann.replies
        .map((r) => r.author + " · " + r.text)
        .join("   ·   ");

      readingProfile.classList.add("has-notifications");
      homeProfile.classList.add("has-notifications");
    });

    card.appendChild(meta);
    card.appendChild(body);
    card.appendChild(snippet);
    card.appendChild(actions);
    card.appendChild(replyBlock);
    if (ann.replies.length > 0) {
      card.appendChild(repliesList);
    }

    annotationsList.appendChild(card);
  });
}
