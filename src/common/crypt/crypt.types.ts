export interface Crypt {
  enc(plainText: string, key?: string): string;
  dec(encryptedText: string, key?: string): string;
}
