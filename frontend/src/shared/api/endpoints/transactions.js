import apiClient from "@/shared/api/client";

function normalizeTransaction(tx) {
  return {
    id: tx.id,
    customerName: tx.customerName || "Unknown",
    accountId: tx.accountId || "",
    recipientAccountId: tx.recipientAccountId || "",
    amount: tx.amount ?? 0,
    type: tx.type || "sent",
    status: (tx.status || "").toLowerCase().trim(),
    description: tx.description || "",
    timestamp: tx.timestamp || new Date().toISOString(),
    riskScore: tx.riskScore ?? 0,
    device: tx.device || "",
    location: tx.location || "",
  };
}

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