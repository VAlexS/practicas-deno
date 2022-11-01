import {Database, MongoClient,} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import {TransactionSchema, UserSchema} from "./schemas.ts";
import {config} from "https://deno.land/x/dotenv@v3.2.0/mod.ts";

const connectMongoDB = async (): Promise<Database> => {
  const env = config();

  if (!env.MONGO_USR || !env.MONGO_PWD) {
    throw new Error("MONGO_USR and MONGO_PWD must be set in .env file");
  }

  env.MONGO_USR;
  env.MONGO_PWD;
  const db_Name = "Bank";
  const mongo_url = `mongodb+srv://${env.MONGO_USR}:${env.MONGO_PWD}@clusternebrija.vyhuszz.mongodb.net/${db_Name}?authMechanism=SCRAM-SHA-1`;

  const client = new MongoClient();
  try {
    await client.connect(mongo_url);
    console.log("Connected to database");
  } catch (e) {
    console.log("Error connecting to MongoDB: ", e);
  }

  return client.database(db_Name);
};

const db = await connectMongoDB();

export const UsersCollection = db.collection<UserSchema>("Users");

export const TransactionsCollection =
  db.collection<TransactionSchema>("Transactions");
