import { loadNotes, addNote, editNote, deleteNote } from "./noteManagement.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const list = document.getElementById("noteList");
  const notes = await loadNotes();

  notes.forEach(n => list.appendChild(newNoteElement(n)));
}

function newNoteElement(note) {
  const div = document.createElement("div");
  div.className = "note-card";
  div.dataset.id = note.id;

  const title = document.createElement("p");
  title.textContent = note.title;

  const detail = document.createElement("p");
  detail.textContent = note.detail;

  const actions = document.createElement("div");
  actions.className = "note-actions";

  const btnEdit = document.createElement("button");
  btnEdit.textContent = "Edit";
  btnEdit.className = "edit";
  btnEdit.addEventListener("click", handleEdit);

  const btnDelete = document.createElement("button");
  btnDelete.textContent = "Delete";
  btnDelete.className = "delete";
  btnDelete.addEventListener("click", handleDelete);

  actions.appendChild(btnEdit);
  actions.appendChild(btnDelete);

  div.appendChild(title);
  div.appendChild(detail);
  div.appendChild(actions);

  return div;
}

// === Form submit handler === //

const form = document.getElementById("noteForm");
form.addEventListener("submit", handleSubmit);

async function handleSubmit(e) {
  e.preventDefault();
  const id = form.noteId.value;
  const title = form.title.value.trim();
  const detail = form.detail.value.trim();

  if (id) {
    // EDIT
    const updated = await editNote({ id, title, detail });
    const card = document.querySelector(`div[data-id='${id}']`);
    card.children[0].textContent = title;
    card.children[1].textContent = detail;
  } else {
    // ADD
    const newNote = await addNote({ title, detail });
    document.getElementById("noteList").appendChild(newNoteElement(newNote));
  }

  form.reset();
}


function handleEdit(e) {
  const id = e.target.closest(".note-card").dataset.id;
  const card = document.querySelector(`div[data-id='${id}']`);

  form.noteId.value = id;
  form.title.value = card.children[0].textContent;
  form.detail.value = card.children[1].textContent;
}

async function handleDelete(e) {
  const id = e.target.closest(".note-card").dataset.id;

  if (!confirm("Delete this note?")) return;

  await deleteNote(id);

  const card = document.querySelector(`div[data-id='${id}']`);
  card.remove();
}
