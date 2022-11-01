import {RouterContext, Status} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {UsersCollection} from "../db/mongo.ts";
import {validateEmail} from "../model/validation.ts";
import {UserSchema} from "../db/schemas.ts";

type DeleteUserContext = RouterContext<
    "/deleteUser/:email",
    {email: string},
    Record<string, any>
>;

// deleteUser/email -> Eliminará un usuario de la base de datos del banco por su
// email.
export const deleteUser = async (ctx: DeleteUserContext) => {
    let email = ctx.params.email;

    try {
        email = validateEmail(email);
    } catch (err) {
        ctx.throw(Status.BadRequest, err.message)
    }

    let user: UserSchema | undefined;
    try {
        user = await UsersCollection.findOne({email: email});
    } catch (err) {
        ctx.throw(Status.InternalServerError, err.message)
    }

    if (user === undefined) {
        ctx.throw(Status.NotFound, "no user with such email")
    }

    try {
        await UsersCollection.deleteOne({email: email});
    } catch (e) {
        ctx.throw(Status.InternalServerError, e.message)
    }

    ctx.response.status = Status.OK
};
