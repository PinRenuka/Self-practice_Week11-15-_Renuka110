import config from "../config/config.js";
import { showErrorDialog, showConfirmCancelDialog } from "./myLib/showErrorDialog.js";

// ==========================================================
// KEYCLOAK INIT
// ==========================================================
const keycloak = new Keycloak({
  url: "https://bscit.sit.kmutt.ac.th/intproj25/ft/keycloak/",
  realm: "itb-ecors",
  clientId: "itb-ecors-ssi4",
});

const kcInitOpts = {
  onLoad: "login-required",
  checkLoginIframe: false,
};

// ==========================================================
// UTILITIES
// ==========================================================
function getStudentIdFromToken() {
  const t = keycloak.idTokenParsed;
  return t.preferred_username;
}

// ==========================================================
// INJECT Heads-Up-Display + STATUS + DECLARE CARD
// ==========================================================
async function injectPartials() {
  const nav = document.querySelector(".navbar");
  if (!nav) return;

  // Heads-Up-Display (ชื่อ + Sign Out)
  if (!nav.querySelector(".ecors-right-hud")) {
    const hud = document.createElement("div");
    hud.className = "ecors-right-hud";

    const nameBadge = document.createElement("div");
    nameBadge.className = "ecors-fullname";
    nameBadge.textContent = "Welcome, ...";

    const signout = document.createElement("button");
    signout.className = "ecors-button-signout";
    signout.type = "button";
    signout.textContent = "Sign Out";

    hud.appendChild(nameBadge);
    hud.appendChild(signout);

    nav.style.position = "relative";
    nav.appendChild(hud);
    hud.style.marginTop = "17px";
  }

  const root = document.querySelector("section.content-box");
  if (!root) return;

  // Status row
  const statusRow = document.createElement("div");
  statusRow.className = "ecors-status-row";

  const statusLabel = document.createElement("span");
  statusLabel.className = "ecors-status-label";
  statusLabel.textContent = "Declaration Status:";

  const statusValue = document.createElement("span");
  statusValue.className = "ecors-declared-plan";
  statusValue.textContent = "Not Declared";

  statusRow.append(statusLabel, statusValue);

  // Card
  const card = document.createElement("div");
  card.className = "ecors-card";

  const cardTitle = document.createElement("h3");
  cardTitle.textContent = "Declare Your Major";

  const fieldLabel = document.createElement("label");
  fieldLabel.setAttribute("for", "ecors-dropdown-plan");

  const select = document.createElement("select");
  select.className = "ecors-dropdown-plan";
  select.id = "ecors-dropdown-plan";

  // Declare button
  const declareBtn = document.createElement("button");
  declareBtn.className = "ecors-button-declare";
  declareBtn.type = "button";
  declareBtn.textContent = "Declare";
  declareBtn.disabled = true;
  declareBtn.style.backgroundColor = "#ccc";

  // Change button
  const changeBtn = document.createElement("button");
  changeBtn.className = "ecors-button-change";
  changeBtn.type = "button";
  changeBtn.textContent = "Change";
  changeBtn.style.display = "none";
  changeBtn.disabled = true;
  changeBtn.style.backgroundColor = "#ccc";

  // Cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "ecors-button-cancel";
  cancelBtn.type = "button";
  cancelBtn.textContent = "Cancel Declaration";
  cancelBtn.disabled = false;
  cancelBtn.style.display = "none";
  cancelBtn.style.backgroundColor = "#003366";

  card.append(cardTitle, fieldLabel, select, declareBtn, changeBtn, cancelBtn);
  root.append(statusRow, card);
}

// ==========================================================
// SHOW PROFILE + LOGOUT
// ==========================================================
function showProfile() {
  const t = keycloak.idTokenParsed;
  const name = t.name || t.preferred_username;
  const badge = document.querySelector(".ecors-fullname");
  if (badge) badge.textContent = `Welcome, ${name}`;
}

function wireLogout() {
  const btn = document.querySelector(".ecors-button-signout");
  if (!btn) return;

  btn.addEventListener("click", () => {
    keycloak.logout({
      redirectUri: window.location.origin + "/intproj25/ssi4/itb-ecors/",
    });
  });
}

// ==========================================================
// CACHE
// ==========================================================
let declaredDataCache = null;

