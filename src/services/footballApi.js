
const API_BASE_URL = "https://v3.football.api-sports.io";

function getApiKey() {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    throw new Error("API_FOOTBALL_KEY is not configured");
  }

  return apiKey;
}

async function footballApiRequest(endpoint, params = {}) {
  if (typeof endpoint !== "string" || !endpoint.startsWith("/")) {
    throw new Error("A valid API-Football endpoint is required");
  }

  const url = new URL(`${API_BASE_URL}${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": getApiKey(),
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`API-Football request failed with HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(
      `API-Football returned an API error: ${JSON.stringify(data.errors)}`
    );
  }

  return data;
}

async function checkFootballApiConnection() {
  return footballApiRequest("/status");
}

module.exports = {
  footballApiRequest: footballApiRequest,
  checkFootballApiConnection: checkFootballApiConnection,
};
