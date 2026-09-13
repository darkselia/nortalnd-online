"use strict";
const { useState: useWS } = UI;
const WS_TYPES = [
    { key: 'all', label: 'Все', tint: 'var(--color-mastery)' },
    { key: 'craft', label: 'Творчество', tint: 'var(--color-action)' },
    { key: 'media', label: 'Медиа', tint: 'var(--color-mastery)' },
    { key: 'tech', label: 'Инженерия', tint: 'var(--color-reputation)' },
    { key: 'word', label: 'Слово', tint: 'var(--color-action)' },
    { key: 'game', label: 'Игры', tint: 'var(--color-reputation)' },
];
const WS_ICON = {
    all: (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...p },
        UI.element("path", { d: "M4 11.5 12 5l8 6.5" }),
        UI.element("path", { d: "M6.5 10.5V19h11v-8.5" }),
        UI.element("path", { d: "M10.5 19v-4.5h3V19" }))),
    craft: (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...p },
        UI.element("path", { d: "M12 4a8 8 0 1 0 0 16c1.2 0 1.8-.8 1.8-1.6 0-1.4-1.2-1.6-1.2-2.6 0-.9.7-1.5 1.7-1.5H16a4 4 0 0 0 4-4c0-3.6-3.6-6.3-8-6.3Z" }),
        UI.element("circle", { cx: "8.5", cy: "10.5", r: "1.1", fill: "currentColor", stroke: "none" }),
        UI.element("circle", { cx: "12", cy: "8", r: "1.1", fill: "currentColor", stroke: "none" }),
        UI.element("circle", { cx: "15.5", cy: "10.2", r: "1.1", fill: "currentColor", stroke: "none" }))),
    media: (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...p },
        UI.element("rect", { x: "3", y: "7", width: "13", height: "10", rx: "3" }),
        UI.element("path", { d: "M16 12.5 21 15V9l-5 2.5" }))),
    tech: (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...p },
        UI.element("circle", { cx: "12", cy: "12", r: "3" }),
        UI.element("path", { d: "M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" }))),
    word: (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...p },
        UI.element("path", { d: "M5 19c1-6 5.5-11 13-13-.5 7.5-5 12-11 12.5" }),
        UI.element("path", { d: "M5 19c2.5-2.5 5-4.5 8-6" }))),
    game: (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...p },
        UI.element("rect", { x: "4", y: "4", width: "16", height: "16", rx: "4" }),
        UI.element("circle", { cx: "9", cy: "9", r: "1.2", fill: "currentColor", stroke: "none" }),
        UI.element("circle", { cx: "15", cy: "15", r: "1.2", fill: "currentColor", stroke: "none" }),
        UI.element("circle", { cx: "15", cy: "9", r: "1.2", fill: "currentColor", stroke: "none" }),
        UI.element("circle", { cx: "9", cy: "15", r: "1.2", fill: "currentColor", stroke: "none" }))),
};
const WORKSHOPS = [
    { id: 'w1', tokens: 24, tokensGoal: 40, type: 'craft', art: 'shield', photo: 'img/heraldry-house.jpg', title: 'Геральдическая мастерская',
        desc: 'Создание наградных знаков и достижений', teacher: 'Юрчук Аня',
        tags: ['Векторная графика', 'Adobe Illustrator', 'Геральдика'] },
    { id: 'w2', tokens: 8, tokensGoal: 40, type: 'media', art: 'film', title: 'Анимационная мастерская',
        desc: 'Покадровая анимация и короткие ролики о смене', teacher: 'Морозов Алексей',
        tags: ['Stop-motion', 'Adobe Premiere', 'Раскадровка'] },
    { id: 'w3', tokens: 0, tokensGoal: 30, type: 'craft', art: 'map', title: 'Картографическая мастерская',
        desc: 'Карты земель Нортландии и легенды к ним', teacher: 'Дух Знаний',
        tags: ['Картография', 'Procreate', 'Работа с тушью'] },
    { id: 'w4', tokens: 16, tokensGoal: 30, type: 'word', art: 'note', title: 'Мастерская хроник',
        desc: 'Летописи смены и заметки в блог школы', teacher: 'Захарова Дарья',
        tags: ['Репортаж', 'Интервью', 'Редактура'] },
    { id: 'w5', tokens: 30, tokensGoal: 50, type: 'tech', art: 'gear', title: 'Инженерная мастерская',
        desc: 'Механизмы, мосты и ледяные конструкции', teacher: 'Смирнов Пётр',
        tags: ['3D-моделирование', 'Tinkercad', '3D-печать'] },
    { id: 'w6', tokens: 6, tokensGoal: 30, type: 'game', art: 'dice', title: 'Мастерская настольных игр',
        desc: 'Придумывание и тестирование собственных игр', teacher: 'Ковалёва Ника',
        tags: ['Гейм-дизайн', 'Баланс правил', 'Прототипирование'] },
    { id: 'w7', tokens: 0, tokensGoal: 40, type: 'media', art: 'sound', title: 'Звуковая мастерская',
        desc: 'Озвучка, шумы и музыка для видеороликов', teacher: 'Ильин Марк',
        tags: ['Звукорежиссура', 'Audacity', 'Саунд-дизайн'] },
    { id: 'w8', tokens: 12, tokensGoal: 30, type: 'game', art: 'mask', title: 'Театральная мастерская',
        desc: 'Этюды, роли и постановки к вечернему огоньку', teacher: 'Белова Ася',
        tags: ['Сценическая речь', 'Пластика', 'Импровизация'] },
    { id: 'w9', tokens: 4, tokensGoal: 50, type: 'tech', art: 'gear', photo: 'img/android-house.jpg', title: 'Мастерская Android-программирования',
        desc: 'Свои мобильные приложения — от идеи до сборки', teacher: 'Сафонов Илья',
        tags: ['Android', 'Kotlin', 'UI-макеты'] },
];
const TokenIcon = (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...p },
    UI.element("circle", { cx: "12", cy: "12", r: "8.5" }),
    UI.element("path", { d: "M12 7.5l1.5 3 3.2.4-2.3 2.2.6 3.1-3-1.6-3 1.6.6-3.1-2.3-2.2 3.2-.4z" })));