// ==========================================================
// LOAD DECLARED STATUS
// ==========================================================
async function loadDeclaredStatus() {
  const span = document.querySelector(".ecors-declared-plan");
  if (!span) return null;

  span.textContent = "Not Declared";
  delete span.dataset.planId;

  const studentId = getStudentIdFromToken();
  if (!studentId) return null;

  try {
    // เรียก declared plan จาก BE
    // จาก BE: { studentId, planId, createdAt, updatedAtๆๆๆ}
    const res = await fetch(
      `${config.API_BASE_URL}/v1/students/${studentId}/declared-plan`
    );

    if (res.status === 404) {
      span.textContent = "Not Declared";
      declaredDataCache = null;
      return null;
    }

    if (!res.ok) {
      span.textContent = "Not Declared";
      declaredDataCache = null;
      return null;
    }

    const declared = await res.json(); 
    const planId = declared.planId;

    let planCode = declared.planCode;
    let planNameEng = declared.planNameEng;

    // ถ้า BE ยังไม่ได้ส่งชื่อแผนมา ไป lookup จาก /v1/study-plans เอง
    if (!planCode || !planNameEng) {
      try {
        const resPlans = await fetch(`${config.API_BASE_URL}/v1/study-plans`);
        if (resPlans.ok) {
          const json = await resPlans.json();
          const list = json.data || json;

          const matched = list.find(
            (p) => String(p.id) === String(planId)
          );
          if (matched) {
            planCode = matched.planCode;
            planNameEng = matched.nameEng;
          }
        }
      } catch (e) {
        console.error("loadDeclaredStatus: cannot load study plans", e);
      }
    }

    // format เวลา
    const d = new Date(declared.updatedAt);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatted = d.toLocaleString("en-GB", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    if (planCode && planNameEng) {
      span.textContent = `Declared ${planCode} - ${planNameEng} plan on ${formatted} (${tz})`;
    } else {
      // fallback เผื่อ lookup พลาด (แต่ในงานจริงควรเจอ)
      span.textContent = `Declared plan #${planId} on ${formatted} (${tz})`;
    }

    span.dataset.planId = planId;

    // เก็บลง cache
    const fullDeclared = {
      ...declared,
      planCode,
      planNameEng,
    };
    declaredDataCache = fullDeclared;

    // คืนค่า object ให้ใช้
    return fullDeclared;
  } catch (err) {
    console.error("loadDeclaredStatus ERROR:", err);
    span.textContent = "Not Declared";
    delete span.dataset.planId;

    // เคลียร์ cache ตอน error
    declaredDataCache = null;
    return null;
  }
}


// ==========================================================
// LOAD STUDY PLANS INTO DROPDOWN
// ==========================================================
async function populatePlans(selectEl, declaredData) {
  try {
    await keycloak.updateToken(30);
    const token = keycloak.token;

    const res = await fetch(`${config.API_BASE_URL}/v1/study-plans`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const json = await res.json();
    const list = json.data || json;

    selectEl.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "-- Select Major --";
    placeholder.selected = true;
    // placeholder.disabled = true;
    selectEl.appendChild(placeholder);

    list.forEach((item) => {
      const option = document.createElement("option");
      option.className = "ecors-plan-row";
      option.value = item.id;
      option.textContent = `${item.planCode} - ${item.nameEng}`;
      selectEl.appendChild(option);
    });

    if (declaredData && declaredData.planId != null) {
      selectEl.value = String(declaredData.planId);
    } else {
      selectEl.value = "";
    }
  } catch (err) {
    console.error("Failed to load majors:", err);

    selectEl.innerHTML = "";
    const errOpt = document.createElement("option");
    errOpt.value = "";
    errOpt.textContent = "Cannot load plans";
    errOpt.selected = true;
    errOpt.disabled = true;
    selectEl.appendChild(errOpt);
  }
}

// ==========================================================
// WIRE DECLARE BUTTON
// ==========================================================
function wireDeclareButton() {
  const select = document.querySelector(".ecors-dropdown-plan");
  const declareBtn = document.querySelector(".ecors-button-declare");
  const statusEl = document.querySelector(".ecors-declared-plan");
  const changeBtn = document.querySelector(".ecors-button-change");
  const cancelBtn = document.querySelector(".ecors-button-cancel");
  const studentId = getStudentIdFromToken();
  if (!select || !declareBtn || !statusEl || !studentId) return;

  select.addEventListener("change", () => {
    if (select.value !== "") {
      declareBtn.disabled = false;
      declareBtn.style.backgroundColor = "#003366";
    } else {
      declareBtn.disabled = true;
      declareBtn.style.backgroundColor = "#ccc";
    }
  });

  declareBtn.addEventListener("click", async () => {
    // const planId = select.value;
    const planId = Number(select.value);
    if (!planId) return;

    try {
      await keycloak.updateToken(30);
      const token = keycloak.token;

      const res = await fetch(
        `${config.API_BASE_URL}/v1/students/${studentId}/declared-plan`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ planId }),
        }
      );

      if (res.status === 201 || res.status === 409) {
        await loadDeclaredStatus();

        // หลังจาก declared แล้ว ซ่อน Declare, โชว์ Change + Cancel
        declareBtn.style.display = "none";

        changeBtn.style.display = "inline-block";
        changeBtn.disabled = true;
        changeBtn.style.backgroundColor = "#ccc";

        cancelBtn.style.display = "inline-block";
        cancelBtn.disabled = false;
        cancelBtn.style.backgroundColor = "#003366";

        showErrorDialog("", { okButton: true, allowEsc: true }, res);
      } else {
        showErrorDialog("", { okButton: true, allowEsc: true }, res);
      }
    } catch (err) {
      console.error("Declare error:", err);
      showErrorDialog("There is a problem. Please try again later.", {
        okButton: true,
        allowEsc: true,
      });
    }
  });
}

