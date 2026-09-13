"use strict";
const { useState: useD, useRef: useDR, useEffect: useDE } = UI;
const MASTERS = {
    w1: { name: 'Юрий', role: 'Хранитель гербов', portrait: '../assets/master-yuri.jpg' },
    w2: { name: 'Алексей', role: 'Мастер движущихся картин' },
    w3: { name: 'Дух Знаний', role: 'Картограф Нортландии' },
    w4: { name: 'Дарья', role: 'Летописец смены' },
    w5: { name: 'Пётр', role: 'Инженер льда' },
    w6: { name: 'Ника', role: 'Хранитель правил' },
    w7: { name: 'Марк', role: 'Ловец звуков' },
    w8: { name: 'Ася', role: 'Мастер маски' },
};
const DEEDS = {
    w1: [
        { title: 'Знак для лучшего дежурного', brief: 'Нарисуй гербовый знак в трёх цветах: щит, один главный символ и девиз в ленте. Формат — SVG или PNG на прозрачном фоне.', tags: 6 },
        { title: 'Перерисовать старый вымпел', brief: 'Есть вымпел северного отряда, бумага выцвела. Повтори его в векторе, сохранив пропорции и цвета.', tags: 8 },
    ],
    w9: [
        { title: 'Заглавный экран для аппа смены', brief: 'Собери один экран: список мастерский и кнопка «Подробнее». Можно макетом или кодом — пришли скрин или архив проекта.', tags: 7 },
        { title: 'Кнопка-счётчик токенов', brief: 'Нужен маленький экран со счётчиком: нажал — число выросло, значение не теряется после перезапуска.', tags: 9 },
    ],
};
function deedsOf(ws) {
    if (DEEDS[ws.id])
        return DEEDS[ws.id];
    const a = (ws.tags[0] || 'ремесло').toLowerCase(), b = (ws.tags[1] || ws.tags[0] || 'работа').toLowerCase();
    return [
        { title: `Небольшая работа: ${a}`, brief: `Сделай одну готовую вещь по теме «${a}» для ${ws.title.toLowerCase()}. Не гнись за совершенством — важнее закончить.`, tags: 6 },
        { title: `Помощь со вторым делом: ${b}`, brief: `Здесь нужно аккуратно и по шагам: «${b}». Сделаешь — сразу пойдёт в дело на смене.`, tags: 8 },
    ];
}
function buildDialog(ws) {
    const m = MASTERS[ws.id] || { name: ws.teacher, role: 'Хозяин мастерской' };
    const tools = ws.tags.join(', ').toLowerCase();
    const [d1, d2] = deedsOf(ws);
    return {
        start: {
            text: `Здравствуй, путник. Я ${m.name}, ${m.role.toLowerCase()}. Ты как раз вовремя — тут всегда нужны руки.`,
            options: [
                { label: `Здравствуйте, ${m.name}`, to: 'hello' },
                { label: 'Не подскажете, что это за место?', to: 'place' },
                { label: 'Чему здесь учат?', to: 'learn' },
            ],
        },
        hello: {
            text: 'Здравствуй. Проходи, не стесняйся — снег снаружи, а тут тепло и пахнет работой.',
            options: [
                { label: 'Не подскажете, что это за место?', to: 'place' },
                { label: 'Чему здесь учат?', to: 'learn' },
                { label: 'А что мне за это будет?', to: 'reward' },
            ],
        },
        place: {
            text: `Это ${ws.title.toLowerCase()}. ${ws.desc} — вот и всё наше ремесло.`,
            options: [
                { label: 'Чему здесь учат?', to: 'learn' },
                { label: 'Сложно ли начать?', to: 'hard' },
                { label: 'Чем могу помочь?', to: 'offer' },
            ],
        },
        learn: {
            text: `Разбираемся с этим: ${tools}. Начинаем с простого, к концу смены сделаешь свою работу от начала до конца.`,
            options: [
                { label: 'Сложно ли начать?', to: 'hard' },
                { label: 'А что мне за это будет?', to: 'reward' },
                { label: 'Чем могу помочь?', to: 'offer' },
            ],
        },
        hard: {
            text: 'Не сложнее, чем завязать шнурки на морозе. Опыт не нужен — нужно приходить и делать.',
            options: [
                { label: 'А что мне за это будет?', to: 'reward' },
                { label: 'Чем могу помочь?', to: 'offer' },
            ],
        },
        reward: {
            text: 'За сделанное дельце я даю теги — их потом можно на что-то потратить. А токены мастерства начисляют позже, за качество работы, и сколько будет — заранее не скажу ни я, ни кто-либо ещё.',
            options: [
                { label: 'Чем могу помочь?', to: 'offer' },
                { label: 'Я подумаю', to: 'later' },
            ],
        },
        offer: {
            text: `У меня тут два дельца. Первое — ${d1.title.toLowerCase()}, за него ${d1.tags} тегов. Второе — ${d2.title.toLowerCase()}, за него ${d2.tags} тегов. Токены мастерства придут потом — по качеству работы. За что возьмёшься?`,
            options: [
                { label: `Да, возьмусь за «${d1.title}»`, to: 'deed1' },
                { label: `Да, возьмусь за «${d2.title}»`, to: 'deed2' },
                { label: 'Зайду попозже', to: 'later' },
            ],
        },
        deed1: {
            text: `Тогда вот тебе все подробности. ${d1.brief}`,
            options: [],
            deed: 0,
        },
        deed2: {
            text: `Тогда вот тебе все подробности. ${d2.brief}`,
            options: [],
            deed: 1,
        },
        refuse: {
            text: 'Жаль. Запишу, что дело вернулось ко мне несделанным. Заходи снова — доверие возвращается работой.',
            options: [
                { label: 'А что ещё есть?', to: 'offer' },
                { label: 'Зайду попозже', to: 'later' },
            ],
        },
        later: {
            text: 'Заходи когда будет время. Дельца никуда не денутся, а дверь тут не запирается.',
            options: [{ label: 'Вернуться к разговору', to: 'start' }],
        },
    };
}
function WorkshopDialogScreen({ t, ws, onBack }) {
    const dialog = UI.useMemo(() => buildDialog(ws), [ws.id]);
    const m = MASTERS[ws.id] || { name: ws.teacher, role: 'Хозяин мастерской' };
    const tint = (WS_TYPES.find((x) => x.key === ws.type) || WS_TYPES[0]).tint;
    const [node, setNode] = useD('start');
    const [log, setLog] = useD([{ who: 'm', text: dialog.start.text }]);
    const [joined, setJoined] = useD(false);
    const [deed, setDeed] = useD(null);
    const [video, setVideo] = useD(false);
    const [file, setFile] = useD(null);
    const [sent, setSent] = useD(false);
    const [question, setQuestion] = useD('');
    const [quit, setQuit] = useD(false);
    const [taken, setTaken] = useD(false);
    const chatRef = useDR(null);
    useDE(() => {
        const sc = chatRef.current;
        if (!sc)
            return;
        const pin = () => { sc.scrollTop = sc.scrollHeight; };
        pin();
        const ro = new ResizeObserver(pin);
        ro.observe(sc);
        Array.from(sc.children).forEach((c) => ro.observe(c));
        const stop = setTimeout(() => ro.disconnect(), 700);
        return () => { clearTimeout(stop); ro.disconnect(); };
    }, [log]);
    const pick = (opt) => {
        const next = dialog[opt.to];
        setLog((l) => [...l, { who: 'u', text: opt.label }, { who: 'm', text: next.text }]);
        setNode(opt.to);
        if (next.join)
            setJoined(true);
        if (next.deed != null) {
            setDeed(deedsOf(ws)[next.deed]);
            setFile(null);
            setSent(false);
            setTaken(false);
        }
        if (opt.to === 'offer' || opt.to === 'later' || opt.to === 'start' || opt.to === 'refuse') {
            setDeed(null);
            setTaken(false);
        }
    };
    const sendWork = () => {
        if (!file)
            return;
        setSent(true);
        setLog((l) => [...l,
            { who: 'u', text: `Отправил результат: ${file}` },
            { who: 'm', text: `Принял, гляну вечером. За сделанное начислю ${deed ? deed.tags : 6} тегов, а токены мастерства придут позже — когда оценят качество работы.` }]);
    };
    const takeDeed = () => {
        setTaken(true);
        setLog((l) => [...l, { who: 'u', text: 'Принимаю задание' },
            { who: 'm', text: 'Отлично, задание за тобой. Как будет результат — загрузи файл здесь, я посмотрю и начислю теги.' }]);
    };
    const askQuestion = () => {
        const q = question.trim();
        if (!q)
            return;
        setQuestion('');
        setLog((l) => [...l, { who: 'u', text: q },
            { who: 'm', text: 'Хороший вопрос. Отвечу в течение дня — загляни сюда позже, ответ будет здесь.' }]);
    };
    const cur = dialog[node];
    return (UI.element("div", { className: 'ws-dlg' + (deed ? ' ws-dlg--deed' : '') },
        UI.element("div", { className: "ws-portrait", style: { '--tint': tint } },
            m.portrait
                ? UI.element("img", { src: m.portrait, alt: m.name })
                : UI.element("div", { className: "ws-portrait__ph" },
                    Icon.teacher({ width: 56, height: 56 }),
                    UI.element("span", null, "Портрет ведущего")),
            UI.element("button", { className: "nl-btn ws-portrait__back", onClick: onBack },
                Icon.back({ width: 18, height: 18 }),
                " Назад"),
            UI.element("div", { className: "ws-portrait__name" },
                UI.element("b", null, m.name),
                UI.element("span", null,
                    m.role,
                    " \u00B7 ",
                    ws.title))),
        UI.element("div", { className: "ws-chat", ref: chatRef },
            log.map((l, i) => (UI.element("div", { key: i, className: 'ws-msg ws-msg--' + l.who },
                l.who === 'm' && UI.element("span", { className: "ws-msg__who", style: { color: tint } }, m.name),
                l.text))),
            UI.element("div", null)),
        UI.element("div", { className: "ws-answers" }, cur.options.length > 0 ? cur.options.map((o) => (UI.element("button", { key: o.to + o.label, className: "ws-answer", onClick: () => pick(o) }, o.label))) : deed ? (UI.element("div", { className: "ws-deed" },
            UI.element("div", { className: "ws-deed__head" },
                UI.element("span", { className: "ws-deed__title" }, deed.title),
                UI.element("span", { className: "ws-deed__tokens", style: { background: `color-mix(in srgb, ${tint} 22%, white)` } },
                    "+",
                    deed.tags,
                    " тегов")),
            UI.element("button", { className: "ws-deed__video", onClick: () => setVideo(true) },
                UI.element("span", { className: "ws-deed__play", style: { background: tint } }, "\u25B6"),
                "Видео-инструкция"),
            UI.element("div", { className: "ws-deed__ask" },
                UI.element("input", { value: question, placeholder: "Уточняющий вопрос мастеру\u2026", onChange: (e) => setQuestion(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter')
                        askQuestion(); } }),
                UI.element("button", { className: "ws-deed__send", disabled: !question.trim(), onClick: askQuestion }, "Спросить")),
            !taken ? (UI.element("button", { className: "ws-deed__take", style: { background: tint }, onClick: takeDeed }, "Принять задание")) : (UI.element(UI.Fragment, null,
                UI.element("div", { className: "ws-deed__row" },
                    UI.element("label", { className: "ws-deed__drop" },
                        UI.element("input", { type: "file", onChange: (e) => { const f = e.target.files[0]; setFile(f ? f.name : null); setSent(false); } }),
                        UI.element("b", null, file || 'Загрузить результат'),
                        UI.element("span", null, file ? (sent ? 'отправлено мастеру' : 'файл выбран') : 'фото, PDF или архив')),
                    UI.element("button", { className: "ws-deed__send", disabled: !file || sent, onClick: sendWork }, sent ? '✓' : 'Отправить')),
                UI.element("button", { className: "ws-deed__other", onClick: () => setQuit(true) }, "Отказаться от задания"))))) : (UI.element("div", { className: "ws-answers__end" },
            joined && UI.element("div", { className: "ws-joined", style: { background: `color-mix(in srgb, ${tint} 22%, white)` } }, "\u2713 Вы записаны в мастерскую"),
            UI.element("button", { className: "nl-btn nl-btn--block nl-btn--ghost", onClick: onBack }, "К списку мастерских")))),
        quit && (UI.element("div", { className: "ws-sheet", onClick: () => setQuit(false) },
            UI.element("div", { className: "ws-quit", onClick: (e) => e.stopPropagation() },
                UI.element("b", null, "Отказаться от задания?"),
                UI.element("span", null,
                    "Отказ может понизить твою репутацию у ",
                    m.name,
                    ". В следующий раз мастер может предложить дела попроще."),
                UI.element("div", { className: "ws-quit__row" },
                    UI.element("button", { className: "ws-deed__send ws-deed__send--ghost", onClick: () => setQuit(false) }, "Оставить за собой"),
                    UI.element("button", { className: "ws-deed__send", onClick: () => { setQuit(false); pick({ label: 'Откажусь от этого задания', to: 'refuse' }); } }, "Всё равно отказаться"))))),
        video && (UI.element("div", { className: "ws-video", onClick: () => setVideo(false) },
            UI.element("div", { className: "ws-video__box", onClick: (e) => e.stopPropagation() },
                UI.element("div", { className: "ws-video__frame" },
                    UI.element("span", { className: "ws-deed__play", style: { background: tint } }, "\u25B6"),
                    UI.element("span", null, "Видео-инструкция появится здесь")),
                UI.element("div", { className: "ws-video__cap" },
                    deed ? deed.title : '',
                    " \u00B7 ",
                    m.name),
                UI.element("a", { className: "ws-video__dl", href: "#", onClick: (e) => e.preventDefault() }, "\u2193 Скачать материалы для задания"),
                UI.element("button", { className: "nl-btn nl-btn--block nl-btn--ghost", onClick: () => setVideo(false) }, "Закрыть"))))));
}
Object.assign(window, { WorkshopDialogScreen, MASTERS, buildDialog, deedsOf });
