/* ============================================================
   KONFIGURATION — NUR HIER MUSST DU ÄNDERUNGEN VORNEHMEN
   ============================================================ */

// TODO: Ersetze "12345678" durch den echten Zugangscode,
// den deine Freundin finden soll (nur Zahlen, keine Leerzeichen).
const CORRECT_CODE = "2364913842";

// TODO: Ersetze "../mission-02/index.html" durch den Pfad
// zur nächsten Seite, auf die sie nach richtigem Code weitergeleitet wird.
const NEXT_PAGE_URL = "wheel/index.html";

// TODO: Optional — passe die Terminal-Nachrichten an.
// Sie werden nacheinander eingetippt, wie in einem alten System.
const TERMINAL_LINES = [
    "> Verschlüsselte Verbindung aufgebaut...",
    "> N&L-OS Einsatzsystem v4.0 geladen",
    "> Missionsdatei MIS-01 entschlüsselt",
    "> Agentin identifiziert und authentifiziert",
    "> Zugangscode-Modul initialisiert",
    "> Warte auf Eingabe der Agentin...",
];

/* ============================================================
   TERMINAL TYPEWRITER
   ============================================================ */

const terminal = document.getElementById("terminal");
let lineIndex = 0;

function writeLine() {
    if (lineIndex >= TERMINAL_LINES.length) return;

    const row = document.createElement("div");
    terminal.appendChild(row);

    const text = TERMINAL_LINES[lineIndex];
    let charIndex = 0;

    const interval = setInterval(() => {
        const char = text[charIndex];

        // Erster Charakter ">" wird gedimmt dargestellt
        if (charIndex === 0 && char === ">") {
            row.innerHTML = `<span class="dim">></span>`;
        } else if (charIndex === 0) {
            row.textContent += char;
        } else {
            // Hängt Zeichen ans Ende ohne den bestehenden Inhalt zu überschreiben
            row.innerHTML = row.innerHTML + (char === " " ? "&nbsp;" : char);
        }

        charIndex++;

        if (charIndex >= text.length) {
            clearInterval(interval);
            lineIndex++;
            // Pause zwischen den Zeilen
            setTimeout(writeLine, 280);
        }
    }, 22);
}

writeLine();

/* ============================================================
   CODE-ÜBERPRÜFUNG
   ============================================================ */

const codeInput  = document.getElementById("codeInput");
const submitBtn  = document.getElementById("submitBtn");
const feedback   = document.getElementById("feedback");

function checkCode() {
    // Leerzeichen und Bindestriche entfernen, damit "1234 5678" auch klappt
    const entered = codeInput.value.trim().replace(/[\s\-]/g, "");

    // Leere Eingabe
    if (!entered) {
        showFeedback("error", "// FEHLER: Kein Code eingegeben.");
        codeInput.focus();
        return;
    }

    if (entered === CORRECT_CODE) {
        // ── Richtiger Code ──────────────────────────────────
        showFeedback("success", "// Zugangscode akzeptiert. Verbindung wird hergestellt...");
        codeInput.classList.remove("input-error");
        submitBtn.disabled = true;
        codeInput.disabled = true;

        // Terminaleintrag hinzufügen
        appendTerminalLine("> Zugangscode verifiziert. Weiterleitend...");

        setTimeout(() => {
            window.location.href = NEXT_PAGE_URL;
        }, 1800);

    } else {
        // ── Falscher Code ────────────────────────────────────
        // TODO: Du kannst die Fehlermeldung hier anpassen
        showFeedback("error", "// ZUGANG VERWEIGERT — Ungültiger Code. Bitte erneut versuchen.");
        codeInput.classList.add("input-error");

        // Fehler-Terminaleintrag
        appendTerminalLine("> WARNUNG: Ungültiger Zugangscode erkannt.");

        // Roten Rahmen nach kurzer Zeit wieder entfernen
        setTimeout(() => {
            codeInput.classList.remove("input-error");
        }, 1500);

        codeInput.select();
    }
}

/* Hilfsfunktion: Feedback-Bereich setzen */
function showFeedback(type, message) {
    // Klasse entfernen und wieder setzen erzwingt die Animation neu
    feedback.className = "feedback";
    void feedback.offsetWidth; // Reflow erzwingen
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
}

/* Hilfsfunktion: Neue Zeile ans Terminal anhängen */
function appendTerminalLine(text) {
    const row = document.createElement("div");
    row.innerHTML = `<span class="dim">></span>${text.slice(1)}`;
    terminal.appendChild(row);
    // Zum Ende scrollen falls Terminal überläuft
    terminal.scrollTop = terminal.scrollHeight;
}

/* ── Event Listener ──────────────────────────────────────── */

submitBtn.addEventListener("click", checkCode);

// Enter-Taste im Eingabefeld bestätigt ebenfalls
codeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkCode();
});

// Roten Rahmen entfernen sobald der Nutzer wieder tippt
codeInput.addEventListener("input", () => {
    codeInput.classList.remove("input-error");
    if (feedback.classList.contains("error")) {
        feedback.className = "feedback";
        feedback.textContent = "";
    }
});
