const WEIGHTS = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6];
const WEIGHT_MOD = 11;
const COUNTRY_CODE = "ES";
const BANK_CODE = "9998";
const BRANCH_CODE = "0529";
const ACCOUNT_LENGTH = 10;
const IBAN_LENGTH = 24;

export function generate(): string {
    let accountNumber = String(Math.floor(Math.random() * Math.pow(10, ACCOUNT_LENGTH)));
    accountNumber = accountNumber.padStart(10, "0")

    return insertCheckCode(COUNTRY_CODE + "00" + BANK_CODE + BRANCH_CODE
        + nationalCheckCode(accountNumber) + accountNumber);
}

function nationalCheckCode(accountNumber: string) {
    return weightedSum(BANK_CODE + BRANCH_CODE)
        + weightedSum(accountNumber);
}

function weightedSum(s: string): string {
    let accum = 0;
    const offset = WEIGHTS.length - s.length
    for (let i = 0; i < s.length; i++) {
        accum += Number(s[i]) * WEIGHTS[i + offset]
    }
    let mod = accum % WEIGHT_MOD;
    switch (mod) {
        case 0 | 1:
            break;
        default:
            mod = 11 - mod
    }
    return String(mod)
}

function insertCheckCode(iban: string): string {
    if (iban.length !== IBAN_LENGTH) {
        throw new Error("wrong iban length");
    }
    const initial = iban.slice(0, 2) + "00";
    const rest = iban.slice(4);
    const allNumbers = replaceLetters(rest + initial);
    const mod = longMod(allNumbers, 97);
    const checkCode = String(98 - mod).padStart(2, "0")
    return iban.slice(0, 2) + checkCode + iban.slice(4)
}

function longMod(s: string, a: number): number {
    let res = 0;
    for (let i = 0; i < s.length; i++)
        res = (res * 10 +
            parseInt(s[i])) % a;

    return res;
}

function replaceLetters(s: string): string {
    return s.split("").map(x => {
        const n = x.charCodeAt(0);
        if (n >= 65 && n < 91) {
            return String(n - 55);
        }
        return x;
    }).join("")
}