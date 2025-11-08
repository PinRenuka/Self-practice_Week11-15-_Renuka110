// Synchronous programming //
console.log("starting...")
console.log("working#1...")
console.log("ending...")

// Asynchronous programming //
console.log("starting...")
setTimeout(() => console.log("working#2..."), 5000)

// SetTimeout asynchoronous function //
console.log("ending...")


//ตัวอย่างการไม่จัดการกับ promise ที่จะสร้างปัญหาให้กับโปรแกรม //
function doSomething(hasResource) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (hasResource ? resolve("done") : reject("fail")), 5000)
  })
}
console.log("starting...")
const workStatus = doSomething(false)
console.log(workStatus)
console.log("ending...")
// ค่าที่ได้ //
// starting...
// Promise { <pending> }
// ending...
// fail, throw exception


// Handle promise - 2 ways (1) .then().catch(), (2) async-await) //
// 1) .then().catch() //
console.log("starting...")
// กรณี true //
doSomething(true).then((result) => {
  console.log("working...")
  console.log(`work status= ${result}`)
  console.log("ending...")
}).catch((error) => {
  console.log(error)
})
// กรณี false //
doSomething(false).then((result) => {
  console.log("working...")
  console.log(`work status= ${result}`)
  console.log("ending...")
}).catch((error) => {
  console.log(error)
})

// 2) async-await //
async function working2() {
  console.log("starting...")
  try {
    const workStatus = await doSomething(true)
    console.log(workStatus)
    console.log("ending...")
  } catch (error) {
    console.log(error)
  }
}
working2()

async function working2() {
  console.log("starting...")
  try {
    const workStatus = await doSomething(false)
    console.log(workStatus)
    console.log("ending...")
  } catch (error) {
    console.log(error)
  }
}
working2()

