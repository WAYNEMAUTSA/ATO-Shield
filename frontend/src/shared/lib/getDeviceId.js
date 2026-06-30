export function getDeviceId() {
  // Fallback if browser blocks crypto.randomUUID on local network HTTP connections
  if (typeof window !== "undefined") {
    let id = localStorage.getItem("ato_device_id");
    if (id) return id;

    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      id = window.crypto.randomUUID();
    } else {
      // Insecure HTTP network custom fallback string generator
      id = "dev-device-" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }

    localStorage.setItem("ato_device_id", id);
    return id;
  }
  return "unknown-environment";
}