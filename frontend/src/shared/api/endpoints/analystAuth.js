const SHEETY_URL = import.meta.env.VITE_SHEETY_ANALYST_URL;

export async function fetchAnalysts() {
  const response = await fetch(SHEETY_URL);
  if (!response.ok) {
    throw new Error("Unable to reach the authentication service.");
  }
  const data = await response.json();
  return data.analyst; // adjust key name once you confirm Sheety's actual response shape
}