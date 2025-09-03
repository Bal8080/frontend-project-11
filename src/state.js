import onChange from "on-change";

const initialState = {
    feeds: [],
    form: {
        error: null,
        submitting: false,
        
    },
}

const createState = () => onChange(initialState, (path, value, oldValue) => {
    console.log(`State changed: ${path} = ${value}`);
});

export const state = createState();