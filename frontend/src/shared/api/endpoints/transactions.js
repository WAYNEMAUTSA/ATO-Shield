import apiClient from "@/shared/api/client";

export async function fetchTransactions() {
  try {
    const response = await apiClient.get("/transactions");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching backend transactions:", error);
    return [];
  }
}

export async function createTransaction(transaction) {
  try {
    const response = await apiClient.post("/transactions", transaction);
    return response.data;
  } catch (error) {
    console.error("Error creating backend transaction:", error);
    throw error;
  }
}