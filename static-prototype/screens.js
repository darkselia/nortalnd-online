"use strict";
const { useState, useEffect, useRef } = UI;
const STATS = [
    { key: 'reputation', label: 'РЕПУТАЦИЯ', value: 2, max: 5, varc: '--color-reputation' },
    { key: 'mastery', label: 'ТОКЕНЫ\nМАСТЕРСТВА', value: 45, max: 90, varc: '--color-mastery' },
    { key: 'action', label: 'ТОКЕНЫ\nДЕЙСТВИЯ', value: 60, max: 100, varc: '--color-action' },
];
const TAGS = { balance: 240, today: 35, spent: 120 };
const TAG_HISTORY = [
    { id: 'h1', day: '22 августа, 18:40', text: 'Занятие в Анимационной мастерской', amount: 15 },
    { id: 'h2', day: '22 августа, 14:05', text: 'Заметка в блог школы', amount: 20 },
    { id: 'h3', day: '21 августа, 20:15', text: 'Лавка: набор стикеров', amount: -40 },
    { id: 'h4', day: '21 августа, 12:30', text: 'Помощь младшему отряду', amount: 25 },
    { id: 'h5', day: '20 августа, 19:00', text: 'Лавка: вечерний чай с Мастером', amount: -80 },
    { id: 'h6', day: '20 августа, 11:20', text: 'Герб для отряда в Геральдической', amount: 30 },
];
const LEVELS = [
    { label: '1 УР', at: 38 },
    { label: '2 УР', at: 63 },
    { label: '3 УР', at: 88 },
];
const TASKS = {
    action: [
        { id: 'a1', art: 'film', title: 'Записать анимационный ролик продолжительностью не менее 2 минут', done: 5 },
        { id: 'a2', art: 'poster', title: 'Нарисовать постер к событию смены', done: 2 },
        { id: 'a3', art: 'note', title: 'Написать заметку в блог о своей мастерской', done: 8 },
    ],
    mastery: [
        { id: 'm1', art: 'snow', title: 'Собрать ледяную скульптуру на вечернем огоньке', done: 3 },
        { id: 'm2', art: 'apple', title: 'Провести мастер-класс для младшего отряда', done: 6 },
        { id: 'm3', art: 'film', title: 'Смонтировать видеодневник смены за один день', done: 4 },
    ],
};
const TASK_DETAIL = {
    art: 'film',
    title: 'Записать анимационный ролик',
    desc: 'Записать анимационный ролик продолжительностью не менее 2 минут в технике покадровой анимации.',
    materials: 'Можно использовать такие материалы как пластилин, палочки, карандаши и бумагу.',
    teacher: 'Юрчук Аня', role: 'Браузер', place: 'ВЦ',
    done: 5, total: 10,
};
function Header({ title }) {
    return (UI.element("header", { className: "nl-header" },
        UI.element("img", { className: "nl-header__logo", src: (window.NL_BASE || '') + 'assets/logo-simple.png', alt: "Нортландия" }),
        UI.element("div", { className: "nl-header__title" }, title),
        UI.element("button", { className: "nl-header__btn", "aria-label": "Меню" }, Icon.menu({ width: 24, height: 24 }))));
}
function CharacteristicsScreen({ t, lead }) {
    const [grow, setGrow] = useState(false);
    const [histOpen, setHistOpen] = useState(false);
    useEffect(() => { const id = setTimeout(() => setGrow(true), 120); return () => clearTimeout(id); }, []);
    const fromTop = t.progressDir === 'top';
    return (UI.element("div", { className: "nl-scroll" },
        UI.element("div", { style: { padding: 16 } },
            lead,
            UI.element("div", { className: "nl-card", style: { padding: 14, marginBottom: 14 } },
                UI.element("div", { style: { display: 'flex', alignItems: 'center', gap: 12 } },
                    UI.element("span", { style: {
                            width: 46, height: 46, borderRadius: 14, display: 'grid', placeItems: 'center', flex: '0 0 auto',
                            background: 'color-mix(in srgb, var(--color-action) 26%, white)', color: 'color-mix(in srgb, var(--color-action) 70%, black)',
                        } }, Icon.tag({ width: 26, height: 26 })),
                    UI.element("div", { style: { flex: 1, minWidth: 0 } },
                        UI.element("div", { style: { fontSize: 12, fontWeight: 800, letterSpacing: '.04em', color: 'var(--color-text-faint)' } }, "ТЕГИ"),
                        UI.element("div", { style: { fontSize: 26, fontWeight: 900, lineHeight: 1.1, color: 'var(--color-text)' } }, TAGS.balance)),
                    UI.element("button", { className: "nl-btn nl-btn--solid" }, "Потратить")),
                UI.element("p", { style: { margin: '10px 0 0', fontSize: 13, lineHeight: 1.4, color: 'var(--color-text-soft)' } }, "Валюта смены: копи за задания и мастерские, трать в лавке Нортландии."),
                UI.element("div", { style: { marginTop: 10 } },
                    UI.element("button", { onClick: () => setHistOpen((v) => !v), style: {
                            display: 'inline-flex', alignItems: 'center', gap: 6, padding: 0, border: 'none', background: 'none',
                            font: 'inherit', fontSize: 13.5, fontWeight: 800, color: 'var(--color-mastery)', cursor: 'pointer',
                        } },
                        "История начислений",
                        UI.element("span", { style: { display: 'grid', transform: histOpen ? 'rotate(90deg)' : 'rotate(-90deg)', transition: 'transform .16s ease' } }, Icon.back({ width: 14, height: 14 }))),
                    histOpen && (UI.element("div", { style: { marginTop: 10, borderTop: '1px solid var(--color-line)' } }, TAG_HISTORY.map((h) => (UI.element("div", { key: h.id, style: {
                            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
                            borderBottom: '1px solid var(--color-line)',
                        } },
                        UI.element("div", { style: { flex: 1, minWidth: 0 } },
                            UI.element("div", { style: { fontSize: 13.5, fontWeight: 700, lineHeight: 1.25 } }, h.text),
                            UI.element("div", { style: { fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-faint)' } }, h.day)),
                        UI.element("div", { style: {
                                fontSize: 15, fontWeight: 900, whiteSpace: 'nowrap',
                                color: h.amount > 0 ? 'color-mix(in srgb, var(--color-action) 78%, black)' : 'var(--color-text-soft)',
                            } },
                            h.amount > 0 ? '+' : '−',
                            Math.abs(h.amount))))))))),
            UI.element("div", { className: "nl-card", style: { padding: '20px 14px 14px' } },
                UI.element("div", { style: { display: 'grid', gridTemplateColumns: '34px 1fr 1fr 1fr', gap: 10, marginBottom: 10 } },
                    UI.element("div", null),
                    STATS.map((s) => (UI.element("div", { key: s.key, style: {
                            textAlign: 'center', fontWeight: 800, fontSize: 13, lineHeight: 1.15,
                            whiteSpace: 'pre-line', color: 'var(--color-text)',
                        } }, s.label)))),
                UI.element("div", { style: { position: 'relative', display: 'grid', gridTemplateColumns: '34px 1fr 1fr 1fr', gap: 10, height: 380 } },
                    LEVELS.map((lv) => (UI.element(UI.Fragment, { key: lv.label },
                        UI.element("div", { style: { position: 'absolute', left: 0, top: `${lv.at}%`, transform: 'translateY(-50%)',
                                fontSize: 11, fontWeight: 800, color: 'var(--color-text-faint)' } }, lv.label),
                        UI.element("div", { style: { position: 'absolute', left: 40, right: 0, top: `${lv.at}%`,
                                borderTop: '2px dashed var(--color-line)' } })))),
                    UI.element("div", null),
                    STATS.map((s) => {
                        const pct = Math.round((s.value / s.max) * 100);
                        const h = grow ? pct : 0;
                        return (UI.element("div", { key: s.key, className: "nl-progress", style: { position: 'relative', height: '100%' } },
                            UI.element("div", { className: "nl-progress__fill", style: {
                                    bottom: fromTop ? 'auto' : 0, top: fromTop ? 0 : 'auto',
                                    height: `${h}%`,
                                    borderRadius: fromTop ? '0 0 10px 10px' : '10px 10px 0 0',
                                    '--fill': `var(${s.varc})`,
                                } },
                                UI.element("span", { style: {
                                        position: 'absolute', left: 0, right: 0,
                                        bottom: fromTop ? 6 : 'auto', top: fromTop ? 'auto' : 6, textAlign: 'center',
                                        fontWeight: 900, fontSize: 15, color: 'var(--color-text)',
                                        opacity: grow ? 1 : 0, transition: 'opacity .6s ease .5s',
                                    } },
                                    s.value,
                                    UI.element("span", { style: { opacity: .55, fontSize: 12 } },
                                        "/",
                                        s.max)))));
                    }))),
            UI.element("p", { style: { textAlign: 'center', marginTop: 14, color: 'var(--color-text-soft)', fontSize: 13 } }, "Накопи токены до отметки уровня \u2014 и забери приз у Духа Нортландии."))));
}
function TasksScreen({ t, tab, setTab, onOpen }) {
    return (UI.element("div", { className: "nl-scroll" },
        UI.element("div", { style: { padding: 16 } },
            UI.element("div", { className: "nl-tabs", style: { marginBottom: 16 } }, [['action', 'ТОКЕНЫ\nДЕЙСТВИЯ'], ['mastery', 'ТОКЕНЫ\nМАСТЕРСТВА']].map(([k, lbl]) => (UI.element("button", { key: k, className: 'nl-tab ' + (tab === k && t.tabStyle === 'dark' ? 'nl-tab--active' : ''), style: { whiteSpace: 'pre-line', ...tabActiveStyle(t, tab === k, k) }, onClick: () => setTab(k) }, lbl)))),
            UI.element("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 } }, TASKS[tab].map((task) => (UI.element("div", { key: task.id, className: "nl-card", style: { padding: 14 } },
                UI.element("div", { style: { display: 'flex', gap: 14, alignItems: 'flex-start' } },
                    UI.element(ArtTile, { variant: task.art, tint: tabTint(tab), size: 64, radius: t.tileShape === 'circle' ? 999 : t.cardRadius }),
                    UI.element("div", { style: { flex: 1, minWidth: 0 } },
                        UI.element("div", { style: { fontWeight: 800, fontSize: 15, lineHeight: 1.25 } }, task.title))),
                UI.element("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 } },
                    UI.element("div", { style: { fontSize: 12, fontWeight: 700, color: 'var(--color-text-soft)', lineHeight: 1.2 } },
                        "ВЫПОЛНЯЮТ:",
                        UI.element("br", null),
                        UI.element("span", { style: { color: 'var(--color-text)', fontSize: 14 } },
                            task.done,
                            " из 10")),
                    UI.element("button", { className: "nl-btn nl-btn--solid", onClick: () => onOpen(task) }, "Подробнее")))))))));
}
function TaskDetailScreen({ t, task, tab, onBack }) {
    const [taken, setTaken] = useState(false);
    const d = { ...TASK_DETAIL,
        title: task ? task.title : TASK_DETAIL.title,
        art: task ? task.art : TASK_DETAIL.art,
        done: task ? task.done : TASK_DETAIL.done };
    return (UI.element("div", { className: "nl-scroll", style: { paddingBottom: 92 } },
        UI.element("div", { style: { position: 'relative', padding: 16 } },
            UI.element("div", { style: { borderRadius: t.cardRadius + 4, overflow: 'hidden', boxShadow: 'var(--shadow-card)' } },
                UI.element(ArtTile, { variant: d.art, tint: tabTint(tab), radius: 0, style: { width: '100%', aspectRatio: '4 / 3', height: 'auto' } })),
            UI.element("button", { className: "nl-btn", onClick: onBack, style: { position: 'absolute', top: 28, left: 28, background: 'rgba(255,255,255,.92)',
                    color: 'var(--color-text)', border: 'none', boxShadow: 'var(--shadow-card-sm)',
                    backdropFilter: 'blur(4px)', paddingLeft: 14 } },
                Icon.back({ width: 18, height: 18 }),
                " Назад")),
        UI.element("div", { style: { padding: '0 16px' } },
            UI.element("div", { className: "nl-card" },
                UI.element("h1", { style: { marginBottom: 10 } }, d.title),
                UI.element("p", { style: { color: 'var(--color-text)' } }, d.desc),
                UI.element("p", { style: { color: 'var(--color-text-soft)', fontSize: 14, marginBottom: 0 } }, d.materials),
                UI.element("hr", { className: "nl-divider" }),
                UI.element("div", { style: { display: 'flex', justifyContent: 'space-between', gap: 12 } },
                    UI.element("div", { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                        UI.element("span", { style: { color: 'var(--color-mastery)' } }, Icon.teacher({ width: 22, height: 22 })),
                        UI.element("div", { style: { fontSize: 14 } },
                            UI.element("span", { style: { color: 'var(--color-text-soft)' } },
                                d.role,
                                ": "),
                            UI.element("b", null, d.teacher))),
                    UI.element("div", { className: "nl-chip" },
                        Icon.flag({ width: 14, height: 14 }),
                        " ",
                        d.place)),
                UI.element("hr", { className: "nl-divider" }),
                UI.element("div", { style: { textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--color-text-soft)' } },
                    "ВЫПОЛНЯЮТ: ",
                    UI.element("b", { style: { color: 'var(--color-text)' } },
                        taken ? d.done + 1 : d.done,
                        " из 10")))),
        UI.element("div", { style: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16,
                background: 'linear-gradient(180deg, transparent, var(--color-bg) 38%)' } },
            UI.element("button", { className: 'nl-btn nl-btn--block ' + (taken ? 'nl-btn--accent' : 'nl-btn--ghost'), onClick: () => setTaken((v) => !v) }, taken ? '✓ Задание взято' : 'Взять задание'))));
}
function tabTint(tab) {
    return tab === 'action' ? 'var(--color-action)' : 'var(--color-mastery)';
}
function tabActiveStyle(t, active, k) {
    if (!active) {
        if (t.tabStyle === 'underline')
            return { boxShadow: 'none', background: 'transparent' };
        return {};
    }
    if (t.tabStyle === 'accent') {
        const tint = k === 'action' ? 'var(--color-action)' : 'var(--color-mastery)';
        return { background: tint, color: 'var(--color-text)' };
    }
    if (t.tabStyle === 'underline') {
        return { background: 'transparent', color: 'var(--color-text)', boxShadow: 'none',
            borderBottom: '3px solid var(--color-text)', borderRadius: 0 };
    }
    return {};
}
Object.assign(window, {
    Header, CharacteristicsScreen, TasksScreen, TaskDetailScreen,
    TASKS, STATS, TASK_DETAIL, LEVELS, TAGS, TAG_HISTORY,
});
