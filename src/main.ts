import readline from "readline";

import { env, User } from "./env.js";
import { initToken, initTokenRefresh } from "./token.js";
import { solveNextNugget, solveNugget } from "./solver.js";
import { userInit } from "./user.js";
import { initialise } from "./network.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = (query: any) => new Promise<string>((resolve) => rl.question(query, resolve));

(async () => {
    let user: User = env.elijah;
    await initToken(user.username, user.password);
    //await initTokenRefresh(env.refreshToken);
    userInit();

    let a = await prompt("Enter 1 to do your path nuggets, or enter 2 to do a specific nugget: ");

    if (a == "1") {
        while (true) {
            await solveNextNugget([
                env.classes.chemistry
            ], user.base, user.extra, user.percent, false);
            //let e = await prompt("Press enter to do the next nugget, or press e to exit.");
            //if (e == "e") process.exit();
        }
    }
    else if (a == "2") {
        while (true) {
            let nuggetId = await prompt("Please enter nugget ID (contact Max if you are unaware how to get it): ");
            let studyId = await prompt("Please enter study session ID (contact Max if you are unaware how to get it): ");

            let nextNugget = await initialise(studyId, nuggetId);
            await solveNugget(nextNugget, user.base, user.extra, user.percent, false);

            let e = await prompt("Press enter to do another, or press e to exit.");
            if (e == "e") process.exit();
        }
    }

})()
