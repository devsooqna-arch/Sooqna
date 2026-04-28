// Sooqna Shell — Header, Footer, Bottom Nav
// Shared layout component for the Sooqna web UI kit

Object.assign(window, {
  SooqnaShell: function({ children, activePath = "/" }) {
    const [theme, setTheme] = React.useState("classic");

    React.useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const navActive = (href) =>
      activePath === href || activePath.startsWith(href + "/")
        ? "var(--color-brand)"
        : "var(--color-text-muted)";

    const themes = ["classic", "light", "dark"];

    return React.createElement("div", { style: shellStyles.root },
      // Header
      React.createElement("header", { style: shellStyles.header },
        // Top bar
        React.createElement("div", { style: shellStyles.topBar },
          React.createElement("div", { style: shellStyles.topInner },
            React.createElement("img", { src: "../../assets/logo.png", alt: "سوقنا", style: { height: 36, width: "auto" } }),
            React.createElement("div", { style: shellStyles.navActions },
              React.createElement("div", { style: shellStyles.themeRow },
                themes.map(t =>
                  React.createElement("button", {
                    key: t,
                    onClick: () => setTheme(t),
                    style: {
                      ...shellStyles.themeBtn,
                      background: theme === t ? "var(--color-brand)" : "transparent",
                      color: theme === t ? "#fff" : "var(--color-text-muted)",
                      borderColor: theme === t ? "var(--color-brand)" : "var(--color-border)",
                    }
                  }, t === "classic" ? "كلاسيكي" : t === "light" ? "فاتح" : "داكن")
                )
              ),
              React.createElement("button", { style: shellStyles.btnLogin }, "تسجيل الدخول"),
              React.createElement("button", { style: shellStyles.btnRegister }, "إنشاء حساب")
            )
          )
        ),
        // Accent search bar
        React.createElement("div", { style: shellStyles.accentBar },
          React.createElement("div", { style: shellStyles.accentInner },
            React.createElement("button", { style: shellStyles.postBtn }, "+ أعلن"),
            React.createElement("div", { style: { position: "relative", flex: 1 } },
              React.createElement("svg", { style: shellStyles.searchIcon, width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
                React.createElement("circle", { cx: 11, cy: 11, r: 8 }),
                React.createElement("path", { d: "m21 21-4.35-4.35" })
              ),
              React.createElement("input", { style: shellStyles.searchInput, type: "text", placeholder: "ابحث عن إعلانات، سيارات، عقارات..." })
            )
          )
        )
      ),
      // Main content
      React.createElement("main", { style: shellStyles.main }, children),
      // Bottom Nav (mobile only via style — always shown in kit)
      React.createElement("nav", { style: shellStyles.bottomNav },
        React.createElement("a", { href: "#", style: { ...shellStyles.navItem, color: navActive("/listings") } },
          React.createElement("svg", { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
            React.createElement("circle", { cx: 11, cy: 11, r: 8 }),
            React.createElement("path", { d: "m21 21-4.35-4.35" })
          ),
          "بحث"
        ),
        React.createElement("a", { href: "#", style: { ...shellStyles.navItem, color: navActive("/favorites") } },
          React.createElement("svg", { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
            React.createElement("path", { d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" })
          ),
          "المفضلة"
        ),
        React.createElement("a", { href: "#", style: shellStyles.navPost },
          React.createElement("svg", { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" },
            React.createElement("line", { x1: 12, y1: 5, x2: 12, y2: 19 }),
            React.createElement("line", { x1: 5, y1: 12, x2: 19, y2: 12 })
          ),
          React.createElement("span", { style: { fontSize: 9, fontWeight: 700, lineHeight: 1 } }, "أعلن")
        ),
        React.createElement("a", { href: "#", style: { ...shellStyles.navItem, color: navActive("/messages") } },
          React.createElement("svg", { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
            React.createElement("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
          ),
          "رسائل"
        ),
        React.createElement("a", { href: "#", style: { ...shellStyles.navItem, color: navActive("/me") } },
          React.createElement("svg", { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
            React.createElement("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
            React.createElement("circle", { cx: 12, cy: 7, r: 4 })
          ),
          "حسابي"
        )
      )
    );
  }
});

const shellStyles = {
  root: { minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "'Cairo','Segoe UI',system-ui,sans-serif", display: "flex", flexDirection: "column" },
  header: { position: "sticky", top: 0, zIndex: 30 },
  topBar: { borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" },
  topInner: { maxWidth: 1110, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 16px" },
  navActions: { display: "flex", alignItems: "center", gap: 8 },
  themeRow: { display: "flex", gap: 4 },
  themeBtn: { border: "1px solid", borderRadius: 9999, padding: "4px 10px", fontSize: 11, fontFamily: "inherit", cursor: "pointer", transition: "all .15s" },
  btnLogin: { border: "1px solid var(--color-border)", borderRadius: 9999, background: "transparent", padding: "5px 14px", fontSize: 12, fontFamily: "inherit", color: "var(--color-text-muted)", cursor: "pointer" },
  btnRegister: { background: "var(--color-brand)", color: "#fff", border: "none", borderRadius: 9999, padding: "5px 14px", fontSize: 12, fontFamily: "inherit", fontWeight: 600, cursor: "pointer" },
  accentBar: { background: "var(--color-accent-strip)", borderBottom: "1px solid var(--color-accent-strip)" },
  accentInner: { maxWidth: 1110, margin: "0 auto", display: "flex", alignItems: "center", gap: 10, padding: "6px 16px" },
  postBtn: { background: "var(--color-brand)", color: "#fff", border: "none", borderRadius: 9999, padding: "7px 18px", fontSize: 13, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  searchInput: { width: "100%", border: "none", borderRadius: 9999, background: "rgba(255,255,255,.85)", color: "var(--color-text)", fontFamily: "inherit", fontSize: 13, padding: "7px 40px 7px 14px", outline: "none", boxSizing: "border-box" },
  searchIcon: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" },
  main: { flex: 1, maxWidth: 1110, width: "100%", margin: "0 auto", padding: "28px 16px 96px" },
  bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-around", borderTop: "1px solid var(--color-nav-bottom-border)", background: "var(--color-nav-bottom)", padding: "4px 0 12px" },
  navItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 10px", fontSize: 10, fontWeight: 500, textDecoration: "none", fontFamily: "inherit" },
  navPost: { position: "relative", top: -12, width: 52, height: 52, borderRadius: 9999, background: "var(--color-brand)", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, boxShadow: "0 4px 12px rgba(45,106,45,.35)", textDecoration: "none" },
};
