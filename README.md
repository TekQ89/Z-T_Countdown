# Countdown zum 12. September 2027

Die Seite zählt bis zum **12. September 2027 um 00:00 Uhr deutscher Zeit**.
Sie besteht aus HTML, CSS und JavaScript. Alle Zeichnungen und Schriftarten liegen lokal im Ordner `assets`; beim Besuch werden keine externen Dienste benötigt.

## Direkt ansehen

`index.html` im Browser öffnen. Der Countdown läuft auch ohne Webserver.

## Kostenlos über GitHub Pages veröffentlichen

1. Auf GitHub ein neues **öffentliches** Repository erstellen, beispielsweise `countdown`.
2. `index.html`, `styles.css`, `countdown.js`, `.nojekyll` sowie den vollständigen Ordner `assets` in dessen oberste Ebene hochladen. Die Ordnerstruktur beibehalten.
3. Im Repository **Settings → Pages** öffnen.
4. Bei **Source** die Option **Deploy from a branch** wählen.
5. Den Branch **main** und den Ordner **/(root)** auswählen und speichern.
6. GitHub zeigt dort nach der Bereitstellung die Adresse der Seite an.

Anleitung: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Später ändern

- Gestaltung: `styles.css`
- Texte und Aufbau: `index.html`
- Countdown und Animationen: `countdown.js`
- Gezeichnete Figuren, Landschaft, Ballon und Schriften: `assets/`

Das Zieldatum steht in `countdown.js` als `TARGET_DATE`. Bei einer Änderung auch die sichtbaren Datumsangaben und Metadaten in `index.html` anpassen. Der Offset `+02:00` entspricht der deutschen Sommerzeit am angegebenen Zieltag.

Der Countdown berechnet die Restzeit aus der Geräteuhr bei jeder Aktualisierung neu. Am Ziel bleibt er bei null und zeigt „Unser Für immer beginnt heute.“ an.

## Bärchengeschichte und Ballon

Beim ersten Besuch pro Browser spielt eine etwa achtsekündige Bildfolge: Z küsst T, T umarmt Z, das Paar dreht sich gemeinsam einmal und beginnt dann zu pumpen. Der abgeschlossene erste Besuch wird unter `tz-cappadocia-intro-v1` im lokalen Browserspeicher gespeichert. Ohne verfügbaren Speicher wird die Begrüßung bei jedem Aufruf wiederholt. „Unser kleiner Anfang“ spielt sie erneut ab.

Die Pumpe wiederholt sich anschließend in einem 1,5-Sekunden-Takt. Der Ballon wächst unabhängig von Besuchen kontinuierlich zwischen dem festen Beginn `GROWTH_START` (5. September 2026, 00:00 Uhr deutscher Zeit) und dem Zieldatum von 45 % auf 100 % seiner maximalen Darstellung. Bei einem Neuladen bleibt die zeitabhängige Größe erhalten.

„Animation pausieren“ hält die Bewegung an; die Uhr läuft weiter. Unsichtbare Browser-Tabs pausieren die Animation automatisch. Bei der Systemeinstellung „Bewegung reduzieren“ bleiben die Zeichnungen ruhig. Countdown und Ballongröße funktionieren weiterhin.

## Zeichnungen und Schriften

Die Zeichnungen wurden mit dem eingebauten Imagegen-Werkzeug erstellt. Die vollständigen Prompts stehen in `assets/art-prompts.json` und `assets/hose-prompt.json`. Der Teddy-Atlas enthält acht gleich große Zellen in vier Spalten und zwei Zeilen; die Bildfolge wird in CSS und JavaScript gesteuert.

Die lokal eingebundenen Schriften Caveat und Cormorant stammen aus Google Fonts. Ihre SIL-Open-Font-Lizenzen liegen in `assets/caveat-OFL.txt` und `assets/cormorant-OFL.txt`.

## Optionale lokale Werkzeuge

Mit Node.js startet `node preview.mjs` eine Vorschau unter `http://127.0.0.1:4173`. `node build.mjs` kopiert die Dateien nach `dist/`. Für GitHub Pages werden diese Werkzeuge nicht benötigt.
