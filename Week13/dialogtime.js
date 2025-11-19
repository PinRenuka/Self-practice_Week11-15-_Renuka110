async function displayDialog() {
  return new Promise((resolve) => {
    const dialogMessageEl = document.getElementById("messageDialog")
 
    const okBtnEl = document.getElementById("okBtn")
    const cancelBtnEl = document.getElementById("cancelBtn")
 
    okBtnEl.addEventListener("click", () => {
      dialogMessageEl.close()
      resolve(okBtnEl.textContent)
    })
 
    cancelBtnEl.addEventListener("click", () => {
      dialogMessageEl.close()
      resolve(cancelBtnEl.textContent)
    })
    dialogMessageEl.showModal()
  })
 
  //   dialogMessageEl.show()
}
 
const ans = await displayDialog()
console.log(ans)