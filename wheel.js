/* ============================================================
   KONFIGURATION — hier kannst du alles anpassen
   ============================================================
   label       : Text auf dem Segment
   subtext     : Wird erst nach dem Drehen sichtbar
   probability : Relative Gewichtung (z.B. 3 = dreimal so
                 wahrscheinlich wie 1). Muss nicht 100 ergeben.
   ============================================================ */
const segments = [
  {
    label:       "Mission Limburg",
    subtext:     "",
    probability: 3,
  },
  {
    label:       "Mission Heidelberg",
    subtext:     "",
    probability: 2,
  },
  {
    label:       "Mission Wiesbaden",
    subtext:     "",
    probability: 1,
  },
  {
    label:       "Mission Elz",
    subtext:     "",
    probability: 3,
  },
  {
    label:       "Mission Darmstadt",
    subtext:     "",
    probability: 2,
  },
  {
    label:       "Mission Urlaub",
    subtext:     "Der Start deiner Mission ist tba. Ziel wird es sein, das erste verlorene Datenpaket sicherzustellen. Hierfür wird es nötig sein, einem anonymen Hinweis nachzugehen, der nach unseren Informationen den Ort des Verstecks bereithält.",
    probability: 1,
  },
];

/* ============================================================
   RIGGING — mögliche Ergebnisse einschränken
   ============================================================
   Trage hier die Labels der Segmente ein, die als Ergebnis
   in Frage kommen sollen. Das Rad wählt dann zufällig eines
   davon (die probability-Gewichte bleiben untereinander erhalten).

   Beispiele:
     ["Städtetrip"]                   → immer Städtetrip
     ["Kinoabend", "Konzert"]         → nur diese zwei möglich
     []                               → echter Zufall (alle)

   Unbekannte Labels werden ignoriert; ist die Liste leer oder
   enthält sie keine gültigen Einträge, wird aus allen gewählt.
   ============================================================ */
const allowedResults = ["Mission Urlaub"];   // <-- hier eintragen, z.B. ["Städtetrip", "Wellnesstag"]

/* ============================================================
   DESIGN-TOKENS (müssen zu style.css passen)
   ============================================================ */
const COLORS = {
  bordeaux:   "#6B1A33",
  bordeauxDk: "#4A1022",
  bordeauxLt: "#8C2444",
  gold:       "#C9A84C",
  goldLt:     "#E2C97E",
  cream:      "#FAF6F0",
  creamDk:    "#EFE8DE",
  dark:       "#1E1616",
};

const SEGMENT_PALETTE = [
  COLORS.bordeaux,
  COLORS.bordeauxDk,
  COLORS.bordeauxLt,
  "#5C1229",
  "#7A1E3C",
  "#3D0D1C",
];

/* ============================================================
   SETUP — Wahrscheinlichkeiten → Winkel
   ============================================================ */
const totalWeight = segments.reduce((s, seg) => s + seg.probability, 0);
let cumulative = 0;
const segmentsWithAngles = segments.map((seg, i) => {
  const startAngle = (cumulative / totalWeight) * 2 * Math.PI;
  cumulative += seg.probability;
  const endAngle = (cumulative / totalWeight) * 2 * Math.PI;
  return { ...seg, startAngle, endAngle, color: SEGMENT_PALETTE[i % SEGMENT_PALETTE.length] };
});

/* ============================================================
   CANVAS DRAWING
   ============================================================ */
const canvas = document.getElementById("wheelCanvas");
const ctx    = canvas.getContext("2d");
const cx     = canvas.width  / 2;
const cy     = canvas.height / 2;
const radius = cx - 14;

function drawWheel(rotation) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(cx, cy, radius + 10, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.bordeauxDk;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, radius + 10, 0, 2 * Math.PI);
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 3;
  ctx.stroke();

  segmentsWithAngles.forEach((seg) => {
    const start = seg.startAngle + rotation;
    const end   = seg.endAngle   + rotation;
    const mid   = (start + end) / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.cos(start), cy + radius * Math.sin(start));
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const spokeLen = radius * 0.38;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + spokeLen * Math.cos(mid), cy + spokeLen * Math.sin(mid));
    ctx.strokeStyle = `${COLORS.gold}55`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(mid);

    const segAngle    = end - start;
    const labelRadius = radius * 0.62;

    ctx.font          = segAngle < 0.6 ? `500 11px Inter, sans-serif` : `500 13px Inter, sans-serif`;
    ctx.fillStyle     = COLORS.goldLt;
    ctx.textAlign     = "center";
    ctx.textBaseline  = "middle";

    const words = seg.label.split(" ");
    const maxW  = radius * 0.46;
    const lines = [];
    let   line  = "";

    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
      else line = test;
    });
    lines.push(line);

    const lineH  = segAngle < 0.6 ? 13 : 16;
    const startY = -((lines.length - 1) / 2) * lineH;
    lines.forEach((l, idx) => ctx.fillText(l, labelRadius, startY + idx * lineH));

    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.bordeauxDk;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, 2 * Math.PI);
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.gold;
  ctx.fill();
}

