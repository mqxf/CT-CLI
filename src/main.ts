import readline from "readline";
import fs from "fs";

import { env, User } from "./env.js";
import { initToken, initTokenRefresh } from "./token.js";
import { solveNextNugget, solveNugget } from "./solver.js";
import { userInit } from "./user.js";
import { initialise } from "./network.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = (query: any) => new Promise<string>((resolve) => rl.question(query, resolve));

(async () => {
    let user: User = env.max;
    await initToken(user.username, user.password);
    //await initTokenRefresh(env.refreshToken);
    userInit();

    let a = await prompt("Enter 1 to do your path nuggets, or enter 2 to do a specific nugget, or 3 to do a course: ");

    if (a == "1") {
        while (true) {
            await solveNextNugget([
                env.classes.science,
                env.classes.chemistry,
                env.classes.physics,
                env.classes.biology,
                env.classes.math,
                env.classes.englishSpag,
                env.classes.englishLang
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
    else if (a == "3") {
        const redo = false;
        const files = ["biology", "chemistry", "physics", "science", "englishLang", "englishLangB", "englishSpagG", "englishSpagS", "mathA", "mathFE", "mathH"];
        console.log(files);
        let selection = await prompt("Choose a subject (number from 0): ");
        let subject = files[parseInt(selection)];

        let filter = await prompt("Filter nugget name? (Type the keyword(s) to look for or type 'none' for no filter): ");

        let rawdata = fs.readFileSync(`/home/max/Desktop/Coding/Node/Century\ Tech\ Solver\ CLI/nuggets/${subject}.json`);
        let nuggets = JSON.parse(rawdata.toString()) as CourseNugget[];

        for (let nugget of nuggets) {
            if (nugget.lastResult != null && nugget.lastResult == 100 && !redo) continue;

            if (filter == "none" || nugget.name.toLowerCase().includes(filter.toLowerCase())) {
                await solveNugget(await initialise(nugget.studyGroup, nugget.id), user.base, user.extra, user.percent, false);
            }
        }
    }

})()

interface CourseNugget {
    id: string,
    course: string,
    courseId: string,
    courseLevel: string,
    coursePlanId: string,
    iconCode: string,
    name: string,
    bestResult: number,
    lastResult: number,
    lastCompletion: number,
    lastCompletionDate: string,
    subject: string,
    strand: string,
    studyGroup: string,
    originalType: string,
    type: string,
    activity: {
        lastCompletionDate: string,
        lastCompletion: number,
        lastScore: number,
        bestScore: number
    },
    isDiagnosticAssessment: boolean
}