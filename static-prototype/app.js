"use strict";
const { useState: useS } = UI;
const PALETTES = {
    'Классика': ['#88C878', '#72B8C8', '#C89AB8'],
    'Северный лёд': ['#6FC2A0', '#5AA0D8', '#B58AD0'],
    'Тёплая смена': ['#8FC76B', '#6FB8B0', '#D69AA0'],
};
const TWEAK_DEFAULTS = {
    "palette": ["#88C878", "#72B8C8", "#C89AB8"],
    "cardRadius": 14,
    "tabStyle": "dark",
    "tileShape": "rounded",
    "progressDir": "top",
    "texture": true
};
const NAV = [
    { key: 'stats', label: 'Характеристики', title: 'ХАРАКТЕРИСТИКИ', icon: 'stats' },
    { key: 'tasks', label: 'Задания', title: 'ЗАДАНИЯ', icon: 'tasks' },
    { key: 'blog', label: 'Блог', title: 'БЛОГ', icon: 'blog' },
];
function App() {
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    const [screen, setScreen] = useS('stats');
    const [tab, setTab] = useS('action');
    const [detail, setDetail] = useS(null);
    const [act, mas, rep] = t.palette || PALETTES['Классика'];
    const rootVars = {
        '--color-action': act,
        '--color-mastery': mas,
        '--color-reputation': rep,
        '--radius-card': (t.cardRadius || 14) + 'px',
        '--bg-texture': t.texture ? `var(--ice-texture)` : 'none',
    };
    const current = NAV.find((n) => n.key === screen) || NAV[0];
    const headerTitle = detail ? 'ЗАДАНИЕ' : current.title;
    return (UI.element("div", { className: "nl-frame" },
        UI.element("div", { className: "nl-app nl", style: rootVars },
            UI.element(Header, { title: headerTitle }),
            UI.element("main", { className: "nl-body" },
                screen === 'stats' && UI.element(CharacteristicsScreen, { t: t }),
                screen === 'tasks' && !detail && (UI.element(TasksScreen, { t: t, tab: tab, setTab: setTab, onOpen: (task) => setDetail(task) })),
                screen === 'tasks' && detail && (UI.element(TaskDetailScreen, { t: t, task: detail, tab: tab, onBack: () => setDetail(null) })),
                screen === 'blog' && UI.element(BlogScreen, { t: t })),
            UI.element("nav", { className: "nl-tabbar" }, NAV.map((n) => {
                const active = screen === n.key;
                return (UI.element("button", { key: n.key, className: 'nl-tabbar__item' + (active ? ' nl-tabbar__item--active' : ''), onClick: () => { setScreen(n.key); if (n.key !== 'tasks')
                        setDetail(null); } },
                    UI.element("span", { className: "nl-tabbar__icon" }, Icon[n.icon]({ width: 24, height: 24 })),
                    n.label));
            }))),
        UI.element(TweaksPanel, null,
            UI.element(TweakSection, { label: "Цвета" }),
            UI.element(TweakColor, { label: "Палитра токенов", value: t.palette, options: Object.values(PALETTES), onChange: (v) => setTweak('palette', v) }),
            UI.element(TweakToggle, { label: "Ледяная текстура фона", value: t.texture, onChange: (v) => setTweak('texture', v) }),
            UI.element(TweakSection, { label: "Карточки и миниатюры" }),
            UI.element(TweakSlider, { label: "Скругление карточек", value: t.cardRadius, min: 6, max: 24, step: 1, unit: "px", onChange: (v) => setTweak('cardRadius', v) }),
            UI.element(TweakRadio, { label: "Форма миниатюр", value: t.tileShape, options: ['rounded', 'circle'], onChange: (v) => setTweak('tileShape', v) }),
            UI.element(TweakSection, { label: "Табы заданий" }),
            UI.element(TweakRadio, { label: "Активный таб", value: t.tabStyle, options: ['dark', 'accent', 'underline'], onChange: (v) => setTweak('tabStyle', v) }),
            UI.element(TweakSection, { label: "Характеристики" }),
            UI.element(TweakRadio, { label: "Заполнение баров", value: t.progressDir, options: ['top', 'bottom'], onChange: (v) => setTweak('progressDir', v) }))));
}
UI.createRoot(document.getElementById('root')).render(UI.element(App, null));