/* ============================================================
   WINNER DETECTION
   ============================================================ */
function getWinner(rot) {
  const POINTER = -Math.PI / 2;
  const raw     = POINTER - rot;
  const angle   = ((raw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return segmentsWithAngles.find(
    (seg) => angle >= seg.startAngle && angle < seg.endAngle
  ) || segmentsWithAngles[0];
}

/* ============================================================
   SEGMENT PICKING — berücksichtigt allowedResults
   ============================================================ */
function pickTargetSegment() {
  /* Baue den Pool: alle Segmente, deren Label in allowedResults steht.
     Ist die Liste leer / null / enthält nur unbekannte Labels → alle nehmen. */
  let pool = [];
  if (Array.isArray(allowedResults) && allowedResults.length > 0) {
    pool = segmentsWithAngles.filter((s) => allowedResults.includes(s.label));
    if (pool.length === 0) {
      console.warn("allowedResults enthält keine gültigen Labels – verwende alle Segmente.");
    }
  }
  if (pool.length === 0) pool = segmentsWithAngles;

  /* Gewichteten Zufall innerhalb des Pools ziehen */
  const poolWeight = pool.reduce((sum, s) => sum + s.probability, 0);
  const rand = Math.random() * poolWeight;
  let acc = 0;
  for (const seg of pool) {
    acc += seg.probability;
    if (rand < acc) return seg;
  }
  return pool[pool.length - 1];
}

/* ============================================================
   SPIN ANIMATION
   ============================================================ */
let currentRotation = 0;
let isSpinning      = false;

const spinBtn       = document.getElementById("spinBtn");
const resultArea    = document.getElementById("resultArea");
const resultTitle   = document.getElementById("resultTitle");
const resultSubtext = document.getElementById("resultSubtext");

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function hideSpinButton() {
  /* Sanfte Ausblend-Animation: opacity + leichtes Absinken */
  spinBtn.classList.add("hide");
  /* Nach der Transition aus dem Layout nehmen, damit kein Leerraum bleibt */
  spinBtn.addEventListener("transitionend", () => {
    spinBtn.style.display = "none";
  }, { once: true });
}

function spin() {
  if (isSpinning) return;
  isSpinning = true;
  spinBtn.disabled = true;

  resultArea.classList.remove("visible");
  resultSubtext.classList.remove("visible");

  const targetSeg = pickTargetSegment();

  const POINTER     = -Math.PI / 2;
  const halfSpan    = (targetSeg.endAngle - targetSeg.startAngle) * 0.35;
  const segMid      = (targetSeg.startAngle + targetSeg.endAngle) / 2;
  const targetAngle = segMid + (Math.random() * 2 - 1) * halfSpan;

  const fullSpins = 6 + Math.floor(Math.random() * 4);
  const baseRot   = POINTER - targetAngle;
  const minRot    = currentRotation + fullSpins * 2 * Math.PI;
  const k         = Math.ceil((minRot - baseRot) / (2 * Math.PI));
  const finalRot  = baseRot + k * 2 * Math.PI;
  const delta     = finalRot - currentRotation;

  const duration  = 4000 + Math.random() * 1500;
  const startRot  = currentRotation;
  const startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    const t       = Math.min(elapsed / duration, 1);
    currentRotation = startRot + delta * easeOut(t);
    drawWheel(currentRotation);

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      currentRotation = finalRot;
      drawWheel(currentRotation);
      isSpinning = false;
      showResult(getWinner(currentRotation));
      /* Button nach dem Drehen ausblenden */
      hideSpinButton();
    }
  }

  requestAnimationFrame(animate);
}

function showResult(seg) {
  resultTitle.textContent   = seg.label;
  resultSubtext.textContent = seg.subtext;
  resultSubtext.classList.remove("visible");
  resultArea.classList.add("visible");
  setTimeout(() => resultSubtext.classList.add("visible"), 600);
}

/* ============================================================
   INIT
   ============================================================ */
drawWheel(0);
spinBtn.addEventListener("click", spin);
