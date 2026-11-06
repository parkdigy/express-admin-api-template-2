export interface Aes256 {
  encrypt(key: string, input: string): string;
  encrypt(key: string, input: Buffer): Buffer;
  decrypt(key: string, encrypted: string): string;
  decrypt(key: string, encrypted: Buffer): Buffer;
}
