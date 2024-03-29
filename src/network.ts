import fetch from "node-fetch"

import { env } from "./env.js"
import { token } from "./token.js"

export interface QuestionGroup {
    _id: string,
    questions: {
        _id: string,
        answerGroups: {
            answers: {
                content: {
                    id: string,
                    type: string,
                    data: {
                        format: string,
                        text: string
                    }
                }[]
            }[],
            id: string
        }[],
        content: {
            type: string,
            data: {
                format: string,
                text: string
            },
            id: string
        }[]
    }[]
}

export interface Nugget {
    nugget: {
        _id: string,
        organization: string,
        name: string,
        content: {
            id: string,
            type: string,
            items: {
                _id: string,
                name: string,
                fragmentType?: {
                    _id: string,
                    name: string
                },
                documents?: {
                    _id: string,
                    name: string
                }[],
                questionGroups?: {
                    _id: string,
                    parameters: {
                        answerType: AnswerType
                    }
                }[]
            }[]
        }[]
    },
    class: {
        _id: string,
        name: string
    },
    course: {
        _id: string,
        name: string
    }
    studyGroup: {
        _id: string
    },
    assessments: {
        _id: string,
        questionGroups: QuestionGroup[]
    }[],
    activity: {
        studySession: {
            organizationId: string,
            coursePlanId: string,
            studySessionId: string,
            courseId: string,
            strandId: string,
            subjectId: string,
            levelId: string
        },
        questions?: {
            questionId: string,
            answers: {}[]
        }[]
    },
    data: {
        selectedItem: {
            type: string,
            fragmentId?: string,
            contentId?: string,
            documentId?: string
        }
    }
}

export async function initialise(studyGroupId: string, nuggetId: string) {
    let res = await fetch("https://api.century.tech/alexandria/v1/study-session/initialise", {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "authorization": `Bearer ${token}`
        },
        "referrer": "https://app.century.tech/",
        "body": JSON.stringify({
            "studyGroupId": studyGroupId,
            "nuggetId": nuggetId,
            "isDiagnosticModeEnabled": true
        }),
        "method": "POST"
    });

    if (res.status >= 300) {
        throw res;
    }

    return await res.json() as Nugget;
}

export interface TransactionResponse {
    accessTokens: {
        token: string;
    }[]
}

export async function transaction(questionId: string, uuid: string) {
    let res = await fetch(`https://api.century.tech/currency/v1/users/${uuid}/currencies/da39481d-c338-4f57-b8cb-4509121a26cf/transactions`, {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "authorization": `Bearer ${token}`
        },
        "referrer": "https://app.century.tech/",
        "body": JSON.stringify({
            "transactionTargets": [{
                "targetId": questionId,
                "targetType": "question"
            }],
            "value": -1
        }),
        "method": "POST"
    });

    if (res.status >= 300) {
        throw res;
    }

    return await res.json() as TransactionResponse;
}

export enum AnswerType {
    EXACT_ANSWER = "exact-answer",
    MULTI_ONE_CORRECT = "multi-one-correct"
}

export interface RevealResponse {
    answerType: string,
    answerGroups: {
        correctAnswerIds?: string[],
        answers?: {
            id: string,
            exactInput: string[]
        }[]
    }[]
}

export async function reveal(revealToken: string) {
    let res = await fetch("https://api.century.tech/content/v2/questions/reveals", {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "authorization": revealToken,
            "If-None-Match": "W/\"fe-eE8YBY5Tlum9VF3FhOvHMPACenY\""
        },
        "referrer": "https://app.century.tech/",
        "method": "GET"
    });

    if (res.status >= 300) {
        throw res;
    }

    return await res.json() as RevealResponse;
}

export interface TokenResponse {
    accessToken: string,
    refreshToken: string,
    tokenType: string
}

export async function getToken(username: string, password: string) {
    let res = await fetch("https://api.century.tech/auth/v1/tokens", {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site"
        },
        "referrer": "https://app.century.tech/",
        "body": JSON.stringify({
            "grant_type": "password",
            "password": password,
            "username": username
        }),
        "method": "POST"
    });

    return await res.json() as TokenResponse;
}

