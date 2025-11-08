import config from "../config/config.js";

document.addEventListener("DOMContentLoaded", () => {
  fetch("./components/navbar.html")
    .then((res) => res.text())
    .then((data) => (document.getElementById("navbar").innerHTML = data));

  fetch("./components/footer.html")
    .then((res) => res.text())
    .then((data) => (document.getElementById("footer").innerHTML = data));
});

async function loadPlans() {
  try {
    const response = await fetch(`${config.API_BASE_URL}/api/v1/study-plans`);
    console.log(response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data from API:", data);
    renderTable(data.data || data);
  } catch (error) {
    console.error("Error loading study plans:", error);
    showError("There is a problem. Please try again later.");
  }
}

function renderTable(data) {
  const tblElement = document.getElementById("planTable");
  tblElement.innerHTML = "";

  data.forEach((d) => {
    tblElement.innerHTML += `
        <tr class="rowecors">
            <td>${d.id}</td>
            <td>${d.plan_code}</td>
            <td>${d.name_eng}</td>
            <td>${d.name_th}</td>
        </tr>
        `;
  });
}

function showError(message) {
  const logError = document.createElement("dialog");
  logError.className = "ecors-logError";

  const p = document.createElement("p");
  p.className = "ecors-logError-message";
  p.textContent = message;

  logError.appendChild(p);
  document.body.appendChild(logError);
  logError.addEventListener("click", () => logError.close());
  logError.showModal();
}

window.addEventListener("DOMContentLoaded", loadPlans);
