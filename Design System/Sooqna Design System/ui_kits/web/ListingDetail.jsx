// Sooqna ListingDetail component

Object.assign(window, {
  ListingDetail: function({ listing, onBack, onMessage }) {
    const [favorite, setFavorite] = React.useState(false);
    const l = listing || {
      id: "demo",
      title: "شقة للإيجار في عمان — مفروشة بالكامل ٣ غرف نوم وصالون",
      price: "١٢٠ د.أ / شهر",
      city: "عمّان",
      area: "الرابية",
      featured: true,
      image: null,
      condition: "new",
      category: "عقارات",
      views: 342,
      date: "٢٠ أبريل ٢٠٢٦",
      description: "شقة مفروشة بالكامل للإيجار في منطقة الرابية — عمّان. تتكون من ٣ غرف نوم، صالون واسع، مطبخ مجهز، وحمامين. قريبة من المواصلات والخدمات. متاحة فوراً.",
      seller: { name: "أحمد العمري", status: "عضو نشط" }
    };

    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
      // Breadcrumb
      React.createElement("nav", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-muted)" } },
        React.createElement("button", { onClick: onBack, style: { background: "none", border: "none", color: "var(--color-brand)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", padding: 0 } }, "الرئيسية"),
        React.createElement("span", null, "/"),
        React.createElement("button", { onClick: onBack, style: { background: "none", border: "none", color: "var(--color-brand)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", padding: 0 } }, "الإعلانات"),
        React.createElement("span", null, "/"),
        React.createElement("span", { style: { color: "var(--color-text)" } }, l.title)
      ),

      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 } },
        // Main column
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
          // Image gallery
          React.createElement("div", { style: { ...ldStyles.panel, overflow: "hidden" } },
            React.createElement("div", { style: { position: "relative", height: 340, background: "var(--color-surface-muted)" } },
              React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" } },
                React.createElement("svg", { width: 60, height: 60, viewBox: "0 0 24 24", fill: "none", stroke: "var(--color-text-muted)", strokeWidth: 1.5, style: { opacity: .3 } },
                  React.createElement("rect", { x: 3, y: 3, width: 18, height: 18, rx: 2 }),
                  React.createElement("circle", { cx: 8.5, cy: 8.5, r: 1.5 }),
                  React.createElement("path", { d: "m21 15-5-5L5 21" })
                )
              ),
              l.featured && React.createElement("span", { style: { position: "absolute", top: 12, right: 12, background: "var(--color-featured)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 9999 } }, "مميز ★"),
              React.createElement("button", {
                onClick: () => setFavorite(!favorite),
                style: { position: "absolute", top: 12, left: 12, width: 36, height: 36, borderRadius: 9999, background: "rgba(255,255,255,.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,.12)" }
              },
                React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: favorite ? "#ef4444" : "none", stroke: favorite ? "#ef4444" : "#9ca3af", strokeWidth: 2 },
                  React.createElement("path", { d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" })
                )
              )
            )
          ),

          // Title + meta
          React.createElement("div", { style: ldStyles.panel },
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 } },
              React.createElement("span", { style: ldStyles.chip }, l.category),
              React.createElement("span", { style: { ...ldStyles.chip, borderColor: "var(--color-border)" } }, l.condition === "new" ? "جديد" : "مستعمل")
            ),
            React.createElement("h1", { style: { margin: 0, fontSize: 24, fontWeight: 800, lineHeight: 1.3, color: "var(--color-text)" } }, l.title),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8, fontSize: 12, color: "var(--color-text-muted)" } },
              React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 4 } },
                React.createElement("svg", { width: 12, height: 12, viewBox: "0 0 24 24", fill: "var(--color-brand)" },
                  React.createElement("path", { d: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" })
                ),
                l.city, l.area ? ` - ${l.area}` : ""
              ),
              React.createElement("span", null, `نشر في ${l.date}`),
              React.createElement("span", null, `${l.views} مشاهدة`)
            ),
            // Price box
            React.createElement("div", { style: { marginTop: 14, borderRadius: 8, background: "var(--color-accent-soft)", padding: "12px 16px" } },
              React.createElement("p", { style: { margin: "0 0 4px", fontSize: 11, color: "var(--color-text-muted)" } }, "السعر"),
              React.createElement("p", { style: { margin: 0, fontSize: 24, fontWeight: 800, color: "var(--color-brand)" } }, l.price)
            )
          ),

          // Description
          React.createElement("div", { style: ldStyles.panel },
            React.createElement("h2", { style: { margin: "0 0 10px", fontSize: 13, fontWeight: 700 } }, "تفاصيل الإعلان"),
            React.createElement("p", { style: { margin: 0, fontSize: 13, lineHeight: 1.75, color: "var(--color-text-muted)", whiteSpace: "pre-line" } }, l.description)
          ),

          // Back button
          React.createElement("button", {
            onClick: onBack,
            style: { background: "var(--color-chip)", border: "1px solid var(--color-chip-border)", borderRadius: 9999, padding: "8px 18px", fontSize: 12, fontWeight: 600, fontFamily: "inherit", color: "var(--color-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, width: "fit-content" }
          },
            React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
              React.createElement("path", { d: "m9 18 6-6-6-6" })
            ),
            "العودة إلى الإعلانات"
          )
        ),

        // Sidebar
        React.createElement("aside", { style: { display: "flex", flexDirection: "column", gap: 14 } },
          // Seller
          React.createElement("div", { style: ldStyles.panel },
            React.createElement("p", { style: { margin: "0 0 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--color-text-muted)" } }, "البائع"),
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
              React.createElement("div", { style: { width: 44, height: 44, borderRadius: 9999, background: "var(--color-accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 } }, "👤"),
              React.createElement("div", null,
                React.createElement("p", { style: { margin: 0, fontWeight: 700, fontSize: 14, color: "var(--color-text)" } }, l.seller.name),
                React.createElement("p", { style: { margin: 0, fontSize: 11, color: "var(--color-text-muted)" } }, l.seller.status)
              )
            )
          ),

          // Actions
          React.createElement("div", { style: ldStyles.panel },
            React.createElement("button", {
              onClick: () => onMessage && onMessage(l),
              style: { display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 9999, background: "var(--color-brand)", color: "#fff", border: "none", padding: "11px 16px", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", marginBottom: 8 }
            },
              React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
                React.createElement("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
              ),
              "راسل البائع"
            ),
            React.createElement("button", {
              onClick: () => setFavorite(!favorite),
              style: { display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 9999, border: `1px solid ${favorite ? "#fca5a5" : "var(--color-chip-border)"}`, background: favorite ? "#fef2f2" : "var(--color-chip)", color: favorite ? "#dc2626" : "var(--color-text-muted)", padding: "9px 16px", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }
            },
              React.createElement("svg", { width: 15, height: 15, viewBox: "0 0 24 24", fill: favorite ? "currentColor" : "none", stroke: "currentColor", strokeWidth: 2 },
                React.createElement("path", { d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" })
              ),
              favorite ? "إزالة من المفضلة" : "أضف للمفضلة"
            )
          ),

          // Meta
          React.createElement("div", { style: ldStyles.panel },
            React.createElement("p", { style: { margin: "0 0 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--color-text-muted)" } }, "معلومات الإعلان"),
            React.createElement("dl", { style: { margin: 0, display: "flex", flexDirection: "column", gap: 8 } },
              [["التصنيف", l.category], ["الحالة", l.condition === "new" ? "جديد" : "مستعمل"], ["المدينة", l.city], ["المشاهدات", String(l.views)], ["تاريخ النشر", l.date]].map(([k, v]) =>
                React.createElement("div", { key: k, style: { display: "flex", justifyContent: "space-between", fontSize: 12 } },
                  React.createElement("dt", { style: { color: "var(--color-text-muted)" } }, k),
                  React.createElement("dd", { style: { margin: 0, fontWeight: 600, color: "var(--color-text)" } }, v)
                )
              )
            )
          )
        )
      )
    );
  }
});

const ldStyles = {
  panel: { borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-surface)", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.08)" },
  chip: { borderRadius: 9999, background: "var(--color-chip)", border: "1px solid var(--color-chip-border)", padding: "3px 12px", fontSize: 12, color: "var(--color-text-muted)" },
};
