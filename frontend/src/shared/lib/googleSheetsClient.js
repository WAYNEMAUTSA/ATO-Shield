import { SignJWT, importPKCS8 } from "jose";

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_SHEET_ID;
const CLIENT_EMAIL = import.meta.env.VITE_GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = import.meta.env.VITE_GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n");

const SHEETS = {
  profile: "profile",
  transactions: "transactions",
  analyst: "analyst",
};

async function getAccessToken() {
  const privateKey = await importPKCS8(PRIVATE_KEY, "RS256");
  const now = Math.floor(Date.now() / 1000);

  const jwt = await new SignJWT({ scope: "https://www.googleapis.com/auth/spreadsheets" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(now)
    .setIssuer(CLIENT_EMAIL)
    .setAudience("https://oauth2.googleapis.com/token")
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token)
    throw new Error("Failed to get access token: " + JSON.stringify(tokenData));
  return tokenData.access_token;
}

async function sheetsRequest(endpoint, options = {}) {
  const token = await getAccessToken();
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;
  const res = await fetch(`${base}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API error (${res.status}): ${err}`);
  }
  return res.json();
}

async function getHeaders(sheet) {
  const data = await sheetsRequest(`/values/${encodeURIComponent(sheet)}!1:1`);
  return (data.values?.[0] || []).map(
    (h) => h.trim().charAt(0).toLowerCase() + h.trim().slice(1)
  );
}

async function getRows(sheet) {
  const data = await sheetsRequest(`/values/${encodeURIComponent(sheet)}`);
  const [headerRow, ...rows] = data.values || [];
  if (!headerRow) return [];
  const headers = headerRow.map(
    (h) => h.trim().charAt(0).toLowerCase() + h.trim().slice(1)
  );
  return rows.map((row, i) => {
    const obj = { _rowIndex: i + 2 };
    headers.forEach((h, j) => (obj[h] = row[j] ?? ""));
    return obj;
  });
}

async function appendRow(sheet, fields) {
  const headers = await getHeaders(sheet);
  const row = headers.map((h) => fields[h] ?? "");
  await sheetsRequest(
    `/values/${encodeURIComponent(sheet)}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values: [row] }) }
  );
}

async function updateRow(sheet, rowIndex, fields) {
  const headers = await getHeaders(sheet);
  const row = headers.map((h) => fields[h] ?? "");
  await sheetsRequest(
    `/values/${encodeURIComponent(sheet)}!A${rowIndex}?valueInputOption=USER_ENTERED`,
    { method: "PUT", body: JSON.stringify({ values: [row] }) }
  );
}

export const sheety = {
  getProfiles: async () => {
    const rows = await getRows(SHEETS.profile);
    return { profile: rows };
  },

  createProfile: async (fields) => {
    await appendRow(SHEETS.profile, fields);
    return { profile: fields };
  },

  updateProfile: async (accountId, fields) => {
    const rows = await getRows(SHEETS.profile);
    const row = rows.find(
      (r) => String(r.accountId).trim() === String(accountId).trim()
    );
    if (!row) throw new Error(`Profile not found for accountId: ${accountId}`);
    const merged = { ...row, ...fields };
    await updateRow(SHEETS.profile, row._rowIndex, merged);
    return merged;
  },

  getTransactions: async () => {
    const rows = await getRows(SHEETS.transactions);
    return { transactions: rows };
  },

  createTransaction: (fields) => appendRow(SHEETS.transactions, fields),

  getAnalysts: async () => {
    const rows = await getRows(SHEETS.analyst);
    return { analyst: rows };
  },
};