import crypto from "crypto";

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const algorithm = "aes-256-cbc";

export function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedText = cipher.update(text, "utf-8", "hex");
  encryptedText += cipher.final("hex");
  return encryptedText;
}

export function decrypt(text) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decryptedText = decipher.update(text, "hex", "utf-8");
  decryptedText += decipher.final("utf-8");
  return decryptedText;
}
