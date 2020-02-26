import { Utils } from "@mcma/core";
import { RSAKey } from "../vendor/jsbn";

export interface RSAPublicParams {
    n: string;
    e: string;
}

export interface RSAPrivateParams extends RSAPublicParams {
    d: string;
    p: string;
    q: string;
    dmp1: string;
    dmq1: string;
    coeff: string;
}

function isPrivateParams(rsa: RSAPublicParams): rsa is RSAPrivateParams {
    return typeof rsa["p"] !== "undefined";
}

function exportRsaKey(rsa: RSAKey, includePrivate: boolean): (typeof includePrivate extends  true ? RSAPrivateParams : RSAPublicParams) {
    let rsaKey = {
        n: rsa.n.toString(16),
        e: rsa.e.toString(16)
    };

    if (!includePrivate) {
        return rsaKey;
    }

    if (includePrivate) {
        return Object.assign(rsaKey, {
            d: rsa.d.toString(16),
            p: rsa.p.toString(16),
            q: rsa.q.toString(16),
            dmp1: rsa.dmp1.toString(16),
            dmq1: rsa.dmq1.toString(16),
            coeff: rsa.coeff.toString(16)
        });
    }
}

function importRsaKey(rsa: RSAKey, rsaKey: RSAPublicParams | RSAPrivateParams): void {
    if (isPrivateParams(rsaKey)) {
        rsa.setPrivateEx(rsaKey.n, rsaKey.e, rsaKey.d, rsaKey.p, rsaKey.q, rsaKey.dmp1, rsaKey.dmq1, rsaKey.coeff);
    } else {
        rsa.setPublic(rsaKey.n, rsaKey.e);
    }
}

function exportJson(rsa: RSAKey, includePrivate: boolean): string {
    const rsaKey = exportRsaKey(rsa, includePrivate);
    const rsaKeyJson = JSON.stringify(rsaKey);
    const rsaKeyJsonBase64 = Utils.toBase64(rsaKeyJson);
    return rsaKeyJsonBase64;
}

function importJson(rsa: RSAKey, rsaKeyJsonBase64: string) {
    const rsaKeyJson = Utils.fromBase64(rsaKeyJsonBase64);
    const rsaKey = JSON.parse(rsaKeyJson);
    importRsaKey(rsa, rsaKey);
}

function generateNewKeys(): [string, string] {
    const rsa = new RSAKey();
    rsa.generate(1024, "10001");
    return [exportJson(rsa, true), exportJson(rsa, false)];
}

function encrypt(toEncrypt: string, publicKeyJson: string): string{
    const rsa = new RSAKey();
    importJson(rsa, publicKeyJson);
    return Utils.toBase64(rsa.encrypt(toEncrypt));
}

function decrypt(toDecrypt: string, privateKeyJson: string): string {
    const rsa = new RSAKey();
    importJson(rsa, privateKeyJson);
    return rsa.decrypt(Utils.fromBase64(toDecrypt));
}

export const EncryptionHelper = {
    generateNewKeys,
    encrypt,
    decrypt
}