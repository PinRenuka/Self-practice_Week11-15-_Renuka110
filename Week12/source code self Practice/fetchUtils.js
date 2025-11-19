async function getItems(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Cannot load items");
  return await res.json();
}

async function addItem(url, item) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (res.status !== 201) throw new Error("Failed to add item");
  return await res.json();
}

async function editItem(url, item) {
  const res = await fetch(`${url}/${item.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to edit item");
  return await res.json();
}

async function deleteItem(url, id) {
  const res = await fetch(`${url}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
  return id;
}

export { getItems, addItem, editItem, deleteItem };
