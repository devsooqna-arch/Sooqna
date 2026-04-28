// Sooqna ListingsPage component

Object.assign(window, {
  ListingsPage: function({ onNavigate }) {
    const [selectedCat, setSelectedCat] = React.useState(null);
    const [sort, setSort] = React.useState("newest");
    const [search, setSearch] = React.useState("");

    const categories = [
      { id: "all", name: "كل التصنيفات" },
      { id: "cars", name: "سيارات" },
      { id: "real-estate", name: "عقارات" },
      { id: "electronics", name: "موبايلات وإلكترونيات" },
      { id: "furniture", name: "أثاث ومفروشات" },
      { id: "jobs", name: "وظائف" },
      { id: "fashion", name: "أزياء وملابس" },
      { id: "kids", name: "مستلزمات الأطفال" },
      { id: "sports", name: "رياضة وهوايات" },
      { id: "services", name: "خدمات" },
      { id: "other", name: "أخرى" },
    ];

    const allListings = [
      { id: 1, title: "شقة للإيجار في عمان — مفروشة ٣ غرف نوم", price: "١٢٠ د.أ / شهر", city: "عمّان", featured: true, cat: "real-estate", image: null },
      { id: 2, title: "تويوتا كامري ٢٠٢٠ فل كامل بدون حوادث", price: "٨٥٠٠ د.أ", city: "الزرقاء", featured: false, cat: "cars", image: null },
      { id: 3, title: "آيفون ١٥ برو ماكس ٢٥٦ جيجا — جديد بضمان", price: "تواصل معنا", city: "إربد", featured: false, cat: "electronics", image: null },
      { id: 4, title: "كنبة ركنية جلد طبيعي حالة ممتازة", price: "٣٥٠ د.أ", city: "عمّان", featured: false, cat: "furniture", image: null },
      { id: 5, title: "مطلوب محاسب للعمل في شركة تجارية كبرى", price: "راتب مجزي", city: "عمّان", featured: true, cat: "jobs", image: null },
      { id: 6, title: "دراجة هوائية جبلية ٢٧ سرعة — مستعملة بحالة جيدة", price: "١٨٠ د.أ", city: "الرصيفة", featured: false, cat: "sports", image: null },
      { id: 7, title: "لابتوب HP Envy i7 الجيل الثالث عشر ١٦ جيجا رام", price: "٦٥٠ د.أ", city: "عمّان", featured: false, cat: "electronics", image: null },
      { id: 8, title: "فيلا للبيع — ٤ غرف + حديقة خاصة في دابوق", price: "٢٥٠,٠٠٠ د.أ", city: "عمّان", featured: true, cat: "real-estate", image: null },
      { id: 9, title: "خياطة وتفصيل ملابس نسائية — خدمة احترافية", price: "يبدأ من ٢٠ د.أ", city: "إربد", featured: false, cat: "services", image: null },
    ];

    const filtered = allListings.filter(l => {
      if (selectedCat && selectedCat !== "all" && l.cat !== selectedCat) return false;
      if (search && !l.title.includes(search) && !l.city.includes(search)) return false;
      return true;
    });

    return React.createElement("div", { style: { display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 } },
      // Sidebar
      React.createElement("aside", { style: lpStyles.sidebar },
        React.createElement("div", { style: lpStyles.sidebarTitle }, "التصنيف"),
        React.createElement("div", { style: { marginTop: 10, display: "flex", flexDirection: "column", gap: 2 } },
          categories.map(cat =>
            React.createElement("button", {
              key: cat.id,
              onClick: () => setSelectedCat(cat.id === "all" ? null : cat.id),
              style: {
                ...lpStyles.catBtn,
                background: (cat.id === "all" && !selectedCat) || selectedCat === cat.id ? "var(--color-accent-soft)" : "transparent",
                color: (cat.id === "all" && !selectedCat) || selectedCat === cat.id ? "var(--color-brand)" : "var(--color-text-muted)",
                fontWeight: (cat.id === "all" && !selectedCat) || selectedCat === cat.id ? 600 : 400,
              }
            },
              React.createElement("span", {
                style: {
                  width: 10, height: 10, borderRadius: 9999, flexShrink: 0,
                  background: (cat.id === "all" && !selectedCat) || selectedCat === cat.id ? "var(--color-brand)" : "transparent",
                  border: "1px solid var(--color-chip-border)"
                }
              }),
              cat.name
            )
          )
        )
      ),
      // Main
      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
        // Toolbar
        React.createElement("div", { style: lpStyles.toolbar },
          React.createElement("p", { style: { margin: 0, fontSize: 12, color: "var(--color-text-muted)" } },
            `${filtered.length} إعلان`
          ),
          React.createElement("select", {
            value: sort,
            onChange: e => setSort(e.target.value),
            style: lpStyles.sortSelect
          },
            React.createElement("option", { value: "newest" }, "الأحدث أولاً"),
            React.createElement("option", { value: "price_asc" }, "السعر: الأقل أولاً"),
            React.createElement("option", { value: "price_desc" }, "السعر: الأعلى أولاً")
          )
        ),
        // Grid
        filtered.length > 0
          ? React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 } },
              filtered.map(l =>
                React.createElement("div", { key: l.id, onClick: () => onNavigate && onNavigate("detail", l), style: { cursor: "pointer" } },
                  React.createElement(window.ListingCard, { listing: l })
                )
              )
            )
          : React.createElement("div", { style: lpStyles.empty },
              React.createElement("p", { style: { color: "var(--color-text-muted)", fontSize: 13 } }, "لا توجد إعلانات مطابقة حاليًا."),
              React.createElement("button", { onClick: () => setSelectedCat(null), style: lpStyles.clearBtn }, "عرض كل الإعلانات")
            ),
        // Pagination
        React.createElement("div", { style: lpStyles.pagination },
          React.createElement("button", { style: lpStyles.pageBtn, disabled: true }, "السابق"),
          React.createElement("button", { style: { ...lpStyles.pageBtn, background: "var(--color-brand)", color: "#fff", borderColor: "var(--color-brand)" } }, "1"),
          React.createElement("button", { style: lpStyles.pageBtn }, "2"),
          React.createElement("button", { style: lpStyles.pageBtn }, "3"),
          React.createElement("button", { style: lpStyles.pageBtn }, "التالي")
        )
      )
    );
  }
});

const lpStyles = {
  sidebar: { borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", padding: 14, height: "fit-content", boxShadow: "0 1px 3px rgba(0,0,0,.08)" },
  sidebarTitle: { borderRadius: 9999, background: "var(--color-brand)", color: "#fff", padding: "7px 14px", fontSize: 13, fontWeight: 700 },
  catBtn: { display: "flex", alignItems: "center", gap: 8, borderRadius: 6, padding: "6px 8px", cursor: "pointer", fontSize: 13, border: "none", fontFamily: "inherit", textAlign: "right", transition: "all .15s", width: "100%" },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  sortSelect: { borderRadius: 9999, border: "1px solid var(--color-border)", background: "var(--color-input-bg)", padding: "6px 14px", fontSize: 12, fontFamily: "inherit", color: "var(--color-text)", outline: "none" },
  empty: { borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-surface)", padding: "40px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  clearBtn: { background: "var(--color-brand)", color: "#fff", border: "none", borderRadius: 9999, padding: "8px 20px", fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" },
  pagination: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  pageBtn: { borderRadius: 9999, border: "1px solid var(--color-border)", background: "transparent", padding: "4px 14px", fontSize: 12, fontFamily: "inherit", color: "var(--color-text)", cursor: "pointer", minWidth: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" },
};
