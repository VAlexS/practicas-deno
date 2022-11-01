import {
  Application,
  isHttpError,
  Router,
  Status,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

import { getUser } from "./resolvers/get.ts";
import { deleteUser } from "./resolvers/delete.ts";
import { addTransaction, addUser } from "./resolvers/post.ts";

const router = new Router();

router
  .get("/getUser/:parametro", getUser)
  .post("/addUser", addUser)
  .post("/addTransaction", addTransaction)
  .delete("/deleteUser/:email", deleteUser);

const app = new Application();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      switch (err.status) {
        case Status.InternalServerError:
          console.log(err.message);
          ctx.response.status = err.status;
          break;
        default:
          ctx.response.status = err.status;
          ctx.response.body = err.message;
      }
    } else {
      console.log(err);
      ctx.response.status = Status.InternalServerError;
    }
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 7777 });
