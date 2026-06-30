export const mockContacts = [
  { name: "Aisha Khan", accountId: "583920147261" },
  { name: "Rahul Mehta", accountId: "120384756293" },
  { name: "Priya Nair", accountId: "847261039582" },
  { name: "Vikram Singh", accountId: "294857103648" },
  { name: "Sneha Reddy", accountId: "738291046572" },
  { name: "Arjun Verma", accountId: "609182734950" },
  { name: "Neha Joshi", accountId: "451029384756" },
  { name: "Karan Malhotra", accountId: "827364509182" },
  { name: "Divya Iyer", accountId: "192837465029" },
  { name: "Sahil Kapoor", accountId: "564738291046" },
];

export function logout(navigate) {
  localStorage.removeItem("ato_user");
  localStorage.removeItem("ato_token");
  localStorage.removeItem("ato_balance");
  localStorage.removeItem("ato_transactions");
  localStorage.removeItem("ato_notifications");
  navigate("/welcome");
}

const BALANCE_KEY = "ato_balance";
const TRANSACTIONS_KEY = "ato_transactions";

export function getBalance(fallback = 0) {
  const stored = localStorage.getItem(BALANCE_KEY);
  if (stored !== null) return Number(stored);
  // First time: seed from whatever was in ato_user, then store it
  localStorage.setItem(BALANCE_KEY, String(fallback));
  return fallback;
}

export function setBalance(amount) {
  localStorage.setItem(BALANCE_KEY, String(amount));
  window.dispatchEvent(new Event("ato_balance_updated"));
}

export function getTransactions() {
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function addTransaction(transaction) {
  const updated = [transaction, ...getTransactions()];
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("ato_transactions_updated"));
}

// Core send logic — call this from Send.jsx
export function sendMoney({ accountId, name, amount, currentBalance }) {
  if (amount > currentBalance) {
    return { success: false, error: "Insufficient balance." };
  }

  const newBalance = currentBalance - amount;
  setBalance(newBalance);

  addTransaction({
    id: `txn_${Date.now()}`,
    type: "sent",
    name: name || "Unknown",
    accountId,
    amount,
    date: new Date().toISOString(),
    status: "success",
  });

  return { success: true, newBalance };
}