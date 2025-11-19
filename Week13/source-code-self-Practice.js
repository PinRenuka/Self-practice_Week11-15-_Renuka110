// Date & Time
// เขียนฟังก์ชัน isBookingValid(bookingTime) เพื่อเช็คว่าเวลา bookingTime อยู่ในช่วงเวลาอนุญาตหรือไม่ โดย:
// ช่วงเวลาอนุญาต: เริ่ม 2025-12-01 08:00:00 ถึง 2025-12-01 18:00:00
// รับพารามิเตอร์เป็น Date object
// คืนค่า "Valid" ถ้าเวลาอยู่ในช่วง และ "Invalid" ถ้าไม่อยู่
// ตัวอย่างการใช้งาน:
// console.log(isBookingValid(new Date("2025-12-01T09:30:00"))) // "Valid"
// console.log(isBookingValid(new Date("2025-12-01T19:00:00"))) // "Invalid"
// โจทย์เสริม: แสดงเวลาเป็น ISO string และ Locale string (th-TH) ด้วย

function isBookingValid(bookingTime) {
    const startBooking = new Date("2025-12-01T08:00:00");
    const stopBooking = new Date("2025-12-01T18:00:00");

    // ตรวจสอบว่า bookingTime อยู่ระหว่าง startBooking และ stopBooking
    if (bookingTime >= startBooking && bookingTime <= stopBooking) {
        console.log("ISO:", bookingTime.toISOString());
        console.log(
            "Locale (th-TH):",
            bookingTime.toLocaleString("th-TH", {
                dateStyle: "full",
                timeStyle: "long",
            })
        );
        return "Valid";
    } else {
        return "Invalid";
    }
}

console.log(isBookingValid(new Date("2025-12-01T09:30:00")));
console.log(isBookingValid(new Date("2025-12-01T19:00:00")));