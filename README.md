# Tino Mbasera — cinematic portfolio

A scroll-driven storytelling site for Zimbabwean gospel artist Tino (Tinotenda) Mbasera.
Its structure and motion language follow the *Music from the Valley* reference: the
cinematic opening, a 3D centrepiece, a gold mark, the cream chapters, the route, the
partnership section, the Vault, the closing and the contact form.

The opening uses his own photograph: the top half of the *I Am of God* artwork, with the
small printed logo removed (`assets/hero-photo.jpg`). As you scroll, the camera pushes in
toward his face while his logo assembles in 3D. The T and M fly in from different depths,
the name band unfolds, MUSIC settles, and gold dust converges onto the letters.

The logo follows the mark on that cover: a "TM" monogram in heavy Didone capitals
(Playfair Display Black), split by a band of tracked capitals reading "TINOTENDA MBASERA"
(Montserrat), with "MUSIC" below. It has a white face with gold edges, matching the white
mark and the gold "GOD" lettering on the cover. The same lockup is used in HTML for the
header, the chapter card, the closing and the footer.

## Files
| File | Purpose |
|---|---|
| `index.html` | Semantic page shell (one `h1`, a chapter `h2` for each section, landmarks, skip link) |
| `config.js` | **All editable content**: brand, chapters, captions, story, route stations, numbers, collaborators, partnership, Vault cards, CTAs, contact and footer, plus asset slots |
| `scene.js` | Procedural frame renderer for the valley and the microphone, both scroll-scrubbed |
| `app.js` | Config binding, scroll-progress engine, route, rail, menu, motion toggle and form |
| `styles.css` | Visual system and responsive layouts |

Run locally with any static server, for example `jwebserver -p 8765 -d <this folder>`.

## Facts used (verified 24 Nov 2026)
- YouTube channel **Tinotenda Mbasera Official** (@TinoMbasera): Zimbabwe, joined 2012, 8.79K subscribers, 3,034,306 views, and the six video titles with their view counts.
- Spotify: 7,944 monthly listeners. Popular tracks: Anodzofambira, Apo Jeso Achionekwa, Hosanna Wekudenga, Mwari wezvishamiso.
- Apple Music: *Apo Jeso Achionekwa* single, released 19 Nov 2025 (Christian), plus the other releases.
- citiMuzik release notes: the live project *I Am of God* was recorded at 99 Parklane, with arrangement and production by Anesu Mapfumba and vocal direction by Tawanda Midzi. *Apo Jesu Achionekwa* is a traditional Shona hymn about Christ's appearing. *Gore Richanakidza* was composed by Takesure Zamar. *Hymns Medley* is with BCC Worship, and *Anotida (Mumwe Ariko)* is with Worship Culture.

- FIG Worship Culture channel (@figworshipculture9116): *Tibvumbamirei* (4 Oct 2020, written by Tino, arranged by Tatenda Gurupira, recorded at Cajo Studios), *Tinokunda Chete* (27 Jan 2021, written by Tino), and *Anotida (Mumwe Ariko)* (Jan 2024, a Shona hymn ministered live at Eagle Life Assembly, Bulawayo, with 1.94M views).
- AFM of Zimbabwe Kingdom Life Centre channel: *Awesome God* and *Aripano Wedenga* (both 20 Jul 2021, performed by Tino with the AFM Avondale Praise Team, directed by Sharon Cherayi, produced by Tatenda Gurupira). The channel's other Avondale videos feature other lead singers and are not included.

Song titles use the YouTube spellings (Apo **Jesu**, Anodz**i**fambira); the streaming services spell some of them differently.

**Placeholders, marked `[Editable]` in config.js:** the pull-quote line, the order of the
service, the descriptions of the partnership offers, the booking email and the form
endpoint. The contact form never pretends to send anything. Until an endpoint or email is
set, it says it is in preview mode.

## Observed in the reference vs. reconstruction choices
| Effect | Status |
|---|---|
| Misty valley opening, script logo, "Enter the valley" cue | Observed. Replaced at the client's request by his photograph, with a scroll-driven push-in, a dark warm grade, light rays and dust |
| Instrument (Santoor) flying in and assembling | Observed. Replaced by his TM logo assembling piece by piece in 3D |
| Gold brand mark flare on black | Observed (producer mark). Reproduced as the "I Am of God" project mark with a cross-shaped light |
| Cream chapter title card, then a philosophy section with an image | Observed. The image is his channel portrait (`assets/portrait.jpg`) |
| Engraved instrument plate with a vertical timeline (Silence … Departure) | Observed. Reproduced as a gold-foil 3D logo over engraved rings, beside the worship service order |
| Dark route map lighting up chapter by chapter (ten cities) | Observed. Reproduced with **seven verified releases** as the stations, not invented cities |
| Statement, numbers, partner rows, partnership tiers | Observed. Uses real public counts, real collaborators, and partnership offers with no prices |
| Vault grid of image cards | Observed. Uses video cards that link to YouTube, plus three procedural art slots |
| Dusk valley closing, script sign-off with three CTAs, contact form | Observed. The closing is a still from his *Mwari Wezvishamiso* live video (`assets/stage.jpg`) in amber light, with the camera drawing back |
| Frame sequences | Original: pre-rendered video frames. **Reconstruction:** a Canvas 2D renderer. The photo is drawn with a scroll-driven zoom and grade, and the logo is rasterised into four pieces, each extruded in up to 16 layers with a specular sweep, plus a 1,800-point gold dust cloud. Each frame depends only on scroll progress, so scrubbing backwards gives the same frames |
| Scroll engine | **Reconstruction:** a dependency-free sticky section with damped progress, standing in for GSAP ScrollTrigger and Lenis. The original's implementation was not verified |

## Asset slots (`SITE.assets` in config.js)
`hero-photo` (image, smaller image, focal point), `logo-sequence`, `closing-photo`, `route-map`, `vault-mark`.
To feature a different photo, swap `hero-photo.image` and set `focus` to the point the camera should push toward (fractions of width and height).

To use real pre-rendered frames, set `frames.count` and drop files at
`assets/hero-photo/frame_0001.webp` and so on. The frame player streams a window of
frames around the playhead and falls back to the procedural renderer for any frame that
has not loaded yet. For the art slots, set `image` to replace the procedural card art.

## Accessibility and performance
- Reduced motion (the operating-system setting): the camera stays still, the logo appears already assembled with no dust, ambient motion is off, and reveals show immediately.
- The pause/play button stops ambient motion (mist, motes, rings), while scroll scrubbing keeps working.
- The menu traps keyboard focus and closes on Escape. Chapter links move focus to the section heading.
- Each canvas has an `aria-label`. Hero captions are real text. The route is duplicated as a text list for screen readers.
- The first frame is drawn before the animation loop starts. Thumbnails and art slots load lazily. Device pixel ratio is capped (1.25 on mobile, 1.6 on desktop). The YouTube player loads only when a visitor presses play.

## Security
See [SECURITY.md](SECURITY.md) for what the site does to protect visitors and how to report
a problem. Short version:
- A strict Content Security Policy, with no inline scripts, inline styles or `eval`.
- Escaping and URL allow-listing on everything read from `config.js`.
- A clickjacking guard.
- A spam-resistant contact form.
- `noopener noreferrer` on external links.
- A `security.txt` file.
- A `_headers` file with HSTS, `X-Frame-Options`, `Permissions-Policy` and the other
  header-only protections, for hosts that support it.

If you connect a form endpoint in `config.js`, add its origin to `connect-src` in the CSP in
`index.html` and in `_headers`.
