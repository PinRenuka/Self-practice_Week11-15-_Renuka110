//ui handles

import {
  loadQuotes,
  deleteQuote,
  addQuote,
  editQuote,
} from "./quoteManagement.js"

document.addEventListener("DOMContentLoaded", async () => {
  const quoteList = document.getElementById("quoteList")
  try {
    const quotes = await loadQuotes()
    console.log(quotes) //array

    quotes.forEach((quote) => {
      const divQuoteEle = newQuoteElement(quote)
      quoteList.appendChild(divQuoteEle)
    })
  } catch (e) {
    alert(e.message)
  }
})

/*
<div class="quote-card" data-id="1">
   <p>No one is perfect</p>
   <p class="author">someone</p>
   <div class="actions">
        <button class="edit" data-id="1">Edit</button>
        <button class="delete" data-id="1">delete</button>
   </div>
</div>

*/
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

  editButton.addEventListener("click", handleEdit)
  divButtons.appendChild(editButton)

  //   <button class="delete" data-id="1">delete</button>
  const deleteButton = document.createElement("button")
  deleteButton.className = "delete"
  deleteButton.dataset.id = quote.id
  deleteButton.textContent = "Delete"

  deleteButton.addEventListener("click", handleDelete)

  divButtons.appendChild(deleteButton)
  divEle.appendChild(divButtons)

  return divEle
}
//EDIT
function handleEdit(e) {
  const id = e.target.dataset.id
  const ans = confirm(`Do you confirm to edit quote id: ${id}`)
  if (ans) {
    //find quote that match editing quote id
    const quoteEle = document.querySelector(`div[data-id="${id}"]`)
    const currentContent = quoteEle.children[0].textContent
    const currentAuthor = quoteEle.children[1].textContent
    //get author and content to form
    const formEle = document.getElementById("quoteForm")
    formEle.content.value = currentContent
    formEle.author.value = currentAuthor
    formEle.quoteId.value = id
  }
}

//ADD
const formEle = document.getElementById("quoteForm")
formEle.addEventListener("submit", handleAddEdit)

async function handleAddEdit(e) {
  e.preventDefault()
  // console.log(formEle.quoteId.value) //formElement.tagIdentity.value
  // console.log(formEle.content.value)
  // console.log(formEle.author.value)
  const quoteId = formEle.quoteId.value
  const content = formEle.content.value.trim()
  const author = formEle.author.value.trim()

  if (quoteId) {
    //edit
    try {
      const updatedQuote = await editQuote({ id: quoteId, content, author })
      console.log(updatedQuote)

      const updateQuoteEle = document.querySelector(`div[data-id="${quoteId}"]`)
      updateQuoteEle.children[0].textContent = content
      updateQuoteEle.children[1].textContent = author
    } catch (e) {
      alert(e)
    }
  } else {
    //add
    try {
      const newQuote = await addQuote({ content, author }) //{{content:content, author:author}}
      const newQuoteDivEle = newQuoteElement(newQuote)
      const divQuoteListEle = document.getElementById("quoteList")
      divQuoteListEle.appendChild(newQuoteDivEle)
    } catch (e) {
      alert(e)
    }
  }
  formEle.content.value = ""
  formEle.author.value = ""
  formEle.quoteId.value = ""
}

//DELETE
async function handleDelete(e) {
  // console.log(e.target)
  const ans = confirm("Do you want to delete?")
  if (ans) {
    // console.log(e.target.dataset.id)
    const id = e.target.dataset.id
    try {
      const deleteQuoteId = await deleteQuote(id)
      if (deleteQuoteId) {
        const divDeleteQuote = document.querySelector(`div[data-id="${id}"`)
        console.log(divDeleteQuote)
        const divQuoteList = document.getElementById("quoteList")
        console.log(divQuoteList)
        divQuoteList.removeChild(divDeleteQuote)
      }
    } catch (e) {
      // alert(e.message)
      console.log(e.message)
    }
  }
}
 