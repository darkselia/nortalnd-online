"use strict";
const POSTS = [
    { id: 'p1', title: 'Меню столовой — день 4',
        excerpt: 'Завтрак: каша пшённая с маслом, какао. Обед: уха, пюре с рыбой, компот…',
        author: 'Морозов Алексей', initials: 'М', color: 'var(--color-action)',
        day: '3 день · 02:58', hearts: 1, likes: 1, comments: 1, art: 'apple' },
    { id: 'p2', title: 'Должности в лагере',
        excerpt: 'Все участники делятся на категории и должности. Разбираемся, кто есть кто в Нортландии.',
        author: 'Дух Знаний', initials: 'З', color: 'var(--color-mastery)',
        day: '3 день · 05:07', hearts: 4, likes: 2, comments: 5, art: 'note' },
    { id: 'p3', title: 'Я бегаю по лесу',
        excerpt: 'Утренняя пробежка по северной тропе — лёд хрустит, духи прошлого где-то рядом…',
        author: 'Шварц Вадим', initials: 'В', color: 'var(--color-reputation)',
        day: '4 день · 15:20', hearts: 7, likes: 3, comments: 2, art: 'snow' },
];
function BlogScreen({ t }) {
    const [reacts, setReacts] = UI.useState(() => Object.fromEntries(POSTS.map((p) => [p.id, { heart: false, like: false, h: p.hearts, l: p.likes }])));
    const toggle = (id, kind) => setReacts((r) => {
        const cur = r[id];
        const on = kind === 'heart' ? !cur.heart : !cur.like;
        return { ...r, [id]: {
                ...cur, [kind]: on,
                [kind === 'heart' ? 'h' : 'l']: (kind === 'heart' ? cur.h : cur.l) + (on ? 1 : -1),
            } };
    });
    return (UI.element("div", { className: "nl-scroll" },
        UI.element("div", { style: { padding: 16 } },
            UI.element("button", { className: "nl-btn nl-btn--solid nl-btn--block", style: { marginBottom: 16 } },
                Icon.plus({ width: 18, height: 18 }),
                " Написать"),
            UI.element("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 } }, POSTS.map((p) => {
                const rc = reacts[p.id];
                return (UI.element("article", { key: p.id, className: "nl-card", style: { padding: 14 } },
                    UI.element("div", { style: { display: 'flex', gap: 12 } },
                        UI.element(ArtTile, { variant: p.art, tint: p.color, size: 52, radius: t.tileShape === 'circle' ? 999 : t.cardRadius - 2 }),
                        UI.element("div", { style: { flex: 1, minWidth: 0 } },
                            UI.element("h2", { style: { fontSize: 16, marginBottom: 4 } }, p.title),
                            UI.element("p", { style: { margin: 0, fontSize: 13.5, color: 'var(--color-text-soft)', lineHeight: 1.4 } }, p.excerpt))),
                    UI.element("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 } },
                        UI.element("span", { className: "nl-avatar", style: { background: p.color } }, p.initials),
                        UI.element("div", { style: { fontSize: 12.5, lineHeight: 1.2 } },
                            UI.element("b", null, p.author),
                            UI.element("br", null),
                            UI.element("span", { style: { color: 'var(--color-text-faint)' } }, p.day)),
                        UI.element("div", { style: { flex: 1 } }),
                        UI.element("button", { className: 'nl-react' + (rc.heart ? ' on' : ''), onClick: () => toggle(p.id, 'heart') },
                            "\u2764\uFE0F ",
                            rc.h),
                        UI.element("button", { className: 'nl-react' + (rc.like ? ' on' : ''), onClick: () => toggle(p.id, 'like') },
                            "\uD83D\uDC4D ",
                            rc.l),
                        UI.element("span", { className: "nl-react nl-react--mute" },
                            Icon.comment({ width: 15, height: 15 }),
                            " ",
                            p.comments))));
            })))));
}
Object.assign(window, { BlogScreen, POSTS });
