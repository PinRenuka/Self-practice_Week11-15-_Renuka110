export function showErrorDialog(
  message = "",
  { okButton = false, onOk = null, allowEsc = false } = {},
  res = null) 
  {
  console.log("showErrorDialog");
  // ลบ dialog เดิมออกก่อนเสมอ (กัน dialog ค้างจากรอบก่อน)
  document.querySelectorAll(".ecors-dialog").forEach((d) => d.remove());
  // เลือกข้อความตาม response
  if (!message && res) {
    switch (res.status) {
      case 201:
        message = "Declaration successful";
        break;
      case 404:
        message = "404 - not found";
        break;
      case 409:
        message = "You may have declared study plan already. Please check again.";
        break;
      default:
        message = "There is a problem. Please try again later.";
    }
  } else if (!message) {
    message = "There is a problem. Please try again later.";
  }

  const dialog = document.createElement("dialog");
  dialog.className = "ecors-dialog";

  const msg = document.createElement("p");
  msg.className = "ecors-dialog-message";
  msg.textContent = message;
  dialog.appendChild(msg);

  // ปุ่ม OK
  if (okButton) {
    const okBtn = document.createElement("button");
    okBtn.className = "ecors-button-dialog";
    okBtn.textContent = "OK";

    okBtn.addEventListener("click", () => {
      // ปิดอย่างเดียว ไม่ remove ออกจาก DOM
      dialog.close();
      if (typeof onOk === "function") onOk();
    });

    dialog.appendChild(okBtn);
  }
  // ถ้า allowEsc=false  กันไม่ให้ปิดด้วย ESC
  if (!allowEsc) {
    dialog.addEventListener("cancel", (e) => e.preventDefault());
  }

  document.body.appendChild(dialog);
  dialog.showModal();
}

export function showConfirmCancelDialog(message, onConfirm) {
  // ลบ dialog เดิม
  document.querySelectorAll(".ecors-dialog").forEach((d) => d.remove());

  const dialog = document.createElement("dialog");
  dialog.className = "ecors-dialog";

  const msg = document.createElement("p");
  msg.className = "ecors-dialog-message";
  msg.textContent = message;
  dialog.appendChild(msg);

  // ปุ่ม Cancel Declaration
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "ecors-button-cancel";
  cancelBtn.textContent = "Cancel Declaration";

  cancelBtn.addEventListener("click", () => {
    if (typeof onConfirm === "function") onConfirm();
  });
  // ปุ่ม Keep Declaration
  const keepBtn = document.createElement("button");
  keepBtn.className = "ecors-button-keep";
  keepBtn.textContent = "Keep Declaration";

  keepBtn.addEventListener("click", () => {
    dialog.close();
  });

  dialog.appendChild(cancelBtn);
  dialog.appendChild(keepBtn);

  // ปิดด้วย ESC ไม่ได้ (สำหรับ confirm dialog)
  dialog.addEventListener("cancel", (e) => e.preventDefault());

  document.body.appendChild(dialog);
  dialog.show();
}