export async function refreshToken(refreshToken: string) {
    let res = await fetch("https://api.century.tech/auth/v1/tokens", {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site"
        },
        "referrer": "https://app.century.tech/",
        "body": JSON.stringify({
            "grant_type": "refresh_token",
            "refresh_token": refreshToken
        }),
        "method": "POST"
    });

    return await res.json() as TokenResponse;
}

export interface SubjectsResponse {
    data: {
        userSubjects: {
            subjects: {
                labelId: string
                name: string
                parentId: string
                __typename: string
            }[],
            subjectGroups: {
                labelId: string
                name: string
                __typename: string
            }[],
            __typename: string
        }
    }
}

export async function subjects(userId: string) {
    let res = await fetch("https://api.century.tech/roentgen/graphql", {
        "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:104.0) Gecko/20100101 Firefox/104.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "authorization": `Bearer ${token}`
        },
        "referrer": "https://app.century.tech/",
        "body": JSON.stringify({
            "operationName": "userSubjects",
            "variables": {
                "input": {
                    "userId": userId,
                    "courseTypes": [
                        "standard"
                    ]
                }
            },
            "query": "query userSubjects($input: UserSubjectsInput!) {\n  userSubjects(input: $input) {\n    subjects {\n      labelId\n      name\n      parentId\n      __typename\n    }\n    subjectGroups {\n      labelId\n      name\n      __typename\n    }\n    __typename\n  }\n}\n"
        }),
        "method": "POST",
    });


    return await res.json() as SubjectsResponse;
}

export interface NuggetLoadResponse {
    data: {
        nuggetPath: {
            count: number,
            nuggets: {
                nugget: {
                    name: string,
                    nuggetId: string
                },
                courses: {
                    strands: {
                        name: string,
                        strandId: string
                    }[],
                    studyGroupIds: {
                        studyGroupId: string
                    }[]
                }[],
                subject: {
                    name: string
                },
                level: {
                    name: string
                }
            }[]
        }
    }
}

export async function loadNugget(userId: string, subjectIds: string[]) {
    let res = await fetch("https://api.century.tech/roentgen/graphql", {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "authorization": `Bearer ${token}`
        },
        "referrer": "https://app.century.tech/",
        "body": JSON.stringify({
            "operationName": "nuggetPath",
            "variables": {
                "input": {
                    "userId": userId,
                    "subjectIds": subjectIds,
                    "mode": "default", "studyGroupStatus":
                        "current",
                    "courseTypes": [
                        "standard"
                    ],
                    "offset": 0,
                    "limit": 1
                }
            },
            "query": "query nuggetPath($input: NuggetPathInput!) {\n  nuggetPath(input: $input) {\n    count\n    nuggets {\n      nugget {\n        name\n        nuggetId\n        __typename\n      }\n      lastResult {\n        percentComplete\n        percentScore\n        __typename\n      }\n      bestResult {\n        percentComplete\n        percentScore\n        __typename\n      }\n      activity {\n        bestAttempt {\n          percentScore\n          __typename\n        }\n        lastAttempt {\n          percentScore\n          percentComplete\n          __typename\n        }\n        totalAttempts\n        __typename\n      }\n      courses {\n        courseId\n        icon {\n          iconCode\n          name\n          url\n          __typename\n        }\n        name\n        strands {\n          name\n          strandId\n          __typename\n        }\n        studyGroupIds {\n          studyGroupId\n          __typename\n        }\n        subject {\n          name\n          __typename\n        }\n        level {\n          name\n          __typename\n        }\n        __typename\n      }\n      orderingFactorMainContributor {\n        orderingFactorOriginalType\n        orderingFactorType\n        __typename\n      }\n      __typename\n    }\n    userId\n    __typename\n  }\n}\n"
        }),
        "method": "POST"
    });

    return await res.json() as NuggetLoadResponse;
}

