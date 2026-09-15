import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  // 1. Générer une paire de clés RSA-OAEP (Clé publique / Clé privée)
  async generateKeyPair(): Promise<CryptoKeyPair> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true, // Les clés peuvent être exportées
      ['encrypt', 'decrypt']
    );
  }

  // 2. Exporter une clé publique en format String (pour l'envoyer au correspondant)
  async exportPublicKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('spki', key);
    const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
    return window.btoa(exportedAsString);
  }

  // 3. Importer une clé publique reçue au format String
  async importPublicKey(pemKey: string): Promise<CryptoKey> {
    const binaryDerString = window.atob(pemKey);
    const binaryDer = Uint8Array.from(binaryDerString, c => c.charCodeAt(0));

    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer.buffer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt']
    );
  }

  // 4. Chiffrer un message texte avec la clé publique du destinataire
  async encryptMessage(plainText: string, publicKey: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      data
    );

    const encryptedAsString = String.fromCharCode(...new Uint8Array(encrypted));
    return window.btoa(encryptedAsString);
  }

  // 5. Déchiffrer un message chiffré avec sa propre clé privée
  async decryptMessage(encryptedBase64: string, privateKey: CryptoKey): Promise<string> {
    const binaryDerString = window.atob(encryptedBase64);
    const encryptedData = Uint8Array.from(binaryDerString, c => c.charCodeAt(0));

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encryptedData.buffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}
