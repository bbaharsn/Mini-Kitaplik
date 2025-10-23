import React, { useEffect, useMemo, useState } from "react";

const KITAPLAR = [
  { id: 1, baslik: "Simyacı", yazar: "Paulo Coelho", kategori: "Roman" },
  { id: 2, baslik: "Körlük", yazar: "José Saramago", kategori: "Roman" },
  { id: 3, baslik: "Hayvan Çiftliği", yazar: "George Orwell", kategori: "Siyaset" },
  { id: 4, baslik: "Nutuk", yazar: "Mustafa Kemal Atatürk", kategori: "Tarih" },
  { id: 5, baslik: "Küçük Prens", yazar: "Antoine de Saint-Exupéry", kategori: "Çocuk" },
  { id: 6, baslik: "1984", yazar: "George Orwell", kategori: "Distopya" },
  { id: 7, baslik: "Don Kişot", yazar: "Miguel de Cervantes", kategori: "Klasik" },
  { id: 8, baslik: "Dönüşüm", yazar: "Franz Kafka", kategori: "Modern Klasik" },
];

function getUniqueCategories(list) {
  // Tüm kategorilere ek olarak "Tümü" seçeneğini de ekliyoruz
  return ["Tümü", ...Array.from(new Set(list.map((k) => k.kategori)))];
}

export default function App() {
  const ARAMA_KEY = "okul-kitapligi-arama";
  const KATEGORI_KEY = "okul-kitapligi-kategori";
  const FAVORI_KEY = "okul-kitapligi-favoriler";

  // State'leri localStorage'dan başlangıç değerleri ile başlat
  const [aramaMetni, setAramaMetni] = useState(() => {
    return localStorage.getItem(ARAMA_KEY) || "";
  });
  const [kategori, setKategori] = useState(() => {
    return localStorage.getItem(KATEGORI_KEY) || "Tümü";
  });
  const [favoriler, setFavoriler] = useState(() => {
    try {
      const savedFavoriler = localStorage.getItem(FAVORI_KEY);
      // Favoriler artık sadece id değil, tüm kitap objeleri olacak
      return savedFavoriler ? JSON.parse(savedFavoriler) : [];
    } catch (e) {
      console.warn("localStorage'dan favoriler okunamadı", e);
      return [];
    }
  });

  // localStorage'a kaydetme effect'leri
  useEffect(() => {
    try {
      localStorage.setItem(ARAMA_KEY, aramaMetni);
    } catch (e) {
      console.warn("localStorage'a aramaMetni yazılamadı", e);
    }
  }, [aramaMetni]);

  useEffect(() => {
    try {
      localStorage.setItem(KATEGORI_KEY, kategori);
    } catch (e) {
      console.warn("localStorage'a kategori yazılamadı", e);
    }
  }, [kategori]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORI_KEY, JSON.stringify(favoriler));
    } catch (e) {
      console.warn("localStorage'a favoriler yazılamadı", e);
    }
  }, [favoriler]);

  // Kitapları filtreleme işlemi (arama metni ve kategoriye göre)
  const filtrelenmis = useMemo(() => {
    const metin = aramaMetni.trim().toLowerCase();
    return KITAPLAR.filter(
      (k) =>
        (kategori === "Tümü" || k.kategori === kategori) &&
        k.baslik.toLowerCase().includes(metin)
    );
  }, [aramaMetni, kategori]);

  // Favori ekleme/çıkarma fonksiyonu
  function toggleFavori(kitapObjesi) {
    setFavoriler((prev) =>
      prev.some(fav => fav.id === kitapObjesi.id)
        ? prev.filter((fav) => fav.id !== kitapObjesi.id)
        : [...prev, kitapObjesi]
    );
  }

  // Kategorileri dinamik olarak alıyoruz
  const kategoriler = useMemo(() => getUniqueCategories(KITAPLAR), []);

  return (
    <div style={styles.page}>
      <div style={styles.app}>
        <header style={styles.header}>
          <h1>📚 Okul Kulübü Kitaplığı</h1>
          <p style={styles.headerDescription}>Arama, kategori ve favoriler tarayıcıya kaydedilir.</p>
        </header>

        <div style={styles.controls}>
          <AramaCubugu value={aramaMetni} onChange={setAramaMetni} />
          <KategoriFiltre kategoriler={kategoriler} value={kategori} onChange={setKategori} />
        </div>

        <main style={styles.mainContent}>
          <KitapListe
            kitaplar={filtrelenmis}
            favoriler={favoriler}
            onToggleFavori={toggleFavori}
          />
          <FavoriPaneli favoriler={favoriler} onClear={() => setFavoriler([])} onToggleFavori={toggleFavori} />
        </main>

        <footer style={styles.footer}>
          <small>
            Arama: "{aramaMetni || ' '}" — Kategori: {kategori} — Toplam favori: {favoriler.length}
          </small>
        </footer>
      </div>
    </div>
  );
}

