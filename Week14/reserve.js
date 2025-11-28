import config from "../config/config.js";

async function injectPartials() {
    const nav = document.querySelector(".navbar");
    if (!nav) return;

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

    const statusRow = document.createElement("div");
    statusRow.className = "ecors-status-row";

    const statusLabel = document.createElement("span");
    statusLabel.className = "ecors-status-label";
    statusLabel.textContent = "Declaration Status:";

    const statusValue = document.createElement("span");
    statusValue.className = "ecors-declared-plan";
    statusValue.textContent = "Not Declared";

    statusRow.append(statusLabel, statusValue);

    root.append(statusRow);
}


function getStudentIdFromToken() {
    const t = keycloak.idTokenParsed || keycloak.tokenParsed || {};
    return t.studentId || t.student_id || t.preferred_username || null;
}

async function loadDeclaredStatus() {
    const span = document.querySelector(".ecors-declared-plan");
    if (!span) return;

    span.textContent = "Not Declared";

    const studentId = getStudentIdFromToken();
    if (!studentId) return;

    try {
        const res = await fetch(
            `${config.API_BASE_URL}/v1/students/${studentId}/declared-plan`
        );

        if (res.status === 404) {
            span.textContent = "Not Declared";
            return;
        }

        if (!res.ok) {
            span.textContent = "Not Declared";
            return;
        }

        const data = await res.json();

        const d = new Date(data.updatedAt);
        let selectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const formatted = d.toLocaleString("en-GB", {
            timeZone: selectedTimeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        span.textContent = `Declared ${data.planCode} - ${data.planNameEng} plan on ${formatted} (${selectedTimeZone})`;

    } catch (err) {
        span.textContent = "Not Declared";
    }
}

const keycloak = new Keycloak({
    url: "https://bscit.sit.kmutt.ac.th/intproj25/ft/keycloak/",
    realm: "itb-ecors",
    clientId: "itb-ecors-ssi4",
});

const kcInitOpts = {
    onLoad: "login-required",
    checkLoginIframe: false,
};


function showProfile() {
    const name =
        (keycloak.idTokenParsed && keycloak.idTokenParsed.name) ||
        (keycloak.idTokenParsed &&
            keycloak.idTokenParsed.preferred_username) ||
        "user";

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

async function boot() {
    try {
        await injectPartials();

        const authenticated = await keycloak.init(kcInitOpts);
        if (!authenticated) return;

        showProfile();
        wireLogout();

        await loadDeclaredStatus();

    } catch (err) {
        console.error("Boot error:", err);
    }
}

boot();