const { Utils } = require("@mcma/core");
const { RSAKey } = require("../vendor/jsbn");

function exportRsaKey(rsa, includePrivate) {
    let rsaKey = {
        n: rsa.n.toString(16),
        e: rsa.e.toString(16)
    };

    if (includePrivate) {
        rsaKey = Object.assign(rsaKey, {
            d: rsa.d.toString(16),
            p: rsa.p.toString(16),
            q: rsa.q.toString(16),
            dmp1: rsa.dmp1.toString(16),
            dmq1: rsa.dmq1.toString(16),
            coeff: rsa.coeff.toString(16)
        });
    }

    return rsaKey;
}

function importRsaKey(rsa, rsaKey) {
    if (rsaKey.p) {
        rsa.setPrivateEx(rsaKey.n, rsaKey.e, rsaKey.d, rsaKey.p, rsaKey.q, rsaKey.dmp1, rsaKey.dmq1, rsaKey.coeff);
    } else if (rsaKey.d) {
        rsa.setPrivate(rsaKey.n, rsaKey.e, rsaKey.d);
    } else {
        rsa.setPublic(rsaKey.n, rsaKey.e);
    }
}

function exportJson(rsa, includePrivate) {
    const rsaKey = exportRsaKey(rsa, includePrivate);
    const rsaKeyJson = JSON.stringify(rsaKey);
    const rsaKeyJsonBase64 = Utils.toBase64(rsaKeyJson);
    return rsaKeyJsonBase64;
}

function importJson(rsa, rsaKeyJsonBase64) {
    const rsaKeyJson = Utils.fromBase64(rsaKeyJsonBase64);
    const rsaKey = JSON.parse(rsaKeyJson);
    importRsaKey(rsa, rsaKey);
}

function generateNewKeys() {
    const rsa = new RSAKey();
    rsa.generate(1024, "10001");
    return [exportJson(rsa, true), exportJson(rsa, false)];
}

function encrypt(toEncrypt, publicKeyJson) {
    const rsa = new RSAKey();
    importJson(rsa, publicKeyJson);
    return Utils.toBase64(rsa.encrypt(toEncrypt));
}

function decrypt(toDecrypt, privateKeyJson) {
    const rsa = new RSAKey();
    importJson(rsa, privateKeyJson);
    return rsa.decrypt(Utils.fromBase64(toDecrypt));
}

module.exports = {
    generateNewKeys,
    encrypt,
    decrypt
};