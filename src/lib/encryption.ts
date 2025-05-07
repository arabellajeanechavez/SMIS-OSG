import { ACCESS_SECRET } from "@/constants/secrets";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Convert secret to a cryptographic key
async function getKey(): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(ACCESS_SECRET || ""),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Helper: Convert standard Base64 string to URL-friendly Base64 (Base64URL)
function base64ToUrlFriendly(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Helper: Convert URL-friendly Base64 string back to standard Base64
function urlFriendlyToBase64(urlFriendly: string): string {
  let base64 = urlFriendly.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding back if needed
  while (base64.length % 4) {
    base64 += "=";
  }
  return base64;
}

export async function encrypt(rawText: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM requires 12-byte IV
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(rawText)
  );

  // Concatenate the IV and encrypted data
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);

  // Convert to Base64 then to URL-friendly format
  const base64 = btoa(String.fromCharCode(...result));
  return base64ToUrlFriendly(base64);
}

export async function decrypt(encryptedText: string): Promise<string> {
  // Convert the URL-friendly string back to standard Base64
  const base64 = urlFriendlyToBase64(encryptedText);
  const rawData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const iv = rawData.slice(0, 12);
  const encryptedData = rawData.slice(12);
  const key = await getKey();

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedData
  );

  return decoder.decode(decrypted);
}
