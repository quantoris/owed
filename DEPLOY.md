# Owed – Deployment Anleitung
## GitHub: quantoris · Repository: owed

---

## Teil 1 – Supabase einrichten (einmalig)

### 1.1 SQL Schema ausführen
1. supabase.com → Projekt → **SQL Editor → New query**
2. Inhalt von `supabase-schema.sql` einfügen → **Run**
3. Erfolgsmeldung: „Success. No rows returned"

### 1.2 Auth konfigurieren
1. **Authentication → URL Configuration**
2. Site URL: `https://quantoris.github.io/owed`
3. Redirect URLs (alle drei eintragen):
   - `https://quantoris.github.io/owed`
   - `https://quantoris.github.io/owed/`
   - `https://quantoris.github.io`
4. Speichern

### 1.3 User anlegen (beide einmalig)
1. **Authentication → Users → Add user → Create new user**
2. User 1 (Nadia): deine E-Mail + beliebiges Passwort (wird nie genutzt)
3. User 2 (Ingmar): seine E-Mail + beliebiges Passwort
4. `shouldCreateUser: false` im Code verhindert fremde Registrierungen

### 1.4 Admin-Rolle setzen (nach erstem Login beider User)
1. **Table Editor → profiles**
2. Nadia: `role` → `admin`, `name` → wie beim Login eingetragen
3. Ingmar: `role` → `user` (bleibt so)

---

## Teil 2 – GitHub einrichten (einmalig)

### 2.1 Repository
- GitHub: quantoris/owed (public, damit Pages funktioniert)

### 2.2 GitHub Pages aktivieren
1. Repository → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** · **/ (root)** → **Save**
4. URL: `https://quantoris.github.io/owed`

### 2.3 Dateien hochladen
Alle diese Dateien ins Root des Repositories:
```
owed/
├── index.html
├── sw.js
├── manifest.json
├── 404.html
├── README.md
└── icons/
    ├── icon-96.png
    ├── icon-192.png
    └── icon-512.png
```

Icons generieren: `generate-icons.html` im Browser öffnen → 3x Download klicken

---

## Teil 3 – App installieren (iPhone)

1. Safari → `https://quantoris.github.io/owed`
2. Teilen-Icon → **Zum Home-Bildschirm**
3. Name: „Owed" → Hinzufügen
4. App öffnen → E-Mail eingeben → Magic Link kommt per E-Mail
5. Auf Link klicken → beim ersten Login: Name eingeben (z.B. „Nadia")
6. Danach immer automatisch eingeloggt (30 Tage Inaktivität = neuer Login nötig)

---

## Teil 4 – Updates einspielen

1. Neue `index.html` von Claude herunterladen
2. GitHub → `owed` → `index.html` → Stift-Icon
3. Alles ersetzen (`Cmd+A` → löschen → neues einfügen)
4. **Commit changes** → 2 Min warten → fertig

---

## Teil 5 – Daten sichern

**Aus der App:** Settings → Export all data as CSV

**Aus Supabase:** Table Editor → Tabelle wählen → Export CSV

---

## Push Notifications – wichtiger Hinweis

Safari auf iOS unterstützt Web Push Notifications nur ab **iOS 16.4+** und nur wenn die App als PWA installiert ist (Zum Home-Bildschirm hinzugefügt). Im Browser-Tab funktionieren sie nicht.

Schritte:
1. App als PWA installieren (Schritt 3 oben)
2. App über das Home-Screen Icon öffnen (nicht über Safari direkt)
3. Settings → Push notifications → Enable
4. iOS Berechtigungsdialog bestätigen

---

## Troubleshooting

**Schwarzer Bildschirm:** Supabase URL/Key falsch → prüfen in index.html Zeilen ~325-326

**404 nach Magic Link:** Redirect URL in Supabase nicht eingetragen → Teil 1.2 wiederholen

**Magic Link kommt nicht:** Rate limit → 1h warten. Oder: User nicht in Supabase angelegt → Teil 1.3

**Push Notifications funktionieren nicht im Browser:** Normal – nur als installierte PWA (Home Screen)

**Daten nicht sichtbar:** Profil-Rolle falsch → Supabase → profiles → role prüfen

---

## Migration (falls Dienst gewechselt werden muss)

### Von GitHub weg:
Alle Dateien herunterladen → auf Netlify/Vercel hochladen → fertig

### Von Supabase weg:
1. Settings → Export all data as CSV
2. In index.html zwei Zeilen ändern:
   ```
   const SUPABASE_URL = 'NEUE_URL';
   const SUPABASE_ANON = 'NEUER_KEY';
   ```
3. Schema auf neuem Dienst ausführen → Daten importieren