// ==========================================================
// WIRE CHANGE BUTTON
// ==========================================================
function wireChangeButton(studentId) {
  const select = document.querySelector(".ecors-dropdown-plan");
  const changeBtn = document.querySelector(".ecors-button-change");
  const statusEl = document.querySelector(".ecors-declared-plan");

  if (!select || !changeBtn || !statusEl) {
    console.warn("wireChangeButton: element not found", {
      select,
      changeBtn,
      statusEl,
    });
    return;
  }

  select.addEventListener("change", () => {
    const currentPlanId = statusEl.dataset.planId || "";
    if (!select.value || select.value === currentPlanId) {
      changeBtn.disabled = true;
      changeBtn.style.backgroundColor = "#ccc";
    } else {
      changeBtn.disabled = false;
      changeBtn.style.backgroundColor = "#003366";
    }
  });

  changeBtn.addEventListener("click", async () => {
    const planId = Number(select.value);
    if (!planId) return;

    try {
      await keycloak.updateToken(30);
      const token = keycloak.token;

      const res = await fetch(
        `${config.API_BASE_URL}/v1/students/${studentId}/declared-plan`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ planId }),
        }
      );

      if (res.status === 200) {
        await loadDeclaredStatus();

        showErrorDialog("Declaration updated.", { okButton: true });

        changeBtn.disabled = true;
        changeBtn.style.backgroundColor = "#ccc";
        return;
      }

      // 404 ไม่มี declared plan แล้วต้อง reset UI เป็น Not Declared
      if (res.status === 404) {
        statusEl.textContent = "Not Declared";
        delete statusEl.dataset.planId;

        const select = document.querySelector(".ecors-dropdown-plan");
        if (select) {
          select.value = "";
        }

        const declareBtn = document.querySelector(".ecors-button-declare");
        const cancelBtn = document.querySelector(".ecors-button-cancel");

        if (declareBtn) {
          declareBtn.style.display = "inline-block";
          declareBtn.disabled = true;
          declareBtn.style.backgroundColor = "#ccc";
        }
        if (changeBtn) {
          changeBtn.style.display = "none";
          changeBtn.disabled = true;
        }
        if (cancelBtn) {
          cancelBtn.style.display = "none";
          cancelBtn.disabled = true;
        }

        showErrorDialog(
          `No declared plan found for student with id=${studentId}.`,
          { okButton: true }
        );
        return;
      }

      showErrorDialog("There is a problem. Please try again later.", {
        okButton: true,
      });
    } catch (err) {
      console.error("Change error:", err);
      showErrorDialog("There is a problem. Please try again later.", {
        okButton: true,
      });
    }
  });
}

