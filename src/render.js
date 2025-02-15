export default (state) => {
    const res = document.querySelector('.section-results');
    res.textContent = '';

    state.urls.map((url) => {
        const p = document.createElement('p');
        p.textContent = url;
        res.appendChild(p);
    })
}

