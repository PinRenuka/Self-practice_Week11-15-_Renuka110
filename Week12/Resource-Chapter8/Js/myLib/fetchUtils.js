//fetch API
async function getItems(url) {
  let message = ""
  try {
    const res = await fetch(url)
    if (res.status !== 200) {
      switch (res.status) {
        case 401:
          message = "401 - UnAuthorized"
          break
        case 404:
          message = "404 - Item not found"
          break
        default:
          message = "There is a problem, Please try again"
      }
      throw new Error(message)
    }
    const items = await res.json() //json() - convert json to JavaScript Object
    return items
  } catch (e) {
    // console.log(e)
    throw new Error(message || e.message)
  }
}
async function deleteItem(url, id) {
  try {
    const res = await fetch(`${url}/${id}`, {
      method: "DELETE",
    })
    if (!res.ok)
      //res.ok  return boolean
      throw new Error(`Fail to delete item: ${res.status} - ${res.statusText}`)
    try {
      const deletedItem = await res.json()
      return deletedItem
    } catch (e) {
      return id
    }
  } catch (e) {
    throw new Error(e.message)
  }
}
async function addItem(url, item) {
  try {
    const res = await fetch(`${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    })
    if (res.status !== 201) {
      throw new Error(`Fail to add item: ${res.status} - ${res.statusText}`)
    }
    const addedItem = await res.json()
    return addedItem
  } catch (e) {
    throw new Error(e.message)
  }
}
async function editItem(url, item) {
  try {
    const res = await fetch(`${url}/${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    })
    if (res.status !== 200) {
      throw new Error(`Fail to edit item: ${res.status} - ${res.statusText}`)
    }
    const editedItem = await res.json()
    return editedItem
  } catch (e) {
    throw new Error(e.message)
  }
}
export { getItems, deleteItem, addItem, editItem }
 