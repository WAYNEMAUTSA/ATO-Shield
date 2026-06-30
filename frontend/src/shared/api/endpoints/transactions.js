const TRANSACTIONS_URL = import.meta.env.VITE_SHEETY_TRANSACTIONS_URL;

export async function fetchTransactions() {
  try {
    const response = await fetch(TRANSACTIONS_URL);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    const data = await response.json();
    // Returning the transactions array
    return data.transactions || []; 
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}