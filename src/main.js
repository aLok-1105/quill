import { marked } from "marked";
import "./style.css";

const SAMPLE = `# Welcome to Quill

A quiet place to **write** and *read* markdown.

## Features

- Live preview as you type
- Open local \`.md\` files
- Split, edit, or read-only views
- Drag and drop support

## Example

\`\`\`js
const greeting = "Hello, markdown";
console.log(greeting);
\`\`\`

> Tip: switch to **Read** when you want a clean reading surface.

| Shortcut | Action |
| --- | --- |
| Open | Load a markdown file |
| Sample | Restore this starter note |

Happy writing.
`;

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const workspace = document.querySelector(".workspace");
const fileInput = document.getElementById("file-input");
const sampleBtn = document.getElementById("sample-btn");
const dropOverlay = document.getElementById("drop-overlay");
const viewButtons = document.querySelectorAll("[data-view]");

marked.setOptions({
  gfm: true,
  breaks: false,
});

function render() {
  preview.classList.remove("is-updating");
  // Retrigger soft fade on content updates
  void preview.offsetWidth;
  preview.classList.add("is-updating");
  preview.innerHTML = marked.parse(editor.value);
}

function setView(view) {
  workspace.dataset.view = view;
  viewButtons.forEach((btn) => {
    const active = btn.dataset.view === view;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

function loadText(text) {
  editor.value = text;
  render();
}

async function readFile(file) {
  if (!file) return;
  const text = await file.text();
  loadText(text);
}

editor.addEventListener("input", render);

viewButtons.forEach((btn) => {
  btn.addEventListener("click", () => setView(btn.dataset.view));
});

fileInput.addEventListener("change", () => {
  const [file] = fileInput.files ?? [];
  readFile(file);
  fileInput.value = "";
});

sampleBtn.addEventListener("click", () => loadText(SAMPLE));

let dragDepth = 0;

function isFileDrag(event) {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

window.addEventListener("dragenter", (event) => {
  if (!isFileDrag(event)) return;
  event.preventDefault();
  dragDepth += 1;
  dropOverlay.hidden = false;
});

window.addEventListener("dragleave", (event) => {
  if (!isFileDrag(event)) return;
  event.preventDefault();
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) dropOverlay.hidden = true;
});

window.addEventListener("dragover", (event) => {
  if (!isFileDrag(event)) return;
  event.preventDefault();
});

window.addEventListener("drop", (event) => {
  if (!isFileDrag(event)) return;
  event.preventDefault();
  dragDepth = 0;
  dropOverlay.hidden = true;
  const [file] = event.dataTransfer.files ?? [];
  readFile(file);
});

loadText(SAMPLE);
