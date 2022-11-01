import {ObjectId} from "https://deno.land/x/mongo@v0.31.1/mod.ts";

const VALID_CONTROL_CHARS = "TRWAGMYFPDXBNJZSQVHLCKE";
const VALID_DNI_LENGTH = 9;

export function validateDNI(dni: string): string {
    dni = cleanDNI(dni)

    if (dni.length != VALID_DNI_LENGTH) {
        throw new Error(`Incorrect dni length: ${dni.length}`)
    }

    const validNat = validateNatural(dni.slice(0,-1));

    const nControlChar = validNat % 23;
    if (nControlChar < 0 || nControlChar > VALID_CONTROL_CHARS.length) {
        throw new Error(`invalid control character for dni: ${dni}`)
    }

    const validControlChar = VALID_CONTROL_CHARS[nControlChar]
    if (dni.slice(-1) !== validControlChar) {
        throw new Error(`invalid control character for dni: ${dni}`);
    }

    return dni;
}

export function validateEmail(email: string): string {
    email = cleanEmail(email);

    if (email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ) === null) {
        throw new Error("invalid email")
    }

    return email;
}

export function validateID(id: string): ObjectId {
    return new ObjectId(cleanID(id));
}

export function validatePhone(phone: string): string {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    phone = cleanPhone(phone);

    if (phone.match(re) === null) {
        throw new Error("invalid phone number format");
    }

    return phone;
}

export function alwaysValid<T>(val: T): T {
    return val;
}

export function cleanName(name: string): string {
    return name.trim();
}

export function cleanSurnames(surnames: string): string {
    return surnames.trim();
}

export function cleanID(id: string): string {
    return id.trim();
}

export function validateNatural(s: string | number): number {
    const n = validatePositiveNumber(s);

    if (!Number.isInteger(n)) {
        throw new Error("not an integer");
    }

    return n;
}

export function validatePositiveNumber(s: string | number): number {
    let n: number;
    if (typeof s === "string") {
        n = Number(s.trim());
    } else {
        n = s;
    }

    if (isNaN(n)) {
        throw new Error("not a valid number");
    }

    if (n < 0) {
        throw new Error("negative number");
    }

    return n;
}

function cleanEmail(email: string): string {
    return email.trim().toLowerCase();
}

function cleanDNI(dni : string): string {
    return dni.trim().toUpperCase();
}

function cleanPhone(phone: string): string {
    return phone.trim();
}

