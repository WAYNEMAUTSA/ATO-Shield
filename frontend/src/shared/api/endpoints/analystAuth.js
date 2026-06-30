import { sheety } from "@/shared/lib/googleSheetsClient";

export async function fetchAnalysts() {
  try {
    const { analyst } = await sheety.getAnalysts();
    return analyst || [];
  } catch (error) {
    console.error("Error fetching analysts:", error);
    return [];
  }
}