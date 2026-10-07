"use strict";
function LoginPage() {
    return (UI.element("div", { className: "nl-frame" },
        UI.element("div", { className: "nl-app" },
            UI.element(AuthScreen, { onDone: (login) => {
                    try {
                        localStorage.setItem('nl-login', login);
                    }
                    catch (e) { }
                    window.location.href = 'welcome.html';
                } }))));
}
UI.createRoot(document.getElementById('root')).render(UI.element(LoginPage, null));
