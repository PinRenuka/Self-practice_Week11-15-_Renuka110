//CRUD Quote
import { getItems } from "./myLib/fetchUtils.js"

async function loadQuotes() {
  try {
    const quotes = await getItems(`${import.meta.env.VITE_APP_URL}/quotes`)
    return quotes
  } catch (e) {
    alert(e)
  }
}
export { loadQuotes }

