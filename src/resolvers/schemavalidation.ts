import {Context} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {TypeofVariants} from "../model/types.ts";

export function assertExists(ctx: Context, key: string, body: Record<string, any>) {
    ctx.assert(body[key], 400, `${key} missing from body`)
}

export function assertType(
    ctx: Context, key: string, typ: TypeofVariants, body: Record<string, any>,
) {
    ctx.assert(typeof body[key] === typ, 400, `${key} is not a ${typ}`)
}

export function assertTypeAndExistence(
    ctx: Context, key: string, typ: TypeofVariants, body: Record<string, any>,
) {
    assertExists(ctx, key, body)
    assertType(ctx, key, typ, body)
}
