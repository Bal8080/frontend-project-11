import onChange from "on-change";

const initialState = {
    feeds: {},
    posts: {},
    feedsOrder: [],
    form: {
        error: null,
        submitting: false,
        
    },
}

const createState = () => onChange(
    initialState,
    (path, value) => {
    console.log(`State changed: ${path} = ${value}`);
    },
    { isShallow: false },
);

export const state = createState();