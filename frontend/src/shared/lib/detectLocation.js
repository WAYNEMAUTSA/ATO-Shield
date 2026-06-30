// src/shared/lib/detectLocation.js
export async function detectLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || "";
          const country = data.address.country || "";
          resolve(city && country ? `${city}, ${country}` : data.display_name);
        } catch (err) {
          reject(err);
        }
      },
      (err) => reject(err)
    );
  });
}