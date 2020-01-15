export class EncryptionHelper {
    static generateNewKeys(): [string, string];
    static encrypt(toEncrypt: string, publicKeyBase64Json: string): string;
    static decrypt(toDecrypt: string, privateKeyBase64Json: string): string;
}