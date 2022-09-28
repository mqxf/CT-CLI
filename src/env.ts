export const env: Env = {
    userAgent: "Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0",
    organization: {
        id: "03e0f9ec-b697-4a59-b916-278cb65677c1",
        name: "The British International School of Marbella"
    },
    deviceId: "182c6d220faa38-056e3c291e3146-47320622-1fa400-182c6d220fbda7",
    classes: {
        math: "d2fb0442-7ad3-4ac8-9b08-86bd3efa5aab",
        chemistry: "7388e4ff-ae52-4c9b-9033-8cbfcbe54534",
        englishLang: "669c155b-b035-40e5-a977-f6caca567269",
        physics: "846d318d-e6a2-4999-925d-a80ee3504955",
        englishSpag: "ddc49f12-4a54-4d93-a0ea-ebc2b29ccef9",
        biology: "b3c8f614-d24f-4ea4-82eb-381dcc83fa32",
        science: "aa6d8342-9ec3-45f4-8cdf-401e5973d0fa"
    },
    you: {
        username: "your.name@bsm.org.es",
        password: "password",
        base: 8000,
        extra: 12000,
        percent: 100
    }
};

export interface User {
    username: string
    password: string
    base: number
    extra: number
    percent: number
}

export interface Env {
    userAgent: string
    organization: {
        id: string
        name: string
    }
    deviceId: string
    classes: {
        math: string
        chemistry: string
        englishLang: string
        physics: string
        englishSpag: string
        biology: string
        science: string
    }
    you: User
}
