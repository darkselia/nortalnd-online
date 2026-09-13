"use strict";
const { useState: useDS } = UI;
const NAV_GENERAL = [
    { key: 'home', label: 'Главная', icon: 'home' },
    { key: 'task', label: 'Задания', icon: 'tasks' },
    { key: 'rating', label: 'Рейтинг', icon: 'people' },
    { key: 'prizes', label: 'Призы', icon: 'flag' },
    { key: 'blog', label: 'Блог', icon: 'blog' },
    { key: 'settings', label: 'Настройки', icon: 'cog' },
    { key: 'logout', label: 'Выйти', icon: 'logout' },
];
const NAV_MANAGE = [
    { key: 'give', label: 'Выдача призов', icon: 'flag' },
];
const Dk = {
    home: (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...p },
        UI.element("path", { d: "M4 11l8-7 8 7" }),
        UI.element("path", { d: "M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" }))),
    cog: (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...p },
        UI.element("circle", { cx: "12", cy: "12", r: "3" }),
        UI.element("path", { d: "M12 3v2.5M12 18.5V21M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M3 12h2.5M18.5 12H21M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8" }))),
    logout: (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...p },
        UI.element("path", { d: "M14 4H7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7" }),
        UI.element("path", { d: "M16 12H10M16 12l-3-3M16 12l-3 3" }))),
    search: (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", ...p },
        UI.element("circle", { cx: "11", cy: "11", r: "7" }),
        UI.element("path", { d: "M20 20l-3.5-3.5" }))),
    bell: (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...p },
        UI.element("path", { d: "M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" }),
        UI.element("path", { d: "M10 19a2 2 0 0 0 4 0" }))),
    chevron: (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...p },
        UI.element("path", { d: "M6 9l6 6 6-6" }))),
};
const ico = (name, props) => (Icon[name] ? Icon[name](props) : (Dk[name] ? Dk[name](props) : null));
function TopBar() {
    return (UI.element("header", { className: "dk-top" },
        UI.element("div", { className: "dk-top__brand" },
            UI.element("button", { className: "dk-icon-btn", "aria-label": "Меню" }, Icon.menu({ width: 22, height: 22 })),
            UI.element("img", { src: "assets/logo-simple.png", alt: "", className: "dk-top__logo" }),
            UI.element("span", { className: "dk-top__title" }, "Нортландия 2026")),
        UI.element("div", { className: "dk-search" },
            UI.element("span", { className: "dk-search__icon" }, Dk.search({ width: 18, height: 18 })),
            UI.element("input", { placeholder: "Поиск по сайту" })),
        UI.element("div", { className: "dk-top__right" },
            UI.element("button", { className: "dk-icon-btn", "aria-label": "Уведомления" },
                Dk.bell({ width: 22, height: 22 }),
                UI.element("span", { className: "dk-badge" }, "3")))));
}
function Sidebar({ page, onNav }) {
    const item = (n) => (UI.element("button", { key: n.key, className: 'dk-nav__item' + ((n.key === page) ? ' dk-nav__item--active' : ''), onClick: () => onNav(n.key) },
        UI.element("span", { className: "dk-nav__icon" }, ico(n.icon, { width: 20, height: 20 })),
        n.label));
    return (UI.element("aside", { className: "dk-sidebar" },
        UI.element("div", { className: "dk-user" },
            UI.element("span", { className: "nl-avatar dk-user__av", style: { background: '#C4A33A' } }, "И"),
            UI.element("div", { className: "dk-user__name" }, "Петров Иван")),
        UI.element("div", { className: "dk-nav__group" }, "Общее"),
        UI.element("nav", { className: "dk-nav" }, NAV_GENERAL.map(item)),
        UI.element("div", { className: "dk-nav__group" }, "Управление"),
        UI.element("nav", { className: "dk-nav" }, NAV_MANAGE.map(item))));
}
function BlogPageDesktop() {
    const [reacts, setReacts] = useDS(() => Object.fromEntries(POSTS.map((p) => [p.id, { heart: false, like: false, h: p.hearts, l: p.likes }])));
    const toggle = (id, kind) => setReacts((r) => {
        const cur = r[id];
        const on = kind === 'heart' ? !cur.heart : !cur.like;
        return { ...r, [id]: { ...cur, [kind]: on,
                [kind === 'heart' ? 'h' : 'l']: (kind === 'heart' ? cur.h : cur.l) + (on ? 1 : -1) } };
    });
    return (UI.element("div", { className: "dk-page" },
        UI.element("div", { className: "dk-breadcrumb" },
            UI.element("a", null, "Нортландия"),
            " / ",
            UI.element("span", null, "Блог")),
        UI.element("div", { className: "dk-toolbar" },
            UI.element("div", { className: "dk-toolbar__left" },
                UI.element("button", { className: "nl-btn nl-btn--solid" },
                    Icon.plus({ width: 18, height: 18 }),
                    " Написать"),
                UI.element("button", { className: "nl-btn dk-btn-outline" },
                    Icon.blog({ width: 18, height: 18 }),
                    " Серии"),
                UI.element("button", { className: "nl-btn dk-btn-outline" },
                    Icon.tasks({ width: 18, height: 18 }),
                    " Хабы")),
            UI.element("button", { className: "dk-select" },
                "Свежие ",
                Dk.chevron({ width: 16, height: 16 }))),
        UI.element("div", { className: "dk-feed" }, POSTS.map((p) => {
            const rc = reacts[p.id];
            return (UI.element("article", { key: p.id, className: "nl-card dk-post" },
                UI.element(ArtTile, { variant: p.art, tint: p.color, size: 96, radius: 16, style: { alignSelf: 'flex-start' } }),
                UI.element("div", { style: { flex: 1, minWidth: 0 } },
                    UI.element("h2", { className: "dk-post__title" }, p.title),
                    UI.element("p", { className: "dk-post__excerpt" }, p.excerpt),
                    UI.element("div", { className: "dk-post__foot" },
                        UI.element("span", { className: "nl-avatar", style: { background: p.color } }, p.initials),
                        UI.element("div", { className: "dk-post__meta" },
                            UI.element("b", null, p.author),
                            UI.element("span", null, p.day)),
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
                            p.comments)))));
        }))));
}
function TaskPageDesktop() {
    const [taken, setTaken] = useDS(false);
    const d = TASK_DETAIL;
    return (UI.element("div", { className: "dk-page" },
        UI.element("div", { className: "dk-breadcrumb" },
            UI.element("a", null, "Нортландия"),
            " / ",
            UI.element("a", null, "Задания"),
            " / ",
            UI.element("span", null, d.title)),
        UI.element("div", { className: "dk-task" },
            UI.element("div", { className: "dk-task__media" },
                UI.element("div", { className: "dk-task__art" },
                    UI.element(ArtTile, { variant: d.art, tint: "var(--color-mastery)", radius: 0, style: { width: '100%', aspectRatio: '4 / 3', height: 'auto' } })),
                UI.element("span", { className: "dk-tag dk-tag--mastery" }, "Токены мастерства")),
            UI.element("div", { className: "dk-task__info nl-card" },
                UI.element("h1", { className: "dk-task__title" }, d.title),
                UI.element("p", { className: "dk-task__desc" }, d.desc),
                UI.element("div", { className: "dk-hint" },
                    UI.element("span", { className: "dk-hint__label" }, "Можно использовать"),
                    d.materials),
                UI.element("div", { className: "dk-meta-row" },
                    UI.element("div", { className: "dk-meta" },
                        UI.element("span", { style: { color: 'var(--color-mastery)' } }, Icon.teacher({ width: 22, height: 22 })),
                        UI.element("div", null,
                            UI.element("span", { className: "dk-meta__k" }, d.role),
                            UI.element("b", null, d.teacher))),
                    UI.element("div", { className: "dk-meta" },
                        UI.element("span", { style: { color: 'var(--color-text-soft)' } }, Icon.flag({ width: 20, height: 20 })),
                        UI.element("div", null,
                            UI.element("span", { className: "dk-meta__k" }, "Место"),
                            UI.element("b", null, d.place)))),
                UI.element("hr", { className: "nl-divider" }),
                UI.element("div", { className: "dk-task__bottom" },
                    UI.element("div", { className: "dk-progress-wrap" },
                        UI.element("div", { className: "dk-progress-head" },
                            UI.element("span", null, "Выполняют"),
                            UI.element("b", null,
                                taken ? d.done + 1 : d.done,
                                " из ",
                                d.total)),
                        UI.element("div", { className: "nl-progress nl-progress--h", style: { height: 10 } },
                            UI.element("div", { className: "nl-progress__fill", style: {
                                    width: `${((taken ? d.done + 1 : d.done) / d.total) * 100}%`,
                                    '--fill': 'var(--color-mastery)'
                                } }))),
                    UI.element("button", { className: 'nl-btn ' + (taken ? 'nl-btn--accent' : 'nl-btn--ghost'), onClick: () => setTaken((v) => !v) }, taken ? '✓ Задание взято' : 'Взять задание'))))));
}
function DesktopApp() {
    const [page, setPage] = useDS('blog');
    return (UI.element("div", { className: "dk-root nl" },
        UI.element(TopBar, null),
        UI.element("div", { className: "dk-layout" },
            UI.element(Sidebar, { page: page, onNav: (k) => (k === 'blog' || k === 'task') && setPage(k) }),
            UI.element("main", { className: "dk-content" }, page === 'blog' ? UI.element(BlogPageDesktop, null) : UI.element(TaskPageDesktop, null)))));
}
UI.createRoot(document.getElementById('root')).render(UI.element(DesktopApp, null));
