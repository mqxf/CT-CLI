import { getToken, refreshToken } from "./network.js"
import { userInit } from "./user.js";
import { sleep } from "./utils.js"

export var token: string = "";
var rTok: string = "";

export async function initToken(username: string, password: string) {
    let res = await getToken(username, password);
    token = res.accessToken;
    rTok = res.refreshToken;
    refreshLoop();
}

export async function initTokenRefresh(refresh: string) {
    let res = await refreshToken(refresh);
    token = res.accessToken;
    rTok = res.refreshToken;
    refreshLoop();
}


async function refreshLoop() {
    await sleep(540000);
    let res = await refreshToken(rTok);
    token = res.accessToken;
    rTok = res.refreshToken;
    userInit();
    refreshLoop();
}