export async function pingQuestion(loginSessionId: string, assessmentId: string, questionGroupId: string, questionId: string, nuggetId: string, strandId: string, courseId: string, studySessionId: string, time: number) {
    let res = await fetch("https://api.century.tech/pong/v1/pings", {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "Authorization": `Bearer ${token}`
        },
        "referrer": "https://app.century.tech/",
        "body": JSON.stringify({
            "pingInterval": time,
            "msSinceLastPing": time,
            "loginSessionId": loginSessionId,
            "assessmentId": assessmentId,
            "questionGroupId": questionGroupId,
            "questionId": questionId,
            "nuggetId": nuggetId,
            "strandId": strandId,
            "courseId": courseId,
            "studySessionId": studySessionId
        }),
        "method": "POST"
    });
    //await res.json();
}

export async function pingContent(loginSessionId: string, nuggetId: string, strandId: string, courseId: string, studySessionId: string, documentId: string, fragmentId: string, contentId: string, time: number) {
    let res = await fetch("https://api.century.tech/pong/v1/pings", {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "Authorization": `Bearer ${token}`
        },
        "referrer": "https://app.century.tech/",
        "body": JSON.stringify({
            "pingInterval": time,
            "msSinceLastPing": time,
            "loginSessionId": loginSessionId,
            "documentId": documentId,
            "fragmentId": fragmentId,
            "contentId": contentId,
            "completion": 10000,
            "nuggetId": nuggetId,
            "strandId": strandId,
            "courseId": courseId,
            "studySessionId": studySessionId
        }),
        "method": "POST"
    });
    //await res.json();
}

export async function submitAnswer(loginSessionId: string, answer: string, answerGroupId: string, assessmentId: string, courseId: string, studySessionId: string, strandId: string, questionId: string, questionGroupId: string, nuggetId: string) {
    let res = await fetch("https://api.century.tech/alexandria/v1/study-session/question-answered", {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "authorization": `Bearer ${token}`
        },
        "referrer": "https://app.century.tech/",
        "body": JSON.stringify({
            "action": "answer",
            "answerId": answer,
            "answerGroupId": answerGroupId,
            "answers": [answer],
            "assessmentId": assessmentId,
            "courseId": courseId,
            "locale": "en-GB",
            "loginSessionId": loginSessionId,
            "nuggetId": nuggetId,
            "questionGroupId": questionGroupId,
            "questionId": questionId,
            "strandId": strandId,
            "studySessionId": studySessionId
        }),
        "method": "POST"
    });
    //await res.json();
}

export async function closeNugget(studySessionId: string) {
    let res = await fetch(`https://api.century.tech/alexandria/v1/study-session/${studySessionId}/closed`, {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "authorization": `Bearer ${token}`
        },
        "referrer": "https://app.century.tech/",
        "body": "{\"isClosed\":true}",
        "method": "PUT",
    });
    //await res.json();
}

export async function getSlide(contentId: string) {
    let res = await fetch(`https://api.century.tech/content/v2/documents/${contentId}?convert=true&populateMedia=true`, {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "authorization": `Bearer ${token}`,
            "If-None-Match": "W/\"577-FbLVkgDXMFFsjrO102P/6jMuGjU\""
        },
        "referrer": "https://app.century.tech/",
        "method": "GET"
    });
    //await res.json();
}

export async function focus(loginSessionId: string, documentId: string, fragmentId: string, contentId: string, nuggetId: string, strandId: string, courseId: string, studySessionId: string, completion: number) {
    let res = await fetch("https://api.century.tech/pong/v1/pings/focus", {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "Authorization": `Bearer ${token}`,
        },
        "referrer": "https://app.century.tech/",
        "body": JSON.stringify({
            "pingInterval": 2000,
            "msSinceLastPing": 0,
            "loginSessionId": loginSessionId,
            "documentId": documentId,
            "fragmentId": fragmentId,
            "contentId": contentId,
            "completion": completion,
            "nuggetId": nuggetId,
            "strandId": strandId,
            "courseId": courseId,
            "studySessionId": studySessionId
        }),
        "method": "POST"
    });

    //await res.json();
}

