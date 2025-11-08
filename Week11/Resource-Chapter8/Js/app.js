//ui handles

import { loadQuotes } from "./quoteManagement.js"

document.addEventListener("DOMContentLoaded", async () => {
  const quoteList = document.getElementById("quoteList")
  const quotes = await loadQuotes()
  console.log(quotes) //array

  quotes.forEach((quote) => {
    const divQuoteEle = newQuoteElement(quote)
    quoteList.appendChild(divQuoteEle)
  })
})
function newQuoteElement(quote) {
  //<div class="quote-card" data-id="1">
  const divEle = document.createElement("div")
  divEle.className = "quote-card" //class=quote-card
  divEle.dataset.id = quote.id //data-id
  //<p>No one is perfect</p>
  const pQuoteEle = document.createElement("p")
  pQuoteEle.textContent = quote.content
  divEle.appendChild(pQuoteEle)
  //   <p class="author">someone</p>
  const pAuthorEle = document.createElement("p")
  pAuthorEle.className = "author"
  pAuthorEle.textContent = quote.author
  divEle.appendChild(pAuthorEle)
  //   <div class="actions">
  const divButtons = document.createElement("div")
  divButtons.className = "actions"
  //<button class="edit" data-id="1">Edit</button>
  const editButton = document.createElement("button")
  editButton.className = "edit"
  editButton.dataset.id = quote.id
  editButton.textContent = "Edit"
  divButtons.appendChild(editButton)

  //   <button class="delete" data-id="1">delete</button>
  const deleteButton = document.createElement("button")
  deleteButton.className = "delete"
  deleteButton.dataset.id = quote.id
  deleteButton.textContent = "Delete"
  divButtons.appendChild(deleteButton)

  divEle.appendChild(divButtons)

  return divEle
}

 