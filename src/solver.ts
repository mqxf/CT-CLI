import { v4 as uuid4 } from "uuid";

import { reveal, transaction, TransactionResponse, loadNugget, initialise, Nugget, pingQuestion, submitAnswer, QuestionGroup, closeNugget, pingContent, getSlide, doSlide, focus, blur, results } from "./network.js";
import { sleep } from "./utils.js";
import { loginSessionId, userId } from "./user.js";
import { env } from "./env.js";

export async function solveQuestion(questionId: string) {
    var transRes: TransactionResponse | null = null;
    for (let i = 0; i < 10; i++) {
        try {
            transRes = await transaction(questionId, uuid4());
            break;
        } catch (err: any) {
            if (err.status == 403) throw err;
            if (i == 9) throw err;
        }
    }
    let token = transRes!.accessTokens[0].token;
    let answer = await reveal(token);
    return answer;
}

export async function solveNextNugget(subjectIds: string[], baseTime: number, randomTime: number, percent: number, ignoreFirstThree: boolean) {
    console.log("Looking for next recommended nugget...");
    let nextNuggetLoader = await loadNugget(userId, subjectIds);
    console.log("Found next recommended nugget!");
    let nextNugget = await initialise(
        nextNuggetLoader.data.nuggetPath.nuggets[0].courses[0].studyGroupIds[0].studyGroupId,
        nextNuggetLoader.data.nuggetPath.nuggets[0].nugget.nuggetId
    );
    await solveNugget(nextNugget, baseTime, randomTime, percent, ignoreFirstThree);
}

var solving: boolean = false;
var questionGroupId: string = "";
var questionId: string = "";
var question: number = 0;
var group: QuestionGroup;
var questions: boolean = false;
var fragmentId: string = "";
var documentId: string = "";
var lastDocumentId: string = "";
var contentId: string = "";

export async function solveNugget(nugget: Nugget, baseTime: number, randomTime: number, percent: number, ignoreFirstThree: boolean) {
    console.log(`Doing nugget ${nugget.nugget.name}`);
    solving = true;
    question = 0;
    if (nugget.activity.questions != null) {
        question = nugget.activity.questions.length;
        if (nugget.activity.questions[question - 1]?.answers?.length == 0) {
            question--;
        }
    }

    //let fragment = nugget.nugget.content.find(q => q.type == "fragment");

    let started: boolean = false;
    /*
    if (fragment != null) {
        console.log("Found fragment!");
        fragmentId = fragment.id;
        let slideshow = fragment.items.find(q => q.fragmentType!.name == "Slideshow");
        if (slideshow != null) {
            console.log("Found slideshow!");
            contentId = slideshow._id;
            if (nugget.data.selectedItem.type == "document") {
                documentId = nugget.data.selectedItem.documentId!;
                pingLoop(nugget);
                started = true;
                await completeDocument(nugget);
            }
            else {
                pingLoop(nugget);
                started = true;
            }
            for (let i = 0; i < slideshow.documents!.length; i++) {
                documentId = slideshow.documents![i]._id;
                await completeDocument(nugget);
                console.log(`Completed slide ${i + 1}/${slideshow!.documents!.length}`);
            }
        }
    }
    */
    let assessment = nugget.nugget.content.find(q => q.type == "assessment")!;
    getQuestion(nugget, assessment);
    questions = true;
    if (!started) {
        pingLoop(nugget, baseTime, randomTime);
    }
    for (let i = question; i < assessment.items[0].questionGroups!.length; i++) {
        getQuestion(nugget, assessment);
        let answer = await solveQuestion(questionId);
        var answerStr: string = "";
        if ((ignoreFirstThree ? true : i > 2) && Math.ceil(Math.random() * 100.0) > percent) {
            await submitAnswer(
                loginSessionId, 
                "", 
                group.questions.find(q => q._id == questionId)!.answerGroups[0].id, 
                nugget.assessments[0]._id, 
                nugget.activity.studySession.courseId, 
                nugget.activity.studySession.studySessionId, 
                nugget.activity.studySession.strandId, 
                questionId, 
                questionGroupId, 
                nugget.nugget._id
            );
        }
        if (answer.answerType == "exact-answer") {
            answerStr = answer.answerGroups[0].answers![0].exactInput[0];
        }
        else if (answer.answerType == "multi-one-correct") {
            answerStr = answer.answerGroups[0].correctAnswerIds![0];
        }
        else if (answer.answerType == "exact-answer-equation") {
            answerStr = answer.answerGroups[0].answers![0].exactInput[0].replace("\\\\", "\\");
        }
        else {
            console.log(`UNKNOWN ANSWER TYPE: ${answer.answerType}! Halting! Please contact your administrator to fix this.`);
            console.log(answer.answerGroups[0].answers);
            process.exit();
        }
        await submitAnswer(
            loginSessionId, 
            answerStr, 
            group.questions.find(q => q._id == questionId)!.answerGroups[0].id, 
            nugget.assessments[0]._id, 
            nugget.activity.studySession.courseId, 
            nugget.activity.studySession.studySessionId, 
            nugget.activity.studySession.strandId, 
            questionId, 
            questionGroupId, 
            nugget.nugget._id
        );
        console.log(`Answered question ${question + 1}/${assessment.items[0].questionGroups!.length}`);
        question++;
    }
    solving = false;
    //await sleep(1000);
    await closeNugget(nugget.activity.studySession.studySessionId);
    let res = await results(nugget.activity.studySession.studySessionId);
    console.log(`Finished nugget ${nugget.nugget.name} with a score of ${res.activity.overallResult.percentScore / 100}%!`);
    lastDocumentId = "";
}

