import { sheety } from "@/shared/lib/googleSheetsClient";
import apiClient from "@/shared/api/client";

function normalizeTransaction(tx) {
  return {
    id: tx.id || tx._rowIndex,
    customerName: tx.customerName || "Unknown",
    accountId: tx.accountId || "",
    recipientAccountId: tx.recipientAccountId || "",
    amount: Number(tx.amount) || 0,
    type: tx.type || "sent",
    status: (tx.status || "").toLowerCase().trim(),
    description: tx.description || "",
    timestamp: tx.timestamp || new Date().toISOString(),
    riskScore: Number(tx.riskScore) || 0,
    device: tx.device || "",
    location: tx.location || "",
  };
}

export async function fetchTransactions() {
  try {
    const { transactions } = await sheety.getTransactions();
    return (transactions || []).map(normalizeTransaction);
  } catch (error) {
    console.error("Error fetching transactions:", error);
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