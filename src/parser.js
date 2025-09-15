export const parseRSS = (xmlString) => {
    console.log('PARSE!!!');
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');

    console.log(`DOC!!!\n::${doc}`);
    
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
        throw new Error('Invalid RSS');
    }

    const feedTitle = doc.querySelector('channel > title')?.textContent ?? 'Без названия';
    const feedDescription = doc.querySelector('channel > description')?.textContent ?? '';

    const items = Array.from(doc.querySelectorAll('item'));

    const posts = items.map((item) => {
        const title = item.querySelector('title')?.textContent ?? 'Без названия';
        const link = item.querySelector('link')?.textContent ?? '#';
        const published = item.querySelector('pubDate')?.textContent ?? '';
        const guid = item.querySelector('guid')?.textContent ?? link;

        return {
            id: guid,
            title,
            link,
            published,
        };
    });

    return {
        feed: {
            id: doc.querySelector('channel > link')?.textContent ?? 'unknown',
            title: feedTitle,
            description: feedDescription,
        },
        posts,
    };
};