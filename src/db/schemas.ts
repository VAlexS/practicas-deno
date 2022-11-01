import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { User, Transaction } from "../model/types.ts";

export type UserSchema = Omit<User, "id"> & { _id: ObjectId };
export type TransactionSchema = Transaction & {
  _id: ObjectId;
};
