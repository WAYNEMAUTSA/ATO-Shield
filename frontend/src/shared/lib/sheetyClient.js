const BASE_URL = import.meta.env.VITE_SHEETY_BASE_URL;
const USERNAME = import.meta.env.VITE_SHEETY_USERNAME;
const PASSWORD = import.meta.env.VITE_SHEETY_PASSWORD;

const authHeader = "Basic " + btoa(`${USERNAME}:${PASSWORD}`);

async function sheetyRequest(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Sheety request failed (${res.status}): ${errText}`);
  }

  return res.json();
}

export const sheety = {
  getProfiles: () => sheetyRequest("/profile"),
  createProfile: (profile) =>
    sheetyRequest("/profile", {
      method: "POST",
      body: JSON.stringify({ profile }),
    }),
};