const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_SHEET_ID;
const CLIENT_EMAIL = import.meta.env.VITE_GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = import.meta.env.VITE_GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n");

const SHEETS = {
  profile: "profile",
  transactions: "transcations", // matches your exact tab name
  analyst: "analyst",
};

// ── JWT generation (no external library needed) ──────────────────────────────

async function getAccessToken() {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const headerB64 = encode(header);
  const claimB64 = encode(claim);
  const signingInput = `${headerB64}.${claimB64}`;

  // Import the private key
  const keyData = PRIVATE_KEY.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "");
  const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${signingInput}.${sigB64}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error("Failed to get access token: " + JSON.stringify(tokenData));
  }
  return tokenData.access_token;
}

// ── Core request ─────────────────────────────────────────────────────────────

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

// ── Row/header helpers ────────────────────────────────────────────────────────

async function getHeaders(sheet) {
  const data = await sheetsRequest(
    `/values/${encodeURIComponent(sheet)}!1:1`
  );
  return (data.values?.[0] || []).map((h) =>
    h.trim().charAt(0).toLowerCase() + h.trim().slice(1)
  );
}

async function getRows(sheet) {
  const data = await sheetsRequest(
    `/values/${encodeURIComponent(sheet)}`
  );
  const [headerRow, ...rows] = data.values || [];
  if (!headerRow) return [];
  const headers = headerRow.map((h) =>
    h.trim().charAt(0).toLowerCase() + h.trim().slice(1)
  );
  return rows.map((row, i) => {
    const obj = { _rowIndex: i + 2 }; // 1-based, +1 for header row
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
  const range = `${sheet}!A${rowIndex}`;
  await sheetsRequest(
    `/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    { method: "PUT", body: JSON.stringify({ values: [row] }) }
  );
}

// ── Public API (same shape as sheety export so nothing else needs to change) ──

export const sheety = {
  // Profile sheet
  getProfiles: () => getRows(SHEETS.profile),

  updateProfile: async (id, fields) => {
    const rows = await getRows(SHEETS.profile);
    const row = rows.find((r) => String(r.id) === String(id));
    if (!row) throw new Error(`Profile row not found for id: ${id}`);
    const merged = { ...row, ...fields };
    await updateRow(SHEETS.profile, row._rowIndex, merged);
    return merged;
  },

  // Transactions sheet
  getTransactions: () => getRows(SHEETS.transactions),

  createTransaction: (transaction) => appendRow(SHEETS.transactions, transaction),

  // Analyst sheet
  getAnalysts: () => getRows(SHEETS.analyst),
};