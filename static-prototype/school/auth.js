"use strict";
const { useState: useAS, useRef: useAR } = UI;
function CodeField({ value, onChange, onComplete, error }) {
    const refs = useAR([]);
    const set = (i, ch) => {
        const next = (value.slice(0, i) + ch + value.slice(i + 1)).slice(0, 6);
        onChange(next);
        if (ch && i < 5)
            refs.current[i + 1] && refs.current[i + 1].focus();
        if (next.length === 6)
            onComplete && onComplete(next);
    };
    const chars = Array.from({ length: 6 }, (_, i) => value[i] || '');
    return (UI.element("div", { className: 'au-code' + (error ? ' au-code--err' : '') }, chars.map((d, i) => (UI.element("input", { key: i, ref: (el) => (refs.current[i] = el), className: 'au-code__cell' + (d ? ' is-filled' : ''), maxLength: 1, value: d, autoCapitalize: "characters", autoCorrect: "off", spellCheck: "false", onChange: (e) => {
            const raw = e.target.value.replace(/[^0-9A-Za-zА-Яа-я]/g, '').toUpperCase();
            if (raw.length > 1) {
                const n = raw.slice(0, 6);
                onChange(n);
                if (n.length === 6)
                    onComplete && onComplete(n);
                return;
            }
            set(i, raw);
        }, onKeyDown: (e) => {
            if (e.key === 'Backspace' && !d && i > 0) {
                refs.current[i - 1].focus();
                onChange(value.slice(0, i - 1));
            }
            if (e.key === 'ArrowLeft' && i > 0)
                refs.current[i - 1].focus();
            if (e.key === 'ArrowRight' && i < 5)
                refs.current[i + 1].focus();
        }, onPaste: (e) => {
            const p = (e.clipboardData.getData('text') || '').replace(/[^0-9A-Za-zА-Яа-я]/g, '').toUpperCase().slice(0, 6);
            if (p) {
                e.preventDefault();
                onChange(p);
                if (p.length === 6)
                    onComplete && onComplete(p);
            }
        } })))));
}
function AuthScreen({ onDone }) {
    const [help, setHelp] = useAS(false);
    const [login, setLogin] = useAS('');
    const [code, setCode] = useAS('');
    const [err, setErr] = useAS('');
    const [busy, setBusy] = useAS(false);
    const enter = (val) => {
        const c = (val != null ? val : code);
        if (!login.trim()) {
            setErr('Введи логин');
            return;
        }
        if (c.length < 6) {
            setErr('Код доступа — 6 знаков');
            return;
        }
        setBusy(true);
        setErr('');
        setTimeout(() => { setBusy(false); onDone && onDone(login.trim()); }, 550);
    };
    return (UI.element("div", { className: "au" },
        UI.element("div", { className: "au__inner" },
            UI.element("img", { className: "au__hero", src: "img/title.jpg", alt: "Нортландия \u2014 school" }),
            UI.element("div", { className: "au-card" }, !help ? (UI.element(UI.Fragment, null,
                UI.element("h1", { className: "au__title" }, "Введите данные для входа"),
                UI.element("label", { className: "au-field" },
                    UI.element("span", null, "Логин"),
                    UI.element("input", { value: login, placeholder: "например, ivan.petrov", autoCapitalize: "none", autoCorrect: "off", spellCheck: "false", onChange: (e) => { setLogin(e.target.value); setErr(''); }, onKeyDown: (e) => { if (e.key === 'Enter')
                            enter(); } })),
                UI.element("div", { className: "au-field" },
                    UI.element("span", null, "Код доступа"),
                    UI.element(CodeField, { value: code, onChange: (v) => { setCode(v); setErr(''); }, onComplete: (v) => enter(v), error: !!err })),
                err && UI.element("div", { className: "au__err" }, err),
                UI.element("button", { className: "nl-btn nl-btn--solid nl-btn--block", disabled: busy, onClick: () => enter() }, busy ? 'Проверяем…' : 'Войти'),
                UI.element("button", { className: "au__link", onClick: () => setHelp(true) }, "Не помню логин или код"))) : (UI.element(UI.Fragment, null,
                UI.element("h1", { className: "au__title" }, "Нет логина или кода?"),
                UI.element("p", { className: "au__sub" }, "Логин и код доступа присылает куратор класса. Напиши ему \u2014 или в поддержку школы, там подскажут за пару минут."),
                UI.element("a", { className: "nl-btn nl-btn--ghost nl-btn--block", href: "#", onClick: (e) => e.preventDefault() }, "Написать в поддержку"),
                UI.element("button", { className: "au__link", onClick: () => setHelp(false) }, "Вернуться к входу")))),
            UI.element("div", { className: "au__foot" }, "Онлайн-школа \u00ABНортландия\u00BB \u00B7 2026"))));
}
Object.assign(window, { AuthScreen, CodeField });