export async function blur(loginSessionId: string, documentId: string, fragmentId: string, contentId: string, nuggetId: string, strandId: string, courseId: string, studySessionId: string, completion: number) {
    await fetch("https://api.century.tech/pong/v1/pings/blur", {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "Authorization": `Bearer ${token}`
        },
        "referrer": "https://app.century.tech/",
        "body": JSON.stringify({
            "pingInterval": 2000,
            "msSinceLastPing": 0,
            "loginSessionId": loginSessionId,
            "documentId": documentId,
            "fragmentId": fragmentId,
            "contentId": contentId,
            "completion": completion,
            "nuggetId": nuggetId,
            "strandId": strandId,
            "courseId": courseId,
            "studySessionId": studySessionId
        }),
        "method": "POST",
    });

    //await res.json();
}

export async function doSlide(studyGroupId: string, nuggetId: string, nuggetName: string, userId: string, loginSessionId: string, studySessionId: string, classId: string, className: string, courseId: string, courseName: string, fragmentId: string, documentId: string) {

    let data: string = btoa(unescape(encodeURIComponent(JSON.stringify({
        "event": "Document Viewed",
        "properties": {
            "$os": "Linux",
            "$browser": "Firefox",
            "$current_url": `https://app.century.tech/learn/my-courses/study-groups/${studyGroupId}/nuggets/${nuggetId}`,
            "$browser_version": 104,
            "$screen_height": 1080,
            "$screen_width": 1920,
            "mp_lib": "web",
            "$lib_version": "2.34.0",
            "$insert_id": "uxs6tr46lwbo67wf",
            "time": new Date().getTime() / 1000,
            "distinct_id": userId,
            "$device_id": env.deviceId,
            "$initial_referrer": "$direct",
            "$initial_referring_domain": "$direct",
            "Is Test": false,
            "Library": "React",
            "Locale": "en-GB",
            "Login Session Id": loginSessionId,
            "Organisation Id": env.organization.id,
            "Organisation Name": env.organization.name,
            "User Id": userId,
            "Study Session Id": studySessionId,
            "Class Id": classId,
            "Class Name": className,
            "Course Id": courseId,
            "Course Name": courseName,
            "Nugget Id": nuggetId,
            "Nugget Name": nuggetName,
            "Fragment Id": fragmentId,
            "Fragment Type": "Slideshow",
            "Document Id": documentId,
            "Document Type": "Slideshow",
            "Screen Filter": "none",
            "token": "2ad81efc7b9ccf1a5bf930fbe666b9fd"
        }
    }))));

    let res = await fetch(`https://api.century.tech/insights/api/v1/proxy/event/track/?data=${encodeURIComponent(data)}&ip=0&_=1661627082188`, {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "Authorization": "Bearer [object Object]"
        },
        "referrer": "https://app.century.tech/",
        "method": "GET"
    });
    //await res.json();
}

export interface NuggetResults {
    activity: {
        overallResult: {
            percentScore: number,
            percentComplete: number
        }
    }
}

export async function results(studySessionId: string) {
    let res = await fetch(`https://api.century.tech/alexandria/v1/study-session/${studySessionId}/results`, {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "authorization": `Bearer ${token}`
        },
        "referrer": "https://app.century.tech/",
        "method": "GET",
    });

    return await res.json() as NuggetResults;
}

export interface DisplayNuggetResult {
    id: string
    course: string
    courseId: string
    courseLevel: string
    name: string
    iconCode: string
    bestResult: number
    lastResult: number
    strand: string
    subject: string
    studyGroup: string
    isDiagnosticAssessment: boolean
}

export async function getNuggets(subjectId: string) {
    let res = await fetch(`https://api.century.tech/learnapi/nuggets?includeIds=${subjectId}&limit=1000&mode=linear`, {
        "headers": {
            "User-Agent": env.userAgent,
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "authorization": `Bearer ${token}`,
            "If-None-Match": "W/\"df16-zEjnHXsHmJkyBkHbKc0g5wdJsKk\""
        },
        "referrer": "https://app.century.tech/",
        "method": "GET",
    });

    return await res.json() as DisplayNuggetResult[];
}