function MasteryTokens({ ws, tint, compact }) {
    const earned = ws.tokens || 0, goal = ws.tokensGoal || 0;
    const pct = goal ? Math.min(100, Math.round((earned / goal) * 100)) : 0;
    const level = pct >= 100 ? 'Мастер' : pct >= 66 ? 'Подмастерье' : pct >= 33 ? 'Ученик' : earned > 0 ? 'Новичок' : 'Ещё не начато';
    return (UI.element("div", { className: 'ws-tokens' + (compact ? ' ws-tokens--compact' : '') },
        UI.element("div", { className: "ws-tokens__head" },
            UI.element("span", { className: "ws-tokens__icon", style: { color: tint } }, TokenIcon({ width: 18, height: 18 })),
            UI.element("span", { className: "ws-tokens__label" }, "Токены мастерства"),
            UI.element("span", { className: "ws-tokens__val" },
                UI.element("b", null, earned),
                UI.element("span", null,
                    "/",
                    goal))),
        UI.element("div", { className: "ws-tokens__bar" },
            UI.element("i", { style: { width: pct + '%', background: tint } })),
        compact
            ? UI.element("div", { className: "ws-tokens__foot ws-tokens__foot--compact" },
                UI.element("span", null, level),
                UI.element("span", null,
                    pct,
                    "%"))
            : UI.element("div", { className: "ws-tokens__foot" },
                UI.element("span", null, level),
                UI.element("span", null,
                    pct,
                    "%"))));
}
function WorkshopArt({ variant, tint, radius = 14, photo, alt }) {
    if (photo)
        return (UI.element("div", { style: { borderRadius: radius, overflow: 'hidden', background: `color-mix(in srgb, ${tint} 18%, white)` } },
            UI.element("img", { src: photo, alt: alt || '', loading: "lazy", draggable: "false", style: { display: 'block', width: '100%', aspectRatio: '200 / 85', objectFit: 'cover' } })));
    return UI.element(WorkshopArtSvg, { variant: variant, tint: tint, radius: radius });
}
function WorkshopArtSvg({ variant, tint, radius = 14 }) {
    const bg = `color-mix(in srgb, ${tint} 22%, white)`;
    const ink = `color-mix(in srgb, ${tint} 72%, black)`;
    const soft = `color-mix(in srgb, ${tint} 45%, white)`;
    const M = {
        shield: (UI.element("g", { fill: "none", stroke: ink, strokeWidth: "3", strokeLinejoin: "round", strokeLinecap: "round" },
            UI.element("path", { d: "M80 26h40v34c0 20-13 30-20 34-7-4-20-14-20-34Z", fill: soft }),
            UI.element("path", { d: "M100 26v68M80 46h40", strokeWidth: "2.4" }),
            UI.element("path", { d: "M56 44l-8 8 8 8M144 44l8 8-8 8", strokeWidth: "2.6" }))),
        film: (UI.element("g", { fill: "none", stroke: ink, strokeWidth: "3", strokeLinejoin: "round" },
            UI.element("rect", { x: "52", y: "34", width: "76", height: "52", rx: "8", fill: soft }),
            UI.element("path", { d: "M52 46h76M52 74h76", strokeWidth: "2.2" }),
            UI.element("path", { d: "M128 68l22 14V38l-22 14" }))),
        map: (UI.element("g", { fill: "none", stroke: ink, strokeWidth: "3", strokeLinejoin: "round", strokeLinecap: "round" },
            UI.element("path", { d: "M50 36l30-10 40 12 30-10v56l-30 10-40-12-30 10Z", fill: soft }),
            UI.element("path", { d: "M80 26v56M120 38v56", strokeWidth: "2.2" }),
            UI.element("path", { d: "M96 56l8-8 6 10 10-6", strokeWidth: "2.4" }))),
        note: (UI.element("g", { fill: "none", stroke: ink, strokeWidth: "3", strokeLinejoin: "round", strokeLinecap: "round" },
            UI.element("path", { d: "M66 24h48l22 22v58H66Z", fill: soft }),
            UI.element("path", { d: "M114 24v22h22" }),
            UI.element("path", { d: "M82 60h56M82 74h40M82 88h30", strokeWidth: "2.4" }))),
        gear: (UI.element("g", { fill: "none", stroke: ink, strokeWidth: "3", strokeLinejoin: "round", strokeLinecap: "round" },
            UI.element("circle", { cx: "96", cy: "60", r: "26", fill: soft }),
            UI.element("circle", { cx: "96", cy: "60", r: "10" }),
            UI.element("path", { d: "M96 22v12M96 86v12M58 60h12M122 60h12M69 33l9 9M114 78l9 9M123 33l-9 9M78 78l-9 9" }),
            UI.element("circle", { cx: "140", cy: "90", r: "14", fill: soft }))),
        dice: (UI.element("g", { fill: "none", stroke: ink, strokeWidth: "3", strokeLinejoin: "round" },
            UI.element("rect", { x: "52", y: "40", width: "56", height: "56", rx: "12", fill: soft }),
            UI.element("circle", { cx: "70", cy: "58", r: "4", fill: ink, stroke: "none" }),
            UI.element("circle", { cx: "90", cy: "78", r: "4", fill: ink, stroke: "none" }),
            UI.element("rect", { x: "116", y: "24", width: "40", height: "40", rx: "10" }),
            UI.element("circle", { cx: "136", cy: "44", r: "4", fill: ink, stroke: "none" }))),
        sound: (UI.element("g", { fill: "none", stroke: ink, strokeWidth: "3", strokeLinejoin: "round", strokeLinecap: "round" },
            UI.element("rect", { x: "86", y: "22", width: "28", height: "46", rx: "14", fill: soft }),
            UI.element("path", { d: "M70 58a30 30 0 0 0 60 0" }),
            UI.element("path", { d: "M100 88v14M84 102h32" }),
            UI.element("path", { d: "M46 50v20M58 42v36M142 42v36M154 50v20", strokeWidth: "2.6" }))),
        mask: (UI.element("g", { fill: "none", stroke: ink, strokeWidth: "3", strokeLinejoin: "round", strokeLinecap: "round" },
            UI.element("path", { d: "M62 34h76v28c0 24-19 40-38 40S62 86 62 62Z", fill: soft }),
            UI.element("path", { d: "M78 58c5-5 12-5 16 0M106 58c5-5 12-5 16 0" }),
            UI.element("path", { d: "M86 80c8 7 20 7 28 0" }))),
    }[variant];
    return (UI.element("div", { style: { background: bg, borderRadius: radius, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.7)' } },
        UI.element("svg", { viewBox: "0 0 200 120", width: "100%", height: "100%", style: { display: 'block', aspectRatio: '200 / 120' }, preserveAspectRatio: "xMidYMid meet" }, M)));
}
function HomeScreen({ t, onOpen }) {
    const [type, setType] = useWS('all');
    const [q, setQ] = useWS('');
    const [idx, setIdx] = useWS(0);
    const trackRef = UI.useRef(null);
    const list = WORKSHOPS.filter((w) => (type === 'all' || w.type === type)
        && (q.trim() === '' || (w.title + ' ' + w.desc).toLowerCase().includes(q.trim().toLowerCase())));
    const tintOf = (w) => (WS_TYPES.find((x) => x.key === w.type) || WS_TYPES[0]).tint;
    UI.useEffect(() => {
        setIdx(0);
        if (trackRef.current)
            trackRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }, [type, q]);
    const slidePos = (el, i) => {
        const kid = el.children[i];
        if (!kid)
            return i * el.clientWidth;
        return Math.max(0, Math.min(el.scrollWidth - el.clientWidth, kid.offsetLeft - el.offsetLeft + kid.offsetWidth / 2 - el.clientWidth / 2));
    };
    const nearestIdx = (el) => {
        let best = 0, bd = Infinity;
        for (let i = 0; i < el.children.length; i++) {
            const d = Math.abs(slidePos(el, i) - el.scrollLeft);
            if (d < bd) {
                bd = d;
                best = i;
            }
        }
        return best;
    };
    const onScroll = (e) => {
        const el = e.currentTarget;
        const i = nearestIdx(el);
        if (i !== idx)
            setIdx(i);
    };
    const goTo = (i) => {
        const el = trackRef.current;
        if (!el)
            return;
        const n = Math.max(0, Math.min(list.length - 1, i));
        const left = slidePos(el, n);
        const snap = el.style.scrollSnapType;
        el.style.scrollSnapType = 'none';
        el.scrollTo({ left, behavior: 'smooth' });
        setIdx(n);
        setTimeout(() => {
            if (Math.abs(el.scrollLeft - left) > 2)
                el.scrollLeft = left;
            el.style.scrollSnapType = snap || 'x mandatory';
        }, 420);
    };
    const drag = UI.useRef({ on: false, x: 0, left: 0, moved: 0 });
    const down = (e) => {
        if (e.pointerType === 'touch')
            return;
        const el = trackRef.current;
        if (!el)
            return;
        drag.current = { on: true, x: e.clientX, left: el.scrollLeft, moved: 0 };
        el.style.scrollSnapType = 'none';
    };
    const move = (e) => {
        const d = drag.current;
        if (!d.on)
            return;
        const el = trackRef.current;
        if (!el)
            return;
        const dx = e.clientX - d.x;
        d.moved = Math.max(d.moved, Math.abs(dx));
        el.scrollLeft = d.left - dx;
    };
    const up = () => {
        const d = drag.current;
        if (!d.on)
            return;
        const el = trackRef.current;
        d.on = false;
        if (el) {
            el.style.scrollSnapType = 'x mandatory';
            goTo(nearestIdx(el));
        }
        setTimeout(() => { drag.current.moved = 0; }, 0);
    };
    const openIfNotDragged = (w, i) => {
        if (drag.current.moved >= 6)
            return;
        if (i !== idx) {
            goTo(i);
            return;
        }
        if (onOpen)
            onOpen(w);
    };
    const gutterClick = (e, i) => {
        if (drag.current.moved >= 6)
            return;
        if (e.target.closest('.ws-card'))
            return;
        if (i !== idx) {
            goTo(i);
            return;
        }
        const box = e.currentTarget.getBoundingClientRect();
        goTo(e.clientX < box.left + box.width / 2 ? idx - 1 : idx + 1);
    };
    const thumbsRef = UI.useRef(null);
    const [thumbsOverflow, setThumbsOverflow] = useWS(false);
    UI.useEffect(() => {
        const box = thumbsRef.current;
        if (!box)
            return;
        const check = () => setThumbsOverflow(box.scrollWidth > box.clientWidth + 2);
        check();
        const ro = new ResizeObserver(check);
        ro.observe(box);
        return () => ro.disconnect();
    }, [list.length]);
    UI.useEffect(() => {
        const box = thumbsRef.current;
        if (!box)
            return;
        const el = box.children[idx];
        if (!el)
            return;
        const target = el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2;
        box.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }, [idx, list.length]);
    return (UI.element("div", { className: "nl-scroll" },
        UI.element("div", { className: "ws-topbar" },
            UI.element("div", { className: "ws-typebar" }, WS_TYPES.map((ty) => {
                const on = type === ty.key;
                return (UI.element("button", { key: ty.key, className: 'ws-type' + (on ? ' ws-type--on' : ''), style: on ? { background: ty.tint } : null, onClick: () => setType(ty.key), "aria-label": ty.label, title: ty.label }, WS_ICON[ty.key]({ width: 22, height: 22 })));
            })),
            UI.element("label", { className: "ws-search" },
                SearchIcon({ width: 18, height: 18 }),
                UI.element("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Поиск мастерской" })),
            UI.element("div", { className: "ws-typetitle" },
                UI.element("span", { className: "ws-typetitle__dot", style: { background: (WS_TYPES.find((t2) => t2.key === type) || WS_TYPES[0]).tint } }),
                UI.element("h2", null, type === 'all' ? 'Все мастерские' : (WS_TYPES.find((t2) => t2.key === type) || {}).label),
                UI.element("span", { className: "ws-typetitle__count" }, list.length))),
        list.length === 0 ? (UI.element("p", { style: { textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 14, padding: 24 } }, "Мастерских такого типа пока нет.")) : (UI.element("div", { className: "ws-carousel" },
            UI.element("div", { className: "ws-track", ref: trackRef, onScroll: onScroll, onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up }, list.map((w, i) => (UI.element("div", { className: 'ws-slide' + (i === idx ? ' ws-slide--on' : ''), key: w.id, onClick: (e) => gutterClick(e, i) },
                UI.element("article", { className: "nl-card ws-card", onClick: () => openIfNotDragged(w, i) },
                    UI.element(WorkshopArt, { variant: w.art, photo: w.photo, alt: w.title, tint: tintOf(w), radius: 0 }),
                    UI.element("h2", { className: "ws-card__title" }, w.title),
                    UI.element("p", { className: "ws-card__desc" }, w.desc),
                    UI.element("div", { className: "ws-tags" }, w.tags.map((tag) => UI.element("span", { key: tag, className: "nl-chip" }, tag))),
                    UI.element("div", { className: "ws-card__tokens" },
                        UI.element(MasteryTokens, { ws: w, tint: tintOf(w), compact: true }))))))),
            UI.element("div", { className: "ws-nav" },
                thumbsOverflow ? (UI.element("button", { className: "ws-arrow", onClick: () => goTo(idx - 1), disabled: idx === 0, "aria-label": "Предыдущая" }, Icon.back({ width: 20, height: 20 }))) : null,
                UI.element("div", { className: 'ws-thumbs' + (thumbsOverflow ? '' : ' ws-thumbs--fit'), ref: thumbsRef }, list.map((w, i) => (UI.element("button", { key: w.id, className: 'ws-thumb' + (i === idx ? ' ws-thumb--on' : ''), style: i === idx ? { borderColor: tintOf(w) } : null, onClick: () => goTo(i), "aria-label": w.title, title: w.title }, w.photo
                    ? UI.element("img", { src: w.photo, alt: "", loading: "lazy", draggable: "false" })
                    : UI.element("span", { className: "ws-thumb__art" },
                        UI.element(WorkshopArtSvg, { variant: w.art, tint: tintOf(w), radius: 0 })))))),
                thumbsOverflow ? (UI.element("button", { className: "ws-arrow", onClick: () => goTo(idx + 1), disabled: idx === list.length - 1, "aria-label": "Следующая" },
                    UI.element("span", { style: { display: 'grid', transform: 'rotate(180deg)' } }, Icon.back({ width: 20, height: 20 })))) : null)))));
}
function WorkshopDetailScreen({ t, ws, onBack }) {
    const [joined, setJoined] = useWS(false);
    const tint = (WS_TYPES.find((x) => x.key === ws.type) || WS_TYPES[0]).tint;
    return (UI.element("div", { className: "nl-scroll" },
        UI.element("div", { style: { position: 'relative', padding: 16 } },
            UI.element(WorkshopArt, { variant: ws.art, photo: ws.photo, alt: ws.title, tint: tint, radius: (t.cardRadius || 14) + 4 }),
            UI.element("button", { className: "nl-btn", onClick: onBack, style: { position: 'absolute', top: 28, left: 28, background: 'rgba(255,255,255,.92)',
                    color: 'var(--color-text)', border: 'none', boxShadow: 'var(--shadow-card-sm)', paddingLeft: 14 } },
                Icon.back({ width: 18, height: 18 }),
                " Назад")),
        UI.element("div", { style: { padding: '0 16px 20px' } },
            UI.element("div", { className: "nl-card" },
                UI.element("h1", { style: { marginBottom: 8 } }, ws.title),
                UI.element("p", { style: { color: 'var(--color-text)' } },
                    ws.desc,
                    "."),
                UI.element("hr", { className: "nl-divider" }),
                UI.element(MasteryTokens, { ws: ws, tint: tint }),
                UI.element("hr", { className: "nl-divider" }),
                UI.element("div", { style: { fontSize: 12, fontWeight: 800, color: 'var(--color-text-faint)', marginBottom: 8 } }, "ЧЕМУ УЧИМСЯ"),
                UI.element("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } }, ws.tags.map((tag) => UI.element("span", { key: tag, className: "nl-chip" }, tag))),
                UI.element("hr", { className: "nl-divider" }),
                UI.element("div", { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                    UI.element("span", { style: { color: tint } }, Icon.teacher({ width: 22, height: 22 })),
                    UI.element("div", { style: { fontSize: 14 } },
                        UI.element("span", { style: { color: 'var(--color-text-soft)' } }, "Ведёт: "),
                        UI.element("b", null, ws.teacher))),
                UI.element("hr", { className: "nl-divider" }),
                UI.element("button", { className: 'nl-btn nl-btn--block ' + (joined ? 'nl-btn--accent' : 'nl-btn--solid'), onClick: () => setJoined((v) => !v) }, joined ? '✓ Вы записаны' : 'Записаться в мастерскую')))));
}
const SearchIcon = (p) => (UI.element("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", ...p },
    UI.element("circle", { cx: "11", cy: "11", r: "6.5" }),
    UI.element("path", { d: "M16 16l4.5 4.5" })));
Object.assign(window, { HomeScreen, WorkshopDetailScreen, WorkshopArt, MasteryTokens, WORKSHOPS, WS_TYPES, WS_ICON });
