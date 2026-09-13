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
    "typeBar": "labels",
    "tileShape": "rounded",
    "progressDir": "top",
    "texture": true
};
const NAV = [
    { key: 'home', label: 'Мастерские', title: 'МАСТЕРСКИЕ', icon: 'home' },
    { key: 'map', label: 'Карта', title: 'КАРТА', icon: 'map' },
    { key: 'profile', label: 'Бэджик', title: 'БЭДЖИК', icon: 'profile' },
];
function ProfileScreen({ t }) {
    let name = 'Участник';
    try {
        name = localStorage.getItem('nl-login') || name;
    }
    catch (e) { }
    const lead = (UI.element("div", { className: "nl-card", style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 } },
        UI.element("div", { style: { flex: 'none', width: 52, height: 52, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'color-mix(in srgb,var(--color-mastery) 30%,white)', fontWeight: 900, fontSize: 15, color: '#20303f' } }, "НК"),
        UI.element("div", { style: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 } },
            UI.element("b", { style: { fontSize: 16 } }, name),
            UI.element("span", { style: { fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-soft)' } }, "Бэджик участника \u00B7 сезон 2026"))));
    return UI.element(CharacteristicsScreen, { t: t, lead: lead });
}
function App() {
    const t = TWEAK_DEFAULTS;
    const [screen, setScreen] = useS('home');
    const [ws, setWs] = useS(null);
    const [act, mas, rep] = t.palette || PALETTES['Классика'];
    const rootVars = {
        '--color-action': act,
        '--color-mastery': mas,
        '--color-reputation': rep,
        '--radius-card': (t.cardRadius || 14) + 'px',
        '--bg-texture': t.texture ? 'var(--ice-texture)' : 'none',
    };
    const current = NAV.find((n) => n.key === screen) || NAV[0];
    return (UI.element("div", { className: "nl-frame" },
        UI.element("div", { className: "nl-app nl", style: rootVars },
            UI.element(Header, { title: ws ? 'МАСТЕРСКАЯ' : current.title }),
            UI.element("main", { className: "nl-body" },
                screen === 'home' && !ws && UI.element(HomeScreen, { t: t, onOpen: setWs }),
                screen === 'home' && ws && UI.element(WorkshopDialogScreen, { t: t, ws: ws, onBack: () => setWs(null) }),
                screen === 'blog' && UI.element(BlogScreen, { t: t }),
                screen === 'map' && UI.element(MapScreen, null),
                screen === 'profile' && UI.element(ProfileScreen, { t: t })),
            UI.element("nav", { className: "nl-tabbar" }, NAV.map((n) => (UI.element("button", { key: n.key, className: 'nl-tabbar__item' + (screen === n.key ? ' nl-tabbar__item--active' : ''), onClick: () => { setScreen(n.key); if (n.key !== 'home')
                    setWs(null); } },
                UI.element("span", { className: "nl-tabbar__icon" }, n.icon === 'home' ? WS_ICON.all({ width: 24, height: 24 }) : Icon[n.icon]({ width: 24, height: 24 })),
                n.label)))))));
}
UI.createRoot(document.getElementById('root')).render(UI.element(App, null));
