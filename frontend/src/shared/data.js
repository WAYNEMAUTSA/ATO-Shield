export const mockContacts = [
  { name: "Aisha Khan", accountId: "583920147261", amount: 15000, location: "Mumbai, India", device_id: "dev_9482", merchant_category: "Food", description: "buying lunch" },
  { name: "Rahul Mehta", accountId: "120384756293", amount: 1200, location: "Delhi, India", device_id: "dev_1049", merchant_category: "Utilities", description: "Electricity bill" },
  { name: "Priya Nair", accountId: "847261039582", amount: 4500, location: "Bangalore, India", device_id: "dev_8842", merchant_category: "Shopping", description: "Online store order" },
  { name: "Vikram Singh", accountId: "294857103648", amount: 350, location: "Pune, India", device_id: "dev_3721", merchant_category: "Transport", description: "Cab ride fare" },
  { name: "Sneha Reddy", accountId: "738291046572", amount: 21000, location: "Hyderabad, India", device_id: "dev_6619", merchant_category: "Rent", description: "Monthly room advance" },
  { name: "Arjun Verma", accountId: "609182734950", amount: 800, location: "Chennai, India", device_id: "dev_5521", merchant_category: "Entertainment", description: "Movie tickets" },
  { name: "Neha Joshi", accountId: "451029384756", amount: 150, location: "Ahmedabad, India", device_id: "dev_4492", merchant_category: "Food", description: "Morning coffee break" },
  { name: "Karan Malhotra", accountId: "827364509182", amount: 9500, location: "Kolkata, India", device_id: "dev_1102", merchant_category: "Electronics", description: "Mechanical keyboard" },
  { name: "Divya Iyer", accountId: "192837465029", amount: 6200, location: "Cochin, India", device_id: "dev_7391", merchant_category: "Medical", description: "Pharmacy clinic purchase" },
  { name: "Sahil Kapoor", accountId: "564738291046", amount: 3100, location: "Jaipur, India", device_id: "dev_2840", merchant_category: "Travel", description: "Hotel booking deposit" },
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

// Updated Core send logic — handles balanced states dynamically without profile switching
export function sendMoney({ accountId, name, amount, currentBalance, currentUserId }) {
  if (amount > currentBalance) {
    return { success: false, error: "Insufficient balance." };
  }

  // Deduct sender balance locally right away
  const newBalance = currentBalance - amount;
  setBalance(newBalance);

  // Parse details for structural logs matching your schema preference
  const activeUser = JSON.parse(localStorage.getItem("ato_user") || "{}");

  addTransaction({
    transaction_id: `txn_${Date.now()}`,
    account_id: accountId,
    amount: amount,
    location: activeUser.location || "Unknown",
    device_id: activeUser.deviceId || "Unknown Device",
    merchant_category: "Peer Transfer",
    description: `Sent money to ${name || "User"}`,
    type: "sent",
    date: new Date().toISOString(),
    status: "success",
  });

  return { success: true, newBalance };
}