import jwt from "jsonwebtoken";

import { token } from "./token.js";

export var userId: string = "";
export var loginSessionId: string = "";

export function userInit() {
    let user = jwt.decode(token) as jwt.JwtPayload;
    userId = user.sub!;
    loginSessionId = user.context.loginSessionId;
}