function getQuestion(nugget: Nugget, assessment: any) {
    questionGroupId = assessment.items[0].questionGroups![question]._id;
    group = nugget.assessments[0].questionGroups.find(q => q._id == questionGroupId)!;

    let randomQuestion = Math.floor(Math.random() * group.questions.length);
    questionId = group.questions[randomQuestion]._id;
}

async function pingLoop(nugget: Nugget, questionBase: number, questionRandom: number) {
    let contentBase: number = 10000;
    let contentRandom: number = 30000;

    while (solving) {
        if (questions) {
            pingQuestion(
                loginSessionId,
                nugget.assessments[0]._id,
                questionGroupId, 
                questionId,
                nugget.nugget._id,
                nugget.activity.studySession.strandId,
                nugget.activity.studySession.courseId,
                nugget.activity.studySession.studySessionId,
                (Math.random() * contentRandom) + contentBase
            );
        }
        else {
            pingContent(
                loginSessionId,
                nugget.nugget._id,
                nugget.activity.studySession.strandId,
                nugget.activity.studySession.courseId,
                nugget.activity.studySession.studySessionId,
                documentId,
                fragmentId,
                contentId,
                (Math.random() * questionRandom) + questionBase
            );
        }
        await sleep(200);
    }
}

async function completeDocument(nugget: Nugget) {
    if (lastDocumentId != "") {
        blur(
            loginSessionId,
            lastDocumentId,
            fragmentId,
            contentId,
            nugget.nugget._id,
            nugget.activity.studySession.strandId,
            nugget.course._id,
            nugget.activity.studySession.studySessionId,
            10000
        );
    }
    focus(
        loginSessionId,
        documentId,
        fragmentId,
        contentId,
        nugget.nugget._id,
        nugget.activity.studySession.strandId,
        nugget.course._id,
        nugget.activity.studySession.studySessionId,
        0
    );
    doSlide(
        nugget.studyGroup._id, 
        nugget.nugget._id, 
        nugget.nugget.name, 
        userId, loginSessionId, 
        nugget.activity.studySession.studySessionId,
        nugget.class._id,
        nugget.class.name,
        nugget.course._id,
        nugget.course.name,
        fragmentId,
        documentId
    );
    lastDocumentId = documentId;
    getSlide(documentId);
    await sleep(1000);
    blur(
        loginSessionId,
        lastDocumentId,
        fragmentId,
        contentId,
        nugget.nugget._id,
        nugget.activity.studySession.strandId,
        nugget.course._id,
        nugget.activity.studySession.studySessionId,
        10000
    );
    focus(
        loginSessionId,
        documentId,
        fragmentId,
        contentId,
        nugget.nugget._id,
        nugget.activity.studySession.strandId,
        nugget.course._id,
        nugget.activity.studySession.studySessionId,
        10000
    );
    await sleep(1000);
}
