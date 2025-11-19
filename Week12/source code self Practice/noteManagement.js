import { getItems, addItem, editItem, deleteItem } from "./fetchUtils.js";

const noteURL = "http://localhost:3000/notes";

export async function loadNotes() {
  return await getItems(noteURL);
}

export async function addNote(note) {
  return await addItem(noteURL, note);
}

export async function editNote(note) {
  return await editItem(noteURL, note);
}

export async function deleteNote(id) {
  return await deleteItem(noteURL, id);
}
