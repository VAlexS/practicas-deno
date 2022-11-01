import {RouterContext, Status} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {UsersCollection} from "../db/mongo.ts";
import {
    validateDNI,
    validateEmail,
    validateID,
    validatePhone,
} from "../model/validation.ts";
import {UserSchema} from "../db/schemas.ts";

type GetUserContext = RouterContext<
    "/getUser/:parametro",
    {parametro: string},
    Record<string, any>
>;

/*getUser/parametro -> devolverá el usuario que se le pase por parámetros. Para
encontrar ese usuario se podrá usar cualquier campo único*/
export const getUser = async (context: GetUserContext) => {
    const param = context.params.parametro;

    const clauses = [
        clause("dni", param, validateDNI),
        clause("phone", param, validatePhone),
        clause("email", param, validateEmail),
        clause("_id", param, validateID),
    ].filter(x => x !== undefined) as Record<string, any>[];

    if (clauses.length === 0) {
        context.throw(
            Status.BadRequest,
            "param doesn't match any search field format",
        )
    }

    let user: UserSchema | undefined
    try {
        user = await UsersCollection.findOne({
            $or: clauses,
        });
    } catch (e) {
        context.throw(Status.InternalServerError, e.message)
    }

    if (user === undefined) {
        context.throw(Status.NotFound)
    }

    context.response.body = user;
};

function clause(key: string, value: any, validation: (v: any) => any) {
    try {
        return {key: validation(value)}
    } catch {
        return undefined
    }
}