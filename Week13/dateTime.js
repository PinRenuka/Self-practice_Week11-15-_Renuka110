//Create Date Object
//1. no parameter, display current date and time
const today = new Date()
console.log(today) //2025-11-18T07:00:24.969Z  YYYY-MM-DDTHH:mm:ss:sssZ
console.log(today.getTime()) //getTime -return millisecond //1763449393588
 
//2. input parameter - millisecond
const now = Date.now() //return millisecond of current datetime
console.log(now) //1763449224979
const now2 = new Date(now)
console.log(now2) //2025-11-18T07:01:40.279Z
 
//3. input parameter - date string
const utcDate = new Date("2025-11-18T10:30:00z")
console.log(utcDate) //2025-11-18T10:30:00.000Z
const localDate = new Date("2025-11-18T10:30:00")
console.log(localDate) //2025-11-18T03:30:00.000Z
 
//4. input parameter - date/time parameter
const myDate1 = new Date(2025, 11, 10, 11, 15, 25) //year, monthIndex, day, hh, mm, ss
console.log(myDate1) //2025-12-10T04:15:25.000Z



//compare date time
const startBooking = new Date("2025-11-15T12:00:00")
const stopBooking = new Date("2025-11-16T12:00:00")
 
const bookingtime = new Date("2025-11-16T12:00:00")
if (bookingtime >= startBooking && bookingtime <= stopBooking)
  console.log("valid booking time")
else console.log("invalid booking time")
 
console.log(startBooking.getTime()) //get millisecond
console.log(stopBooking.getTime()) //get millisecond
 
console.log(startBooking === stopBooking) //false forever, compare reference
console.log(startBooking.getTime() === stopBooking.getTime()) //false forever, compare reference
 
//compare >, <, <=, >= date objects
console.log(startBooking > stopBooking) //false
console.log(startBooking < stopBooking) //true



//date time format
// const startBooking = new Date("2025-11-15T12:00:00")
// const stopBooking = new Date("2025-11-16T12:00:00")
 
console.log(stopBooking.toISOString()) //2025-11-16T05:00:00.000Z
console.log(stopBooking.toString()) //Sun Nov 16 2025 12:00:00 GMT+0700 (Indochina Time)
console.log(
  stopBooking.toLocaleString("th-TH", {
    dateStyle: "full",
    timeStyle: "full",
  })
) //11/16/2025, 12:00:00 PM
 
const formatter = Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeStyle: "long",
  timeZone: "Asia/Bangkok",
})
console.log(formatter.format(stopBooking))
//16 November 2025 at 12:00:00 GMT+7
 
//get user date time preference
const systemOptions = new Intl.DateTimeFormat().resolvedOptions()
console.log(systemOptions.timeZone) // e.g., " Asia/Bangkok"
console.log(systemOptions.locale) // e.g., "th-TH" or "en-GB"
 
 