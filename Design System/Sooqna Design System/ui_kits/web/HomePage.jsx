// Sooqna HomePage component

Object.assign(window, {
  HomePage: function({ onNavigate }) {
    const [activeHero, setActiveHero] = React.useState(0);
    const [selectedCat, setSelectedCat] = React.useState(null);

    React.useEffect(() => {
      const t = setInterval(() => setActiveHero(h => (h + 1) % 2), 7000);
      return () => clearInterval(t);
    }, []);

    const heroSlides = ["../../assets/hero-slide-1.png", "../../assets/hero-slide-2.png"];

    const categories = [
      { id: "cars", name: "سيارات", icon: "🚗" },
      { id: "real-estate", name: "عقارات", icon: "🏠" },
      { id: "electronics", name: "موبايلات", icon: "📱" },
      { id: "furniture", name: "أثاث", icon: "🛋️" },
      { id: "jobs", name: "وظائف", icon: "💼" },
      { id: "fashion", name: "أزياء", icon: "👗" },
      { id: "kids", name: "أطفال", icon: "🧸" },
      { id: "sports", name: "رياضة", icon: "⚽" },
      { id: "services", name: "خدمات", icon: "🔧" },
      { id: "other", name: "أخرى", icon: "📦" },
    ];

    const listings = [
      { id: 1, title: "شقة للإيجار في عمان — مفروشة ٣ غرف نوم", price: "١٢٠ د.أ / شهر", city: "عمّان", featured: true, image: null },
      { id: 2, title: "تويوتا كامري ٢٠٢٠ فل كامل بدون حوادث", price: "٨٥٠٠ د.أ", city: "الزرقاء", featured: false, image: null },
      { id: 3, title: "آيفون ١٥ برو ماكس ٢٥٦ جيجا — جديد بضمان", price: "تواصل معنا", city: "إربد", featured: false, image: null },
      { id: 4, title: "كنبة ركنية جلد طبيعي حالة ممتازة", price: "٣٥٠ د.أ", city: "عمّان", featured: false, image: null },
      { id: 5, title: "مطلوب محاسب للعمل في شركة تجارية", price: "راتب مجزي", city: "عمّان", featured: true, image: null },
      { id: 6, title: "دراجة هوائية جبلية ٢٧ سرعة — مستعملة", price: "١٨٠ د.أ", city: "الرصيفة", featured: false, image: null },
    ];

    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 28 } },
      // Hero section
      React.createElement("section", { style: hpStyles.heroSection },
        React.createElement("div", { style: { position: "relative", height: 235, overflow: "hidden" } },
          heroSlides.map((src, i) =>
            React.createElement("img", {
              key: src, src,
              alt: `hero ${i + 1}`,
              style: { ...hpStyles.heroImg, opacity: i === activeHero ? 1 : 0, transform: i === activeHero ? "translateX(0)" : i < activeHero ? "translateX(100%)" : "translateX(-100%)" }
            })
          ),
          React.createElement("div", { style: hpStyles.heroOverlay }),
          React.createElement("div", { style: hpStyles.heroContent },
            React.createElement("h2", { style: hpStyles.heroTitle }, "اكتشف أفضل الإعلانات بسهولة وأمان"),
            React.createElement("p", { style: hpStyles.heroSub }, "ابحث حسب المدينة أو التصنيف ووصل لنتيجتك بسرعة"),
            React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" } },
              React.createElement("button", { style: hpStyles.heroBtn, onClick: () => onNavigate && onNavigate("listings") }, "تصفح الإعلانات"),
              React.createElement("button", { style: hpStyles.heroGhostBtn, onClick: () => onNavigate && onNavigate("submit") }, "أضف إعلان")
            )
          ),
          React.createElement("div", { style: hpStyles.dots },
            heroSlides.map((_, i) =>
              React.createElement("button", {
                key: i,
                onClick: () => setActiveHero(i),
                style: { ...hpStyles.dot, background: i === activeHero ? "#fff" : "rgba(255,255,255,.4)", borderColor: i === activeHero ? "#fff" : "rgba(255,255,255,.7)" }
              })
            )
          )
        ),
        React.createElement(window.StatBar)
      ),

      // Category grid
      React.createElement(window.CategoryGrid, { categories, selected: selectedCat, onSelect: c => { setSelectedCat(c.id); onNavigate && onNavigate("listings"); } }),

      // Listings
      React.createElement("section", { style: { display: "grid", gap: 16, gridTemplateColumns: "240px 1fr" } },
        // Sidebar
        React.createElement("aside", { style: hpStyles.sidebar },
          React.createElement("div", { style: hpStyles.sidebarTitle }, "التصنيفات"),
          React.createElement("ul", { style: { margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 } },
            categories.map(cat =>
              React.createElement("li", { key: cat.id, style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-text-muted)" } },
                React.createElement("span", { style: { width: 10, height: 10, borderRadius: 9999, border: "1px solid var(--color-chip-border)", flexShrink: 0 } }),
                cat.name
              )
            )
          )
        ),
        // Grid
        React.createElement("div", null,
          React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 } },
            React.createElement("h3", { style: { margin: 0, fontSize: 22, fontWeight: 700 } }, "الإعلانات"),
            React.createElement("button", { style: hpStyles.viewAllBtn, onClick: () => onNavigate && onNavigate("listings") }, "عرض الكل")
          ),
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 } },
            listings.map(l => React.createElement(window.ListingCard, { key: l.id, listing: l, onNavigate }))
          )
        )
      )
    );
  }
});

const hpStyles = {
  heroSection: { overflow: "hidden", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", boxShadow: "0 1px 3px rgba(0,0,0,.08)" },
  heroImg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "all .7s ease-in-out" },
  heroOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,.45)" },
  heroContent: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center", color: "#fff", padding: 16 },
  heroTitle: { margin: 0, fontSize: 22, fontWeight: 700 },
  heroSub: { margin: 0, fontSize: 13, opacity: .9 },
  heroBtn: { background: "var(--color-brand)", color: "#fff", border: "none", borderRadius: 9999, padding: "8px 20px", fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" },
  heroGhostBtn: { background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.7)", borderRadius: 9999, padding: "8px 20px", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" },
  dots: { position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 9999, border: "1px solid", cursor: "pointer", transition: "all .2s" },
  sidebar: { borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", padding: 14, height: "fit-content", boxShadow: "0 1px 3px rgba(0,0,0,.08)" },
  sidebarTitle: { borderRadius: 9999, background: "var(--color-brand)", color: "#fff", padding: "7px 14px", fontSize: 13, fontWeight: 700 },
  viewAllBtn: { background: "var(--color-brand)", color: "#fff", border: "none", borderRadius: 9999, padding: "6px 14px", fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" },
};