// --- Bileşenler ---

function AramaCubugu({ value, onChange }) {
  return (
    <div style={styles.searchBox}>
      <label style={styles.controlLabel}>Ara:</label>
      <input
        type="text"
        placeholder="Kitap başlığına göre ara..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </div>
  );
}

function KategoriFiltre({ kategoriler, value, onChange }) {
  return (
    <div style={styles.categoryBox}>
      <label style={styles.controlLabel}>Kategori:</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.select}>
        {kategoriler.map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>
    </div>
  );
}

function KitapListe({ kitaplar, favoriler, onToggleFavori }) {
  if (!kitaplar.length) return <div style={styles.emptyListMessage}>Eşleşen kitap yok.</div>;
  return (
    <div style={styles.kitapListesi}>
      {kitaplar.map((k) => (
        <KitapKarti
          key={k.id}
          {...k}
          favorideMi={favoriler.some(fav => fav.id === k.id)}
          onToggle={() => onToggleFavori(k)}
        />
      ))}
    </div>
  );
}

function KitapKarti({ baslik, yazar, kategori, id, favorideMi, onToggle }) {
  return (
    <div
      style={{
        ...styles.kitapKarti,
        boxShadow: favorideMi ? "0 0 15px #ff8fab" : "0 0 8px rgba(0,0,0,0.2)", // Favori olunca daha belirgin gölge
        border: favorideMi ? "1px solid #ff8fab" : "1px solid rgba(255,255,255,0.1)", // Favori olunca kenarlık
      }}
    >
      <h3 style={styles.kitapBaslik}>{baslik}</h3>
      <p style={styles.kitapYazar}>{yazar}</p>
      <span style={styles.kitapKategori}>{kategori}</span>
      <button
        onClick={onToggle}
        style={{
          ...styles.kitapFavButton,
          background: favorideMi ? "#ff8fab" : "#4A4A4A", // Favori olunca pembe, değilse gri
        }}
      >
        {favorideMi ? "💔 Çıkar" : "💖 Favori"}
      </button>
    </div>
  );
}

