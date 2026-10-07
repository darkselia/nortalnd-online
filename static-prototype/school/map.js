"use strict";
function MapScreen() {
    return (UI.element("div", { className: "nl-scroll" },
        UI.element("div", { style: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 } },
            UI.element("div", { className: "nl-card nl-card--flush", style: { aspectRatio: '4 / 3', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 20, color: 'var(--color-text-soft)', fontSize: 13, fontWeight: 700 } },
                "Карта Нортландии",
                UI.element("br", null),
                "с отметками мастерских и троп"),
            UI.element("span", { style: { fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-soft)', lineHeight: 1.45 } }, "Пришли картинку карты \u2014 вставлю её сюда."))));
}
Object.assign(window, { MapScreen });
