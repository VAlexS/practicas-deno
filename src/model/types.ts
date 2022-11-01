import {UserSchema} from "../db/schemas.ts";
import {
    ObjectId
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";

export type TypeofVariants =
    "string"
    | "number"
    | "boolean"
    | "undefined"
    | "object"
    | "function"

export type User = {
    id: string;
    dni: string;
    name: string;
    surname: string;
    phone: string;
    email: string;
    iban: string;
    balance: number;
};

export type Transaction = {
    id_sender: ObjectId;
    id_receiver: ObjectId;
    amount: number;
};

export function makeTransaction(
    sender: UserSchema,
    receiver: UserSchema,
    amount: number,
): Transaction {
    if (amount > sender.balance) {
        throw new Error("insufficient funds for transaction")
    }

    sender.balance -= amount
    receiver.balance += amount

    return {
        id_sender: sender._id,
        id_receiver: receiver._id,
        amount: amount
    }
}

