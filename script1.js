// ===== script1.js =====

// Replace with your real key
const apiKey = "ecdd8f64570240f0b0303519251810";

console.log("script1.js loaded"); // sanity check

async function getWeather() {
  const city = document.getElementById("city").value.trim();
  const region = document.getElementById("region").value.trim();
  const weatherResult = document.getElementById("weather-result");

  if (!city || !region) {
    alert("Please enter both city and country/state.");
    return;
  }

  const query = `${city},${region}`;
  weatherResult.classList.add("loading");
  weatherResult.innerHTML = `<p>Loading weather for <strong>${city}, ${region}</strong>…</p>`;

  try {
    // Step 1: Fetch current weather
    const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(query)}&aqi=no`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      const t = await weatherResponse.text().catch(()=> "");
      throw new Error(`Weather fetch failed (${weatherResponse.status}). ${t || ""}`);
    }
    const weatherData = await weatherResponse.json();

    // Step 2: Fetch astronomy (sunset) data
    const date = (weatherData.location?.localtime || "").split(" ")[0] || new Date().toISOString().slice(0,10);
    const astronomyUrl = `https://api.weatherapi.com/v1/astronomy.json?key=${apiKey}&q=${encodeURIComponent(query)}&dt=${date}`;
    const astronomyResponse = await fetch(astronomyUrl);
    if (!astronomyResponse.ok) {
      const t = await astronomyResponse.text().catch(()=> "");
      throw new Error(`Astronomy fetch failed (${astronomyResponse.status}). ${t || ""}`);
    }
    const astronomyData = await astronomyResponse.json();

    // Step 3: Display all combined data
    displayWeather(weatherData, astronomyData);
  } catch (error) {
    console.error(error);
    weatherResult.innerHTML = `<p style="color:#b00020;"><strong>Error:</strong> ${error.message}</p>`;
  } finally {
    weatherResult.classList.remove("loading");
  }
}

// Display weather info and style dynamically
function displayWeather(weatherData, astronomyData) {
  const weather = weatherData.current;
  const location = weatherData.location;
  const sunset = astronomyData?.astronomy?.astro?.sunset || "—";

  const conditionText = weather?.condition?.text || "—";
  const condition = conditionText.toLowerCase();
  const weatherIconUrl = weather?.condition?.icon ? `https:${weather.condition.icon}` : "";
  const weatherResult = document.getElementById("weather-result");

  // Choose background color by condition
  let bgColor = "rgba(9, 25, 144, 0.1)"; // default blue tint
  if (condition.includes("sunny") || condition.includes("clear")) {
    bgColor = "rgba(255, 223, 88, 0.25)";
  } else if (condition.includes("cloud")) {
    bgColor = "rgba(120, 144, 156, 0.25)";
  } else if (condition.includes("rain")) {
    bgColor = "rgba(179, 229, 252, 0.35)";
  } else if (condition.includes("snow")) {
    bgColor = "rgba(197, 225, 250, 0.45)";
  } else if (condition.includes("thunder") || condition.includes("storm")) {
    bgColor = "rgba(152, 121, 111, 0.25)";
  } else if (condition.includes("mist") || condition.includes("fog")) {
    bgColor = "rgba(240, 244, 195, 0.35)";
  }

  // Apply styles
  weatherResult.style.backgroundColor = bgColor;
  weatherResult.style.padding = "20px";
  weatherResult.style.borderRadius = "10px";
  weatherResult.style.transition = "background-color 0.5s ease";

  const localDate = (location?.localtime || "").split(" ")[0] || "—";
  const localTime = (location?.localtime || "").split(" ")[1] || "—";

  // Create HTML
  const html = `
    <h2>${escapeHtml(location?.name || "—")}, ${escapeHtml(location?.region || "—")}, ${escapeHtml(location?.country || "—")}</h2>
    ${weatherIconUrl ? `<img src="${weatherIconUrl}" alt="${escapeHtml(conditionText)}" />` : ""}
    <p><strong>Condition:</strong> ${escapeHtml(conditionText)}</p>
    <p><strong>Temperature:</strong> ${weather?.temp_c ?? "—"}°C (feels like ${weather?.feelslike_c ?? "—"}°C)</p>
    <p><strong>Humidity:</strong> ${weather?.humidity ?? "—"}%</p>
    <p><strong>Cloud Cover:</strong> ${weather?.cloud ?? "—"}%</p>
    <p><strong>Wind:</strong> ${weather?.wind_kph ?? "—"} kph ${escapeHtml(weather?.wind_dir ?? "—")}</p>
    <p><strong>Date:</strong> ${escapeHtml(localDate)} &nbsp; <strong>Time:</strong> ${escapeHtml(localTime)}</p>
    <p><strong>Sunset Time:</strong> ${escapeHtml(sunset)}</p>
    <p style="font-size:12px;opacity:0.7;">Last Updated: ${escapeHtml(weather?.last_updated || "—")}</p>
  `;

  weatherResult.innerHTML = html;
}

// Helper to escape HTML if needed
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Optional: press Enter to trigger search
(function addEnterSupport() {
  const cityInput = document.getElementById("city");
  const regionInput = document.getElementById("region");
  [cityInput, regionInput].forEach((input) => {
    input.addEventListener("keyup", (event) => {
      if (event.key === "Enter") getWeather();
    });
  });
})();

// IMPORTANT: expose getWeather for inline onclick in your HTML
window.getWeather = getWeather;
