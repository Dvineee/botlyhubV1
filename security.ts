
import CryptoJS from 'crypto-js';

// Not: Gerçek bir prodüksiyon ortamında, anahtar sunucudan alınmalı veya
// kullanıcı şifresinden türetilmelidir. Bu demo için sabit bir anahtar kullanıyoruz.
const SECRET_KEY = "botly-secure-key-v1"; 

export const encryptData = (data: string): string => {
  try {
    // Check if AES is available on the imported object (handling various CDN export shapes)
    if (CryptoJS && CryptoJS.AES) {
        return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
    }
    
    // Fallback if library didn't load fully or in mock env
    const b64 = btoa(unescape(encodeURIComponent(data)));
    return `enc_${b64}`;
  } catch (e) {
    console.error("Encryption failed", e);
    return "";
  }
};

export const decryptData = (cipherText: string): string => {
  try {
    if (!cipherText) return "";
    
    // Try AES decryption first
    if (CryptoJS && CryptoJS.AES && !cipherText.startsWith("enc_")) {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    // Fallback logic for simple encoding
    if (cipherText.startsWith("enc_")) {
        const b64 = cipherText.replace("enc_", "");
        return decodeURIComponent(escape(atob(b64)));
    }
    
    return "";
  } catch (e) {
    console.error("Decryption failed", e);
    return "";
  }
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, ""); // Basic XSS prevention
};