// ==========================================================
// WIRE CANCEL BUTTON
// ==========================================================
function wireCancelButton() {
  const cancelBtn = document.querySelector(".ecors-button-cancel");
  const studentId = getStudentIdFromToken();
  if (!cancelBtn || !studentId) return;

  cancelBtn.addEventListener("click", async () => {
    // ใช้ cache แทนเรียก API ซ้ำแบบครั้งที่แล้ว
    const declaredData = declaredDataCache;

    if (!declaredData) {
      showErrorDialog("You have no declared plan.", { okButton: true });
      return;
    }

    const d = new Date(declaredData.updatedAt);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatted = d.toLocaleString("en-GB", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const message =
      "You have declared " +
      `${declaredData.planCode} - ${declaredData.planNameEng}` +
      " as your plan on " +
      `${formatted} (${tz}). ` +
      "Are you sure you want to cancel this declaration?";

    showConfirmCancelDialog(message, async () => {
      try {
        await keycloak.updateToken(30);
        const token = keycloak.token;

        const res = await fetch(
          `${config.API_BASE_URL}/v1/students/${studentId}/declared-plan`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.status === 200 || res.status === 204) {
          // ยกเลิกสำเร็จ 
          const statusEl = document.querySelector(".ecors-declared-plan");
          if (statusEl && declaredData) {
            const now = new Date(declaredData.updatedAt);
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const formatted = now.toLocaleString("en-GB", {
              timeZone: tz,
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });

            const planCode = declaredData.planCode;
            const planNameEng =
              declaredData.planNameEng || declaredData.nameEng || "";

            statusEl.textContent =
              `Cancelled ${planCode} - ${planNameEng} on ${formatted} (${tz})`;

            delete statusEl.dataset.planId;
          }

          declaredDataCache = null;

          const select = document.querySelector(".ecors-dropdown-plan");
          if (select) {
            select.value = "";
          }

          const declareBtn = document.querySelector(".ecors-button-declare");
          const changeBtn = document.querySelector(".ecors-button-change");
          const cancelBtnEl = document.querySelector(".ecors-button-cancel");

          if (declareBtn) {
            declareBtn.disabled = true;
            declareBtn.style.backgroundColor = "#ccc";
            declareBtn.style.display = "inline-block";
          }
          if (changeBtn) {
            changeBtn.disabled = true;
            changeBtn.style.display = "none";
          }
          if (cancelBtnEl) {
            cancelBtnEl.disabled = true;
            cancelBtnEl.style.display = "none";
          }

          showErrorDialog("Declaration cancelled.", {
            okButton: true,
            allowEsc: true,
          });

        } else if (res.status === 404) {

          // รีเซ็ต status เป็น Not Declared
          const statusEl = document.querySelector(".ecors-declared-plan");
          if (statusEl) {
            statusEl.textContent = "Not Declared";
            delete statusEl.dataset.planId;
          }

          // รีเซ็ต dropdown กลับไป placeholder
          const select = document.querySelector(".ecors-dropdown-plan");
          if (select) {
            select.value = "";
          }

          // แสดงเฉพาะปุ่ม Declare (disabled) ซ่อน Change + Cancel
          const declareBtn = document.querySelector(".ecors-button-declare");
          const changeBtn = document.querySelector(".ecors-button-change");
          const cancelBtnEl = document.querySelector(".ecors-button-cancel");

          if (declareBtn) {
            declareBtn.style.display = "inline-block";
            declareBtn.disabled = true;
            declareBtn.style.backgroundColor = "#ccc";
          }
          if (changeBtn) {
            changeBtn.style.display = "none";
            changeBtn.disabled = true;
          }
          if (cancelBtnEl) {
            cancelBtnEl.style.display = "none";
            cancelBtnEl.disabled = true;
          }
          declaredDataCache = null;

          showErrorDialog(
            `No declared plan found for student with id=${studentId}.`,
            { okButton: true, allowEsc: true }
          );

        } else {
          showErrorDialog("", { okButton: true, allowEsc: true }, res);
        }
      } catch (err) {
        console.error("Cancel error:", err);
        showErrorDialog("There is a problem. Please try again later.", {
          okButton: true,
        });
      }
    });
  });
}

// ==========================================================
// BOOT
// ==========================================================
async function boot() {
  try {
    await injectPartials();

    const authenticated = await keycloak.init(kcInitOpts);
    if (!authenticated) return;

    showProfile();
    wireLogout();

    const studentId = getStudentIdFromToken();
    const select = document.querySelector(".ecors-dropdown-plan");

    let declaredData = await loadDeclaredStatus();
    await populatePlans(select, declaredData);

    // ตั้งค่า state ปุ่มตอนแรกว่ามี declared แล้วหรือยัง
    const declareBtn = document.querySelector(".ecors-button-declare");
    const changeBtn = document.querySelector(".ecors-button-change");
    const cancelBtn = document.querySelector(".ecors-button-cancel");

    if (declaredData && declaredData.planId != null) {
      // เคย declared แล้ว  แสดง Change + Cancel, ซ่อน Declare
      if (declareBtn) {
        declareBtn.style.display = "none";
      }
      if (changeBtn) {
        changeBtn.style.display = "inline-block";
        changeBtn.disabled = true;
        changeBtn.style.backgroundColor = "#ccc";
      }
      if (cancelBtn) {
        cancelBtn.style.display = "inline-block";
        cancelBtn.disabled = false;
        cancelBtn.style.backgroundColor = "#003366";
      }
    } else {
      // ยังไม่ declared  แสดงแค่ Declare
      if (declareBtn) {
        declareBtn.style.display = "inline-block";
        declareBtn.disabled = true;
        declareBtn.style.backgroundColor = "#ccc";
      }
      if (changeBtn) {
        changeBtn.style.display = "none";
      }
      if (cancelBtn) {
        cancelBtn.style.display = "none";
      }
    }

    wireDeclareButton();
    wireChangeButton(studentId);
    wireCancelButton();
  } catch (err) {
    console.error("Boot error:", err);
  }
}

document.addEventListener("DOMContentLoaded", boot);