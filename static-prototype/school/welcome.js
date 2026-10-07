"use strict";
const { useState: useW, useRef: useWR, useEffect: useWE } = UI;
const NC = { name: 'Норт-коммандер', role: 'Встречает всех, кто входит в Нортландию' };
function WelcomeScreen() {
    const [log, setLog] = useW([{ who: 'm', text: 'О, новое лицо! Добро пожаловать в Нортландию. Я Норт-коммандер — встречаю всех, кто впервые ступает на эту площадь.' }]);
    const [node, setNode] = useW('start');
    const [name, setName] = useW('');
    const [draft, setDraft] = useW('');
    const [badge, setBadge] = useW(false);
    const [map, setMap] = useW(false);
    const [tookBadge, setTookBadge] = useW(false);
    const [tookMap, setTookMap] = useW(false);
    const [toast, setToast] = useW('');
    const [asked, setAsked] = useW([]);
    const chat = useWR(null);
    const nudge = () => {
        setToast('Сперва закончи разговор с Норт-коммандером');
        setTimeout(() => setToast(''), 2200);
    };
    useWE(() => { if (chat.current)
        chat.current.scrollTop = chat.current.scrollHeight; }, [log, tookBadge, tookMap]);
    const say = (u, m) => setLog((l) => [...l, ...(u ? [{ who: 'u', text: u }] : []), ...(m ? [{ who: 'm', text: m }] : [])]);
    const D = {
        start: {
            options: [
                { label: 'Здравствуйте! А что это за место?', to: 'place' },
                { label: 'Привет. Я тут первый раз', to: 'first' },
            ],
        },
        place: {
            reply: 'Нортландия — школа под открытым небом. Вон там мастерские: в каждой свой хозяин и своё ремесло. А вокруг — леса, тропы и старые дома, в которых спрятаны загадки и артефакты. Но сперва познакомимся. Как тебя зовут?',
            to: 'ask_name',
        },
        first: {
            reply: 'Первый раз — самое интересное. Тут учатся руками: берёшь дельце у мастера, делаешь, получаешь теги. А в свободное время бродишь по округе и ищешь то, что другие не заметили. Но сперва познакомимся. Как тебя зовут?',
            to: 'ask_name',
        },
        after_name: {
            options: [
                { label: 'А что дальше делать?', to: 'what' },
                { label: 'Что за загадки и артефакты?', to: 'quests' },
            ],
        },
        what: {
            reply: 'Иди в мастерские. Выбираешь ту, что по душе, знакомишься с хозяином и берёшь у него дельце. Сделал — прислал — получил теги. И вот, держи карту — на ней отмечены все мастерские и тропы вокруг. Возьми её, и внизу появятся мастерские и карта.',
            to: 'after_map',
        },
        after_map: {
            options: [
                { label: 'Что за загадки и артефакты?', to: 'quests' },
                { label: 'Спасибо, пойду осмотрюсь', to: 'bye' },
            ],
        },
        quests: {
            reply: 'Нортландия старше, чем кажется. По округе разбросаны знаки, тайники и обрывки чужих записей. Найдёшь артефакт — он останется в твоём бэджике и кое-что откроет. Ищи внимательно: половина загадок прямо под ногами.',
            to: 'back',
        },
        bye: {
            reply: 'Правильно. Оглядись без спешки — ничего срочного тут нет. Если что-то непонятно, ищи меня на площади, я почти всегда здесь. До встречи!',
            to: 'end',
        },
    };
    const pick = (opt) => {
        const next = D[opt.to];
        if (opt.to === 'ask_name') {
            setNode('ask_name');
            return;
        }
        if (opt.to === 'bye' && (!tookBadge || !tookMap)) {
            const miss = !tookBadge && !tookMap ? 'бэджик и карту' : !tookBadge ? 'бэджик' : 'карту';
            say(opt.label, `Хорошо, только забери ${miss}.`);
            return;
        }
        setAsked((a) => [...a, opt.to]);
        say(opt.label, next.reply);
        if (opt.to === 'what') {
            setMap(true);
            setLog((l) => [...l, { who: 'card', kind: 'map' }]);
        }
        const dest = next.to === 'back' ? (map || opt.to === 'what' ? 'after_map' : 'after_name') : next.to;
        if (dest === 'ask_name')
            setNode('ask_name');
        else
            setNode(dest);
    };
    const submitName = () => {
        const n = draft.trim();
        if (!n)
            return;
        setName(n);
        setBadge(true);
        setLog((l) => [...l, { who: 'u', text: n },
            { who: 'm', text: `Рад знакомству, ${n}. Вот твой бэджик — забирай, теперь ты участник смены. В нём видно твои теги, токены и всё, что ты успел сделать.` },
            { who: 'card', kind: 'badge' }]);
        setNode('after_name');
    };
    const cur = D[node] || {};
    const hero = node === 'end' ? 'nort-commander-bye.png'
        : !badge ? 'nort-commander.png'
            : !tookBadge ? 'nort-commander-ok.png'
                : (map && !tookMap) ? 'nort-commander-map.png'
                    : 'nort-commander-free.png';
    return (UI.element("div", { className: "nl-frame" },
        UI.element("div", { className: "nl-app" },
            UI.element("div", { className: "ws-dlg" },
                UI.element("div", { className: "nc-scene" },
                    UI.element("img", { className: "nc-scene__bg", src: "img/square-bg.jpg", alt: "" }),
                    ['nort-commander.png', 'nort-commander-ok.png', 'nort-commander-map.png', 'nort-commander-free.png', 'nort-commander-bye.png'].map((f) => (UI.element("img", { key: f, className: 'nc-scene__hero' + (hero === f ? ' is-on' : ''), src: 'img/' + f, alt: "Норт-коммандер" }))),
                    UI.element("div", { className: "nc-scene__name" },
                        UI.element("b", null, NC.name),
                        UI.element("span", null, NC.role))),
                UI.element("div", { className: "ws-chat", ref: chat }, log.map((m, i) => (m.who === 'card' ? (UI.element("div", { key: i, className: "nc-badge" },
                    UI.element("div", { className: "nc-badge__pic" }, m.kind === 'map' ? Icon.map({ width: 24, height: 24 }) : 'НК'),
                    UI.element("div", { className: "nc-badge__txt" },
                        UI.element("b", null, m.kind === 'map' ? 'Карта Нортландии' : 'Бэджик участника'),
                        UI.element("span", null, m.kind === 'map' ? 'Отмечены все мастерские и тропы' : `${name} · сезон 2026 · теги 0`)),
                    UI.element("button", { className: "nc-take", disabled: m.kind === 'map' ? tookMap : tookBadge, onClick: () => (m.kind === 'map' ? setTookMap(true) : setTookBadge(true)) }, (m.kind === 'map' ? tookMap : tookBadge) ? 'Взято' : 'Взять'))) : (UI.element("div", { key: i, className: 'ws-msg ws-msg--' + m.who },
                    UI.element("span", { className: "ws-msg__who" }, m.who === 'm' ? NC.name : (name || 'Ты')),
                    m.text))))),
                UI.element("div", { className: "ws-answers" }, node === 'ask_name' ? (UI.element(UI.Fragment, null,
                    UI.element("div", { className: "nc-name" },
                        UI.element("input", { value: draft, placeholder: "Напиши свое имя", autoFocus: true, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter')
                                submitName(); } }),
                        UI.element("button", { className: "nc-send", disabled: !draft.trim(), onClick: submitName }, "Готово")),
                    UI.element("div", { className: "nc-hint" }, "Имя увидят мастера в мастерских"))) : node === 'end' ? (UI.element("a", { className: "nl-btn nl-btn--solid nl-btn--block", href: "school.html" }, "Выйти на площадь")) : ((cur.options || []).filter((o) => !asked.includes(o.to)).map((o, i) => (UI.element("button", { key: i, className: "ws-answer", onClick: () => pick(o) }, o.label))))),
                (tookBadge || tookMap) && (UI.element("div", { className: "nl-tabbar nc-tabbar" },
                    tookMap && (UI.element("button", { className: "nl-tabbar__item", onClick: nudge },
                        UI.element("span", { className: "nl-tabbar__icon" }, Icon.tasks({ width: 24, height: 24 })),
                        "Мастерские")),
                    tookMap && (UI.element("button", { className: "nl-tabbar__item", onClick: nudge },
                        UI.element("span", { className: "nl-tabbar__icon" }, Icon.map({ width: 24, height: 24 })),
                        "Карта")),
                    tookBadge && (UI.element("button", { className: "nl-tabbar__item", onClick: nudge },
                        UI.element("span", { className: "nl-tabbar__icon" }, Icon.profile({ width: 24, height: 24 })),
                        "Бэджик")))),
                toast && UI.element("div", { className: "nc-toast" }, toast)))));
}
Object.assign(window, { WelcomeScreen });
