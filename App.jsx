import { useState, useEffect, useRef } from "react";

const CUISINES = [
  "Any", "American", "Italian", "Mexican", "Japanese", "Chinese",
  "Thai", "Indian", "Mediterranean", "Seafood", "BBQ", "Pizza",
  "Burgers", "Sushi", "Vietnamese", "Greek", "French", "Cuban"
];
const TYPES = ["Any", "Restaurant", "Bar", "Pub", "Cafe", "Brewery", "Food Truck"];
const PRICES = ["Any", "$", "$$", "$$$", "$$$$"];
const PRICE_MAP = { "Any": "", "$": "1", "$$": "2", "$$$": "3", "$$$$": "4" };
const RADIUS_OPTIONS = [
  { label: "1 mile", value: 1609 },
  { label: "3 miles", value: 4828 },
  { label: "5 miles", value: 8047 },
  { label: "10 miles", value: 16093 },
];
const SPIN_MESSAGES = [
  "Spinning the wheel...", "Finding your next meal...",
  "Let fate decide...", "Rolling the dice...", "Destiny awaits..."
];

// ─── Spin Wheel Canvas ───────────────────────────────────────────────────────
function SpinWheel({ spinning }) {
  const canvasRef = useRef(null);
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const colors = ["#0a4f6e","#1a7a9a","#e8a838","#d45f2e","#2d9e6b","#7b3f9e","#c94040","#3a6bbf"];
  const labels = ["🍕","🍣","🍔","🌮","🍜","🥗","🍺","🎲"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 160, cx = size / 2, cy = size / 2, r = size / 2 - 4, slices = 8;

    function draw(angle) {
      ctx.clearRect(0, 0, size, size);
      for (let i = 0; i < slices; i++) {
        const start = angle + (i / slices) * Math.PI * 2;
        const end = angle + ((i + 1) / slices) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, end);
        ctx.fillStyle = colors[i]; ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(start + (end - start) / 2);
        ctx.textAlign = "right"; ctx.font = "18px serif";
        ctx.fillText(labels[i], r - 10, 6); ctx.restore();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = "#0d1f2d"; ctx.fill();
      ctx.strokeStyle = "#e8a838"; ctx.lineWidth = 2; ctx.stroke();
    }

    if (spinning) {
      let speed = 0.25;
      const animate = () => { angleRef.current += speed; speed = Math.min(speed + 0.01, 0.35); draw(angleRef.current); rafRef.current = requestAnimationFrame(animate); };
      animate();
    } else {
      cancelAnimationFrame(rafRef.current);
      let speed = 0.3;
      const slowStop = () => { if (speed > 0.01) { angleRef.current += speed; speed *= 0.96; draw(angleRef.current); rafRef.current = requestAnimationFrame(slowStop); } else { draw(angleRef.current); } };
      slowStop();
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [spinning]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <canvas ref={canvasRef} width={160} height={160} style={{ borderRadius: "50%", boxShadow: "0 0 30px rgba(232,168,56,0.4)" }} />
      <div style={{ position: "absolute", top: "50%", right: -12, transform: "translateY(-50%)", width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderRight: "18px solid #e8a838" }} />
    </div>
  );
}

// ─── Photo Gallery ───────────────────────────────────────────────────────────
function PhotoGallery({ photos }) {
  const [active, setActive] = useState(0);
  if (!photos || photos.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ width: "100%", height: 200, borderRadius: 12, overflow: "hidden", marginBottom: 8, position: "relative", background: "#0a1e2e" }}>
        <img src={photos[active]} alt="Restaurant" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
        {photos.length > 1 && (
          <>
            <button onClick={() => setActive(p => (p - 1 + photos.length) % photos.length)} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>‹</button>
            <button onClick={() => setActive(p => (p + 1) % photos.length)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>›</button>
            <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
              {photos.map((_, i) => <div key={i} onClick={() => setActive(i)} style={{ width: 6, height: 6, borderRadius: "50%", cursor: "pointer", background: i === active ? "#e8a838" : "rgba(255,255,255,0.4)" }} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Restaurant Card ─────────────────────────────────────────────────────────
function RestaurantCard({ place, onNext }) {
  const stars = place.rating ? "★".repeat(Math.round(place.rating)) + "☆".repeat(5 - Math.round(place.rating)) : "";
  const priceDisplay = place.price_level ? "$".repeat(place.price_level) : "?";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + (place.vicinity || ""))}`;
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(place.name + " " + (place.vicinity || ""))}`;

  return (
    <div style={{ background: "linear-gradient(135deg, #0d2535 0%, #0a3348 100%)", border: "1px solid rgba(232,168,56,0.4)", borderRadius: 16, padding: 20, maxWidth: 400, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#e8a838", textTransform: "uppercase", marginBottom: 4 }}>Your Pick</div>
          <h2 style={{ margin: 0, fontSize: 22, color: "#f0f4f8", lineHeight: 1.2 }}>{place.name}</h2>
        </div>
        <div style={{ background: "rgba(232,168,56,0.15)", border: "1px solid rgba(232,168,56,0.3)", borderRadius: 8, padding: "4px 10px", fontSize: 16, color: "#e8a838", marginLeft: 12 }}>{priceDisplay}</div>
      </div>

      <PhotoGallery photos={place.photos} />

      {place.vicinity && <div style={{ color: "#8baab8", fontSize: 13, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><span>📍</span> {place.vicinity}</div>}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        {place.rating && <div style={{ color: "#e8a838", fontSize: 13 }}>{place.rating.toFixed(1)} <span style={{ letterSpacing: -1 }}>{stars}</span><span style={{ color: "#8baab8", marginLeft: 4 }}>({place.user_ratings_total?.toLocaleString() || 0})</span></div>}
        {place.opening_hours && <div style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: place.opening_hours.open_now ? "rgba(45,158,107,0.2)" : "rgba(201,64,64,0.2)", color: place.opening_hours.open_now ? "#2d9e6b" : "#c94040", border: `1px solid ${place.opening_hours.open_now ? "rgba(45,158,107,0.4)" : "rgba(201,64,64,0.4)"}` }}>{place.opening_hours.open_now ? "Open Now" : "Closed"}</div>}
      </div>

      {place.types && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>{place.types.slice(0, 3).filter(t => !["point_of_interest","establishment","food"].includes(t)).map(t => <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(26,122,154,0.2)", color: "#1a7a9a", border: "1px solid rgba(26,122,154,0.3)", textTransform: "capitalize" }}>{t.replace(/_/g, " ")}</span>)}</div>}

      {place.menu_highlights && place.menu_highlights.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, color: "#8baab8", textTransform: "uppercase", marginBottom: 8 }}>Must Try</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {place.menu_highlights.map((item, i) => <span key={i} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "rgba(232,168,56,0.08)", color: "#e8c87a", border: "1px solid rgba(232,168,56,0.2)" }}>🍽 {item}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={onNext} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#8baab8", cursor: "pointer", fontSize: 13 }}>🔄 Spin Again</button>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #e8a838, #d45f2e)", color: "#0d1f2d", cursor: "pointer", fontSize: 13, fontWeight: 700, textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>📍 Directions</a>
      </div>

      <a href={place.website || searchUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", padding: "11px 0", borderRadius: 10, textAlign: "center", border: "1px solid rgba(26,122,154,0.4)", background: "rgba(26,122,154,0.1)", color: "#1a9acc", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
        🌐 {place.website ? "Visit Website" : "Search Online"}
      </a>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function MealWheel() {
  const [cuisine, setCuisine] = useState("Any");
  const [type, setType] = useState("Any");
  const [price, setPrice] = useState("Any");
  const [radius, setRadius] = useState(4828);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [spinMsg, setSpinMsg] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Location state
  const [gpsLocation, setGpsLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [locationMode, setLocationMode] = useState("detecting"); // detecting | gps | manual | manualEdit
  const [gpsError, setGpsError] = useState(false);

  // On mount — try GPS
  useEffect(() => {
    if (!navigator.geolocation) { setLocationMode("manualEdit"); setGpsError(true); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLabel(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setLocationMode("gps");
      },
      () => { setLocationMode("manualEdit"); setGpsError(true); },
      { timeout: 8000 }
    );
  }, []);

  const locationReady = locationMode === "gps" || locationMode === "manual";
  const locationString = locationMode === "gps"
    ? `coordinates ${gpsLocation?.lat}, ${gpsLocation?.lng}`
    : manualInput;

  const buildKeyword = () => {
    const parts = [];
    if (cuisine !== "Any") parts.push(cuisine);
    if (type !== "Any") parts.push(type);
    if (parts.length === 0) parts.push("restaurant");
    return parts.join(" ");
  };

  const spin = async () => {
    if (!locationReady) return;
    setSpinning(true); setResult(null); setError(null);
    setSpinMsg(SPIN_MESSAGES[Math.floor(Math.random() * SPIN_MESSAGES.length)]);

    try {
      const keyword = buildKeyword();
      const priceVal = PRICE_MAP[price];
      const radiusMiles = RADIUS_OPTIONS.find(r => r.value === radius)?.label || "3 miles";

      const prompt = `You are a restaurant finder. Return a JSON array of 10 real, specific restaurants/bars/eateries near "${locationString}".

Search criteria:
- Location: ${locationString}
- Search radius: ${radiusMiles}
- Type/Cuisine: ${keyword}
${priceVal ? `- Price level (1=cheap, 4=expensive): ${priceVal}` : ""}

Return ONLY a valid JSON array. Each object must have:
- name (string): real restaurant name
- vicinity (string): real street address
- rating (number): realistic 1.0-5.0
- user_ratings_total (number): realistic review count
- price_level (number): 1-4
- opening_hours (object): { open_now: true or false }
- types (array): e.g. ["restaurant"], ["bar"], ["cafe"]
- website (string or null): real website URL if known, otherwise null
- menu_highlights (array of 3-5 strings): popular or signature dishes
- photos (array of 2-4 strings): Unsplash URLs matching the food/vibe. Format: https://images.unsplash.com/photo-[ID]?w=600&q=80 using real valid photo IDs for the cuisine type.

Only return the JSON array, no markdown, no explanation.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const text = data.content.map(i => i.type === "text" ? i.text : "").filter(Boolean).join("\n");
      const clean = text.replace(/```json|```/g, "").trim();
      const places = JSON.parse(clean);
      if (!places || places.length === 0) throw new Error("No results");

      await new Promise(r => setTimeout(r, 2000));
      const picked = places[Math.floor(Math.random() * places.length)];
      setResult(picked);
      setHistory(prev => [picked, ...prev].slice(0, 10));
    } catch {
      setError("Couldn't find results. Try different filters or check your connection.");
    } finally {
      setSpinning(false);
    }
  };

  const FilterPill = ({ options, value, onChange, label }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, letterSpacing: 1.5, color: "#8baab8", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: value === o ? "1px solid #e8a838" : "1px solid rgba(255,255,255,0.1)", background: value === o ? "rgba(232,168,56,0.15)" : "rgba(255,255,255,0.04)", color: value === o ? "#e8a838" : "#8baab8", transition: "all 0.15s" }}>{o}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #060f18 0%, #0a1e2e 50%, #061520 100%)", color: "#f0f4f8", fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 16px" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input::placeholder { color: #4a6a7a; }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#e8a838", textTransform: "uppercase", marginBottom: 8 }}>Where to eat?</div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, background: "linear-gradient(135deg, #f0f4f8, #e8a838)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>The Meal<br />Wheel</h1>
          <p style={{ color: "#8baab8", fontSize: 14, marginTop: 8 }}>Let fate pick your next meal</p>
        </div>

        {/* Wheel */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <SpinWheel spinning={spinning} />
        </div>

        {/* Location Box */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, color: "#8baab8", textTransform: "uppercase", marginBottom: 10 }}>📍 Your Location</div>

          {locationMode === "detecting" && (
            <div style={{ color: "#e8a838", fontSize: 14, animation: "pulse 1.5s infinite" }}>Detecting your location...</div>
          )}

          {locationMode === "gps" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ color: "#2d9e6b", fontSize: 14, fontWeight: 600 }}>✓ Using your live GPS location</div>
              <button onClick={() => setLocationMode("manualEdit")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8baab8", cursor: "pointer", fontSize: 12, padding: "4px 10px" }}>Change</button>
            </div>
          )}

          {locationMode === "manual" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ color: "#2d9e6b", fontSize: 14, fontWeight: 600 }}>✓ {manualInput}</div>
              <button onClick={() => setLocationMode("manualEdit")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8baab8", cursor: "pointer", fontSize: 12, padding: "4px 10px" }}>Change</button>
            </div>
          )}

          {locationMode === "manualEdit" && (
            <div>
              {gpsError && <div style={{ fontSize: 12, color: "#8baab8", marginBottom: 8 }}>GPS unavailable — enter your location below.</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && manualInput.trim()) { setLocationMode("manual"); setError(null); }}}
                  placeholder="City, State or Zip Code"
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 10, fontSize: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,168,56,0.4)", color: "#f0f4f8", outline: "none" }}
                  autoFocus
                />
                <button onClick={() => { if (manualInput.trim()) { setLocationMode("manual"); setError(null); }}} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #e8a838, #d45f2e)", color: "#0d1f2d", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Set</button>
              </div>
              {locationMode === "manualEdit" && !gpsError && (
                <button onClick={() => {
                  setLocationMode("detecting");
                  navigator.geolocation.getCurrentPosition(
                    pos => { setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationMode("gps"); },
                    () => { setLocationMode("manualEdit"); setGpsError(true); }
                  );
                }} style={{ marginTop: 8, background: "none", border: "none", color: "#1a9acc", cursor: "pointer", fontSize: 12, padding: 0 }}>
                  🔄 Try GPS again
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <FilterPill options={TYPES} value={type} onChange={setType} label="Type" />
          <FilterPill options={CUISINES} value={cuisine} onChange={setCuisine} label="Cuisine" />
          <FilterPill options={PRICES} value={price} onChange={setPrice} label="Price" />
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: "#8baab8", textTransform: "uppercase", marginBottom: 8 }}>Distance</div>
            <div style={{ display: "flex", gap: 6 }}>
              {RADIUS_OPTIONS.map(r => <button key={r.value} onClick={() => setRadius(r.value)} style={{ flex: 1, padding: "6px 0", borderRadius: 20, fontSize: 12, cursor: "pointer", border: radius === r.value ? "1px solid #e8a838" : "1px solid rgba(255,255,255,0.1)", background: radius === r.value ? "rgba(232,168,56,0.15)" : "rgba(255,255,255,0.04)", color: radius === r.value ? "#e8a838" : "#8baab8", transition: "all 0.15s" }}>{r.label}</button>)}
            </div>
          </div>
        </div>

        {/* Spin Button */}
        <button onClick={spin} disabled={spinning || !locationReady} style={{ width: "100%", padding: "18px 0", borderRadius: 14, border: "none", background: (spinning || !locationReady) ? "rgba(232,168,56,0.3)" : "linear-gradient(135deg, #e8a838, #d45f2e)", color: (spinning || !locationReady) ? "rgba(13,31,45,0.5)" : "#0d1f2d", fontSize: 18, fontWeight: 800, cursor: (spinning || !locationReady) ? "not-allowed" : "pointer", marginBottom: 20, letterSpacing: 1, transition: "all 0.2s", boxShadow: (spinning || !locationReady) ? "none" : "0 4px 20px rgba(232,168,56,0.3)" }}>
          {spinning ? spinMsg : "🎲 Spin the Wheel"}
        </button>

        {/* Error */}
        {error && <div style={{ background: "rgba(201,64,64,0.1)", border: "1px solid rgba(201,64,64,0.3)", borderRadius: 12, padding: 16, marginBottom: 20, color: "#c94040", fontSize: 14, textAlign: "center" }}>{error}</div>}

        {/* Result */}
        {result && !spinning && <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}><RestaurantCard place={result} onNext={spin} /></div>}

        {/* History */}
        {history.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <button onClick={() => setShowHistory(!showHistory)} style={{ background: "none", border: "none", color: "#8baab8", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              {showHistory ? "▼" : "▶"} Past spins ({history.length})
            </button>
            {showHistory && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map((h, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, color: "#f0f4f8" }}>{h.name}</div>
                      <div style={{ fontSize: 12, color: "#8baab8" }}>{h.vicinity}</div>
                    </div>
                    <div style={{ color: "#e8a838", fontSize: 13 }}>{"$".repeat(h.price_level || 1)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
