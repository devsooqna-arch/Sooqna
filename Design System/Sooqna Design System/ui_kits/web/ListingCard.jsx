// Sooqna ListingCard component

Object.assign(window, {
  ListingCard: function({ listing, onFavorite }) {
    const [hovered, setHovered] = React.useState(false);
    return React.createElement("article", {
      style: { ...lcStyles.card, boxShadow: hovered ? "0 4px 6px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.06)" : "0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.06)" },
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
    },
      // Image area
      React.createElement("div", { style: lcStyles.imgWrap },
        listing.image
          ? React.createElement("img", { src: listing.image, alt: listing.title, style: { ...lcStyles.img, transform: hovered ? "scale(1.05)" : "scale(1)" } })
          : React.createElement("div", { style: lcStyles.imgPlaceholder },
              React.createElement("svg", { width: 36, height: 36, viewBox: "0 0 24 24", fill: "none", stroke: "var(--color-text-muted)", strokeWidth: 1.5, style: { opacity: .3 } },
                React.createElement("rect", { x: 3, y: 3, width: 18, height: 18, rx: 2 }),
                React.createElement("circle", { cx: 8.5, cy: 8.5, r: 1.5 }),
                React.createElement("path", { d: "m21 15-5-5L5 21" })
              )
            ),
        // Featured badge
        listing.featured && React.createElement("span", { style: lcStyles.badge }, "مميز ★"),
        // Price gradient overlay
        React.createElement("div", { style: lcStyles.gradient }),
        React.createElement("div", { style: lcStyles.priceOverlay },
          React.createElement("span", { style: lcStyles.priceText }, listing.price)
        )
      ),
      // Body
      React.createElement("div", { style: lcStyles.body },
        React.createElement("h3", { style: lcStyles.title }, listing.title),
        React.createElement("p", { style: lcStyles.meta },
          React.createElement("svg", { width: 11, height: 11, viewBox: "0 0 24 24", fill: "var(--color-brand)", style: { flexShrink: 0 } },
            React.createElement("path", { d: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" })
          ),
          listing.city || "الأردن"
        )
      )
    );
  },

  CategoryGrid: function({ categories, onSelect, selected }) {
    return React.createElement("section", { style: cgStyles.wrap },
      React.createElement("div", { style: cgStyles.header },
        React.createElement("h3", { style: cgStyles.title }, "التصنيفات"),
        React.createElement("a", { href: "#", style: cgStyles.viewAll }, "عرض الكل")
      ),
      React.createElement("div", { style: cgStyles.grid },
        categories.map(cat =>
          React.createElement("button", {
            key: cat.id,
            onClick: () => onSelect && onSelect(cat),
            style: { ...cgStyles.catBtn, ...(selected === cat.id ? cgStyles.catBtnActive : {}) }
          },
            React.createElement("span", { style: cgStyles.catIcon }, cat.icon),
            React.createElement("span", { style: cgStyles.catLabel }, cat.name)
          )
        )
      )
    );
  },

  StatBar: function() {
    const items = [
      { icon: "🔍", title: "بحث سريع", value: "مدينة + تصنيف" },
      { icon: "📢", title: "نشر مجاني", value: "خطوات بسيطة" },
      { icon: "💬", title: "تواصل مباشر", value: "رسائل فورية" },
    ];
    return React.createElement("div", { style: sbStyles.wrap },
      items.map((item, i) =>
        React.createElement("div", { key: i, style: { ...sbStyles.item, borderLeft: i < items.length - 1 ? "1px solid var(--color-border)" : "none" } },
          React.createElement("span", { style: { fontSize: 18 } }, item.icon),
          React.createElement("p", { style: sbStyles.itemTitle }, item.title),
          React.createElement("p", { style: sbStyles.itemVal }, item.value)
        )
      )
    );
  }
});

const lcStyles = {
  card: { position: "relative", overflow: "hidden", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", transition: "box-shadow .2s ease", cursor: "pointer" },
  imgWrap: { position: "relative", height: 160, background: "var(--color-surface-muted)", overflow: "hidden" },
  img: { width: "100%", height: "100%", objectFit: "cover", transition: "transform .3s ease" },
  imgPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" },
  badge: { position: "absolute", top: 8, right: 8, zIndex: 3, background: "var(--color-featured)", color: "var(--color-featured-text)", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, boxShadow: "0 1px 3px rgba(0,0,0,.2)" },
  gradient: { position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.6) 0%, rgba(0,0,0,.2) 40%, transparent 100%)" },
  priceOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 10px 8px", zIndex: 2 },
  priceText: { fontSize: 13, fontWeight: 700, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.5)" },
  body: { padding: "10px 12px 14px" },
  title: { margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.4, color: "var(--color-text)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  meta: { display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11, color: "var(--color-text-muted)" },
};

const cgStyles = {
  wrap: { borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", padding: 14, boxShadow: "0 1px 3px rgba(0,0,0,.08)" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  title: { margin: 0, fontSize: 13, fontWeight: 700, color: "var(--color-text)" },
  viewAll: { fontSize: 11, fontWeight: 700, color: "var(--color-brand)", textDecoration: "none" },
  grid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 },
  catBtn: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 6, border: "1px solid var(--color-border)", background: "var(--color-surface-muted)", padding: "10px 6px", cursor: "pointer", transition: "all .15s", fontFamily: "inherit" },
  catBtnActive: { borderColor: "var(--color-brand)", background: "var(--color-accent-soft)" },
  catIcon: { fontSize: 22, marginBottom: 6, display: "flex", width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 9999, background: "var(--color-accent-soft)" },
  catLabel: { fontSize: 11, color: "var(--color-text-muted)", textAlign: "center", lineHeight: 1.3 },
};

const sbStyles = {
  wrap: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" },
  item: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 8px", textAlign: "center" },
  itemTitle: { margin: 0, fontSize: 11, fontWeight: 700, color: "var(--color-text)" },
  itemVal: { margin: 0, fontSize: 10, color: "var(--color-text-muted)" },
};
