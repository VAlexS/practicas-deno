import {
  Context,
  RouteParams,
  RouterContext,
  State,
  Status,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { TransactionsCollection, UsersCollection } from "../db/mongo.ts";
import { makeTransaction, User } from "../model/types.ts";
import {
  alwaysValid,
  cleanName,
  cleanSurnames,
  validateDNI,
  validateEmail,
  validateID,
  validatePhone,
  validatePositiveNumber,
} from "../model/validation.ts";
import { assertTypeAndExistence } from "./schemavalidation.ts";
import { TransactionSchema, UserSchema } from "../db/schemas.ts";
import { generate } from "../model/iban.ts";

type AddTransactionBody = {
  id_sender: string;
  id_receiver: string;
  amount: number;
};

type AddUserBody = {
  dni: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
};

type NewTransaction = {
  amount: number;
  sender: UserSchema;
  receiver: UserSchema;
};

type AddTransactionContext = RouterContext<
  "/addTransaction",
  Record<string, undefined>,
  Record<string, any>
>;

type AddUserContext = RouterContext<
  "/addUser",
  Record<string, undefined>,
  Record<string, any>
>;

/*addTransaction -> Añadirá una transacción a un usuario.*/
export const addTransaction = async (ctx: AddTransactionContext) => {
  // Get body.
  let addTransactionBody: AddTransactionBody | undefined;
  try {
    const body = await ctx.request.body({ type: "json" });
    addTransactionBody = await body.value;
  } catch (e) {
    ctx.throw(Status.InternalServerError, e.message);
  }

  // Validación.
  const { amount, sender, receiver } = await getNewTransaction(
    ctx,
    addTransactionBody!
  );

  // Procesamos la transacción.
  let transaction;
  try {
    transaction = makeTransaction(sender, receiver, amount);
  } catch (e) {
    ctx.throw(Status.BadRequest, e.message);
  }

  // Insertamos la transacción y actualizamos a los usuarios.
  try {
    await Promise.all([
      TransactionsCollection.insertOne(transaction),
      UsersCollection.updateOne(
        { _id: sender._id },
        { $set: { balance: sender.balance } }
      ),
      UsersCollection.updateOne(
        { _id: receiver._id },
        { $set: { balance: receiver.balance } }
      ),
    ]);
  } catch (e) {
    ctx.throw(Status.InternalServerError, e.message);
  }

  ctx.response.body = transaction as TransactionSchema;
};

// addUser -> Añadirá un usuario a la base de datos del banco comprobando todos
// sus datos.
export const addUser = async (ctx: AddUserContext) => {
  // Get body.
  let addUserBody: AddUserBody | undefined;
  try {
    const body = await ctx.request.body({ type: "json" });
    addUserBody = await body.value;
  } catch (e) {
    ctx.throw(Status.InternalServerError, e.message);
  }

  // Validación.
  const user = await getNewUser(ctx, addUserBody!);

  // Insertamos el nuevo usuario.
  try {
    const insertID = await UsersCollection.insertOne(user);
    user.id = insertID.toString();
  } catch (e) {
    ctx.throw(Status.InternalServerError, e.message);
  }

  ctx.response.body = user;
};

async function getNewTransaction(
  ctx: Context,
  addTransactionBody: AddTransactionBody
): Promise<NewTransaction> {
  assertTypeAndExistence(ctx, "id_sender", "string", addTransactionBody!);
  assertTypeAndExistence(ctx, "id_receiver", "string", addTransactionBody!);
  assertTypeAndExistence(ctx, "amount", "number", addTransactionBody!);

  const id_sender = validateID(addTransactionBody.id_sender);
  const id_receiver = validateID(addTransactionBody.id_receiver);
  const amount = validatePositiveNumber(addTransactionBody.amount);

  let sender, receiver;
  try {
    [sender, receiver] = await Promise.all([
      UsersCollection.findOne({ _id: id_sender }),
      UsersCollection.findOne({ _id: id_receiver }),
    ]);
  } catch (e) {
    ctx.throw(Status.InternalServerError, e.message);
  }

  if (sender === undefined) {
    ctx.throw(Status.NotFound, "no user with id_sender");
  }
  if (receiver === undefined) {
    ctx.throw(Status.NotFound, "no user with id_receiver");
  }

  return {
    receiver: receiver,
    sender: sender,
    amount: amount,
  };
}

async function getNewUser(
  ctx: Context,
  addUserBody: AddUserBody
): Promise<User> {
  assertTypeAndExistence(ctx, "dni", "string", addUserBody);
  assertTypeAndExistence(ctx, "name", "string", addUserBody);
  assertTypeAndExistence(ctx, "surname", "string", addUserBody);
  assertTypeAndExistence(ctx, "phone", "string", addUserBody);
  assertTypeAndExistence(ctx, "email", "string", addUserBody);

  let user;
  try {
    user = {
      id: "",
      dni: validateDNI(addUserBody.dni),
      name: alwaysValid(cleanName(addUserBody.name)),
      surname: alwaysValid(cleanSurnames(addUserBody.surname)),
      phone: validatePhone(addUserBody.phone),
      email: validateEmail(addUserBody.email),
      // IBAN generado aleatoriamente.
      iban: generate(),
      // Insertamos con 1000 para poder probar transacciones.
      balance: 1000,
    };
  } catch (e) {
    ctx.throw(Status.BadRequest, e.message);
  }

  // Comprobar si el usuario existe.
  let duplicateCount = 0;
  try {
    duplicateCount = await UsersCollection.countDocuments({
      $or: [{ email: user.email }, { dni: user.dni }, { phone: user.phone }],
    });
  } catch (e) {
    ctx.throw(Status.InternalServerError, e.message);
  }

  if (duplicateCount > 0) {
    ctx.throw(
      Status.BadRequest,
      "user already exists with some or all of the same details"
    );
  }

  return user;
}