function FavoriPaneli({ favoriler, onClear, onToggleFavori }) {
  return (
    <div style={styles.favPanelContainer}>
      <div style={styles.favPanelHeader}>
        <h2 style={styles.favPanelTitle}>💖 Favoriler ({favoriler.length})</h2>
        <button style={styles.clearFavButton} onClick={onClear}>Temizle</button>
      </div>
      <div style={styles.favList}>
        {favoriler.length === 0 ? (
          <div style={styles.emptyFavMessage}>Henüz favori yok.</div>
        ) : (
          <ul style={styles.favUl}>
            {favoriler.map((k) => (
              <li key={k.id} style={styles.favListItem}>
                {k.baslik} — {k.yazar}
                <button
                  onClick={() => onToggleFavori(k)} // Favoriden çıkarma butonu
                  style={styles.favRemoveButton}
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


// --- Stil Objeleri ---
const styles = {
  page: {
    background: "linear-gradient(to bottom right, #2b1055, #7597de)",
    minHeight: "100vh",
    color: "#e6eef8",
    padding: 24,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  app: {
    maxWidth: 1200, // Genişletilmiş maksimum genişlik
    width: "100%",
    margin: "0 auto",
    background: "rgba(0,0,0,0.4)", // Daha şeffaf ve koyu arka plan
    borderRadius: 12,
    padding: 30, // Daha fazla iç boşluk
    boxShadow: "0 15px 50px rgba(0,0,0,0.7)",
  },
  header: {
    textAlign: "center",
    marginBottom: 25,
  },
  headerDescription: {
    marginTop: 8,
    color: "#b0c4de",
    fontSize: "0.9em",
  },
  controls: {
    display: "flex",
    gap: 20, // Kontroller arasında daha fazla boşluk
    alignItems: "center",
    marginBottom: 25,
    flexWrap: "wrap",
    justifyContent: "center", // Ortala
  },
  controlLabel: {
    marginRight: 10,
    fontSize: "1.1em",
    fontWeight: "bold",
    color: "#add8e6",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
  },
  input: {
    padding: "10px 15px",
    minWidth: 280,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: "1em",
    outline: "none",
    "&:focus": {
      borderColor: "#7597de",
      boxShadow: "0 0 0 2px rgba(117,151,222,0.5)",
    },
  },
  categoryBox: {
    display: "flex",
    alignItems: "center",
  },
  select: {
    padding: "10px 15px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: "1em",
    outline: "none",
    cursor: "pointer",
    "&:focus": {
      borderColor: "#7597de",
      boxShadow: "0 0 0 2px rgba(117,151,222,0.5)",
    },
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr", // Kitap listesi ve favori paneli yanyana
    gap: 30, // Ana içerik bölümleri arasında daha fazla boşluk
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: 30,
  },
  kitapListesi: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", // Daha büyük kartlar
    gap: 20,
  },
  emptyListMessage: {
    padding: 20,
    textAlign: "center",
    color: "#b0c4de",
    fontSize: "1.1em",
    gridColumn: "1 / -1", // Tüm sütunları kapla
  },
  kitapKarti: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 20px rgba(0,0,0,0.4)",
    },
  },
  kitapBaslik: {
    fontSize: "1.4em",
    marginBottom: 8,
    color: "#fff",
  },
  kitapYazar: {
    fontSize: "0.95em",
    color: "#b0c4de",
    marginBottom: 8,
  },
  kitapKategori: {
    background: "rgba(255,255,255,0.15)",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: "0.85em",
    color: "#add8e6",
    marginBottom: 15,
  },
  kitapFavButton: {
    marginTop: "auto", // Kart içinde butonu alta it
    padding: "10px 15px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    color: "white",
    fontSize: "1em",
    transition: "background 0.3s ease, transform 0.2s ease",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  favPanelContainer: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
    maxHeight: "600px", // Sabit yükseklik ve taşma
    overflowY: "auto",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  favPanelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  favPanelTitle: {
    fontSize: "1.3em",
    color: "#ff8fab",
    margin: 0,
  },
  clearFavButton: {
    padding: "8px 12px",
    fontSize: "0.9em",
    cursor: "pointer",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    transition: "background 0.3s ease",
    "&:hover": {
      background: "rgba(255,255,255,0.2)",
    },
  },
  favList: {
    marginTop: 10,
  },
  emptyFavMessage: {
    color: "#b0c4de",
    padding: 10,
    textAlign: "center",
  },
  favUl: {
    paddingLeft: 0,
    margin: 0,
    listStyle: "none",
  },
  favListItem: {
    background: "rgba(255,255,255,0.1)",
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.95em",
    "&:last-child": {
      marginBottom: 0,
    },
  },
  favRemoveButton: {
    marginLeft: 10,
    background: "transparent",
    border: "none",
    color: "#ff8fab",
    cursor: "pointer",
    fontSize: "1em",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    color: "#b0c4de",
    fontSize: "0.85em",
  },
};