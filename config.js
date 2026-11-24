/*
 * SITE CONFIG — every piece of copy, link and asset slot lives here.
 * Facts marked "verified" were read from the artist's public YouTube, Spotify and
 * Apple Music pages and citiMuzik release notes on 24 Nov 2026. Anything in
 * [square brackets] is an editable placeholder: replace it with confirmed copy.
 */
window.SITE = {
  brand: {
    name: "Tino Mbasera",
    fullName: "Tinotenda Mbasera",
    // Logo lockup, after the "TM / TINOTENDA MBASERA / MUSIC" mark on the I Am of God cover
    monogram: "TM",
    band: "Tinotenda Mbasera",
    tag: "Music",
    mark: "I Am of God",           // live recording project (verified)
    tagline: "The Voice. The Hymn. The Journey.",
    enterCue: "Begin the journey",
  },

  // Stable asset slots. If `frames.count` > 0 the frame player streams
  // pre-rendered frames from `frames.pattern` ({i} = zero-padded index);
  // otherwise the procedural renderer in scene.js draws every frame.
  assets: {
    // Hero photo: top of the I Am of God artwork (printed TM removed). focus = his face.
    "hero-photo":      { image: "assets/hero-photo.jpg", imageSmall: "assets/hero-photo-1280.jpg", focus: [0.45, 0.42],
                         frames: { pattern: "assets/hero-photo/frame_{i}.webp", count: 0, pad: 4 } },
    "logo-sequence":   { frames: { pattern: "assets/logo-sequence/frame_{i}.webp", count: 0, pad: 4 }, model: "" },
    "closing-photo":   { image: "assets/stage.jpg", focus: [0.5, 0.45] },   // still from the Mwari Wezvishamiso live video
    "route-map":       { image: "" },
    "vault-mark":      { image: "" },
  },

  chapters: [
    { id: "valley",    label: "The Opening" },
    { id: "voice",     label: "The Voice" },
    { id: "story",     label: "The Story" },
    { id: "service",   label: "The Service" },
    { id: "route",     label: "The Song Route" },
    { id: "ministry",  label: "Partnership" },
    { id: "vault",     label: "The Vault" },
    { id: "contact",   label: "Contact" },
  ],

  hero: {
    captions: [
      "One voice, raised in worship.",
      "From the churches of Zimbabwe, to the world.",
    ],
    sub: "Zimbabwean gospel · Shona worship",
    canvasLabel:
      "Tino Mbasera singing into a microphone with one hand raised, against glowing clouds. The camera slowly pushes in toward his face while his TM logo — Tinotenda Mbasera Music — flies in piece by piece in white and gold and assembles in 3D.",
  },

  voice: {
    eyebrow: "Chapter One",
    title: "Tino Mbasera",
    subtitle: "Zimbabwean gospel · Shona worship",
    line: "The Voice. The Hymn. The Journey.",
    featureVideo: "FoC6uJCC_N8",
    featureCaption: "Apo Jesu Achionekwa — live, from the I Am of God recording.",
  },

  story: {
    eyebrow: "The Philosophy",
    title: "Worship in the mother tongue",
    paragraphs: [
      "Tino Mbasera — Tinotenda Mbasera — is a Zimbabwean gospel artist whose songs carry the Shona hymn tradition into live, choir-led worship.",
      "His live project, I Am of God, was recorded at 99 Parklane, with arrangement and production by Anesu Mapfumba and vocal direction by Tawanda Midzi.",
      "Its first single, Apo Jesu Achionekwa, takes a traditional hymn widely sung in Zimbabwean churches and lets it breathe again — a song about the day Christ appears.",
      "He is a songwriter too. Tibvumbamirei (2020) and Tinokunda Chete (2021), recorded with FIG Worship Culture, are his own songs, and he led worship with the AFM of Zimbabwe Avondale Praise Team before stepping out under his own name.",
    ],
    image: "assets/portrait.jpg",   // his YouTube channel portrait

    imageAlt: "Portrait of Tino Mbasera smiling, chin resting on his hand, in front of a cream arched sanctuary",
    pull: "The hymn is never performed. It is offered.",
    pullSub: "[Editable line — replace with Tino's own words]",
    tags: ["Hymn", "Choir", "Live"],
  },

  service: {
    eyebrow: "The Service",
    title: "A service of song rather than a setlist.",
    steps: ["Silence", "Call", "Hymn", "Response", "Praise", "Sending"],
    note: "[Editable] The order of a live worship night, as Tino leads it.",
  },

  // The route: each verified release is a station on the line, in date order.
  route: {
    eyebrow: "The Song Route",
    intro: "From his first songs in 2020 to today. Every release is a station; the line is still being drawn.",
    stations: [
      { id: "ebYqUA_stR4", title: "Tibvumbamirei", chapter: "The First Chapter", year: "2020",
        text: "A song he wrote himself, arranged by Tatenda Gurupira and recorded at Cajo Studios with FIG Worship Culture.", views: "40K views", with: "FIG Worship Culture" },
      { id: "eX8LZeXph7M", title: "Tinokunda Chete", chapter: "The Psalm Chapter", year: "2021",
        text: "His own song, echoing Psalm 23: though you walk through the valley, fear not — the Lord is with you.", views: "30K views", with: "FIG Worship Culture" },
      { id: "OTsluppGb7Y", title: "Awesome God", chapter: "The Praise Chapter", year: "2021",
        text: "A praise chorus led by Tino with the AFM of Zimbabwe Avondale Praise Team, directed by Sharon Cherayi.", views: "58K views", with: "AFM Avondale" },
      { id: "9qtu5aFVVNI", title: "Aripano Wedenga", chapter: "The Avondale Chapter", year: "2021",
        text: "Tremier Msipa's song, led by Tino with the Avondale Praise Team in Harare.", views: "87K views", with: "AFM Avondale" },
      { id: "JVhVp0vJ8UQ", title: "Anotida (Mumwe Ariko)", chapter: "The Bulawayo Chapter", year: "2024",
        text: "A Shona hymn ministered live at Eagle Life Assembly, Bulawayo — his most-watched performance.", views: "1.9M views", with: "FIG Worship Culture" },
      { id: "FoC6uJCC_N8", title: "Apo Jesu Achionekwa", chapter: "The Hymn Chapter", year: "2025",
        text: "A traditional Shona hymn about the day Christ appears, recorded live for I Am of God.", views: "1.2M views", with: "FIG Worship Culture" },
      { id: "jQBStcWNHo0", title: "Anodzifambira", chapter: "The Fellowship Chapter", year: "2025",
        text: "Twelve minutes of shared worship with Takesure Zamar Ncube.", views: "923K views", with: "Takesure Zamar" },
      { id: "B0eSP1yuhx4", title: "Mwari Wezvishamiso", chapter: "The Wonder Chapter", year: "2026",
        text: "A song to the God of wonders, sung with Minister Blessing Jeduthan.", views: "266K views", with: "Blessing Jeduthan" },
      { id: "tlA97MiPqXU", title: "Hosanna Wekudenga", chapter: "The Heaven Chapter", year: "2026",
        text: "A hosanna of heaven, sung with Minister Ellard Cherayi.", views: "504K views", with: "Ellard Cherayi" },
      { id: "1vNhtLmCvZk", title: "Hakuna Hama Kupinda Jeso / Ndotsvaga Imi Moga", chapter: "The Devotion Chapter", year: "2026",
        text: "A cover medley that slows the room down to one name.", views: "4.7K views", with: "Cover" },
      { id: "7RF4RG33uP0", title: "Gore Richanakidza", chapter: "The Hope Chapter", year: "2026",
        text: "Takesure Zamar's song of a good year to come, reborn live on I Am of God.", views: "62K views", with: "Takesure Zamar" },
      { id: "", title: "Hymns Medley", chapter: "The Heritage Chapter", year: "2026",
        text: "Familiar hymns of the church, woven together with BCC Worship.", views: "New release", with: "BCC Worship" },
    ],
  },

  statement: {
    a: "This is not a performance.",
    b: "This is worship.",
    sub: "Tino Mbasera carries the hymns of Zimbabwe's churches to new rooms, one congregation at a time.",
  },

  // Public counts as shown on the platforms, 24 Nov 2026.
  numbers: {
    asOf: "Public counts as of 24 Nov 2026",
    items: [
      { value: "3M+",   label: "Views on his channel" },
      { value: "1.9M",  label: "Anotida, with FIG Worship Culture" },
      { value: "1.2M",  label: "Apo Jesu Achionekwa" },
      { value: "7.9K",  label: "Monthly Spotify listeners" },
    ],
  },

  collaborators: {
    eyebrow: "The Company",
    title: "Some songs deserve listeners. Others deserve a congregation.",
    rows: [
      { name: "Takesure Zamar Ncube", role: "Featured on Anodzifambira and Gore Richanakidza" },
      { name: "Minister Blessing Jeduthan", role: "Featured on Mwari Wezvishamiso" },
      { name: "Minister Ellard Cherayi", role: "Featured on Hosanna Wekudenga" },
      { name: "FIG Worship Culture", role: "Tibvumbamirei, Tinokunda Chete, Anotida (Mumwe Ariko) · co-release of Apo Jesu Achionekwa" },
      { name: "AFM of Zimbabwe Avondale Praise Team", role: "Awesome God and Aripano Wedenga (2021)" },
      { name: "Tatenda Gurupira", role: "Arrangement and production on the FIG Worship Culture and Avondale recordings" },
      { name: "BCC Worship", role: "Hymns Medley" },
      { name: "Anesu Mapfumba", role: "Production and arrangement, I Am of God" },
      { name: "Tawanda Midzi", role: "Vocal direction, I Am of God" },
    ],
  },

  partnership: {
    eyebrow: "Partnership",
    title: "Invite the hymn into your room.",
    intro: "[Editable] Ways churches, events and media can work with Tino. Confirm availability and terms directly.",
    ways: [
      { n: "I",   name: "Live worship nights", text: "[Editable] A full live set with choir and band." },
      { n: "II",  name: "Church & conference ministry", text: "[Editable] Ministering in song at services and gatherings." },
      { n: "III", name: "Collaborations & features", text: "[Editable] Studio and live features with fellow ministers." },
      { n: "IV",  name: "Media & press", text: "[Editable] Interviews, sessions and recordings." },
    ],
    cta: "Begin a conversation",
  },

  vault: {
    eyebrow: "The Vault",
    title: "A living archive of the songs.",
    intro: "His own releases, his songs with FIG Worship Culture and his years with the AFM Avondale Praise Team. Every card opens the original on YouTube.",
    // Art cards use the stable procedural slots; video cards use YouTube thumbnails.
    cards: [
      { image: "assets/album-cover.jpg", title: "I Am of God", text: "The live recording project", href: "https://open.spotify.com/artist/27T5p5QJzhzrAtx7NZS6xP" },
      { video: "JVhVp0vJ8UQ", title: "Anotida (Mumwe Ariko)", text: "FIG Worship Culture · Live in Bulawayo · 2024" },
      { video: "FoC6uJCC_N8", title: "Apo Jesu Achionekwa", text: "I Am of God · 2025" },
      { slot: "vault-mark", title: "The Mark", text: "Tinotenda Mbasera Music" },
      { video: "jQBStcWNHo0", title: "Anodzifambira", text: "ft Takesure Zamar · 2025" },
      { video: "tlA97MiPqXU", title: "Hosanna Wekudenga", text: "ft Ellard Cherayi · 2026" },
      { image: "assets/portrait.jpg", title: "The Minister", text: "Tinotenda Mbasera" },
      { video: "B0eSP1yuhx4", title: "Mwari Wezvishamiso", text: "ft Blessing Jeduthan · 2026" },
      { video: "9qtu5aFVVNI", title: "Aripano Wedenga", text: "AFM Avondale Praise Team · 2021" },
      { video: "7RF4RG33uP0", title: "Gore Richanakidza", text: "ft Takesure Zamar · 2026" },
      { video: "OTsluppGb7Y", title: "Awesome God", text: "AFM Avondale Praise Team · 2021" },
      { video: "ebYqUA_stR4", title: "Tibvumbamirei", text: "Written by Tino · FIG Worship Culture · 2020" },
      { video: "eX8LZeXph7M", title: "Tinokunda Chete", text: "Written by Tino · FIG Worship Culture · 2021" },
      { video: "1vNhtLmCvZk", title: "Hakuna Hama Kupinda Jeso", text: "Cover · 2026" },
      { image: "assets/stage.jpg", title: "More on YouTube", text: "Tinotenda Mbasera Official", href: "https://www.youtube.com/@TinoMbasera" },
    ],
  },

  closing: {
    a: "People have seen how beautiful Zimbabwe is. Now it is time for them to hear how beautiful Zimbabwe worships.",
    b: "Created for the world.",
    ctas: [
      { label: "Listen on Spotify", href: "https://open.spotify.com/artist/27T5p5QJzhzrAtx7NZS6xP" },
      { label: "Watch on YouTube", href: "https://www.youtube.com/@TinoMbasera" },
      { label: "Apple Music", href: "https://music.apple.com/zw/album/apo-jeso-achionekwa-single/1855286594" },
    ],
  },

  contact: {
    eyebrow: "About the journey",
    title: "A worship voice from Zimbabwe.",
    body: "Tino Mbasera is a Zimbabwean gospel artist. His live project I Am of God carries traditional Shona hymns and new songs of praise into choir-led worship.",
    email: "",                   // [Editable] booking email — left blank until confirmed
    formEndpoint: "",            // [Editable] e.g. a Formspree URL; blank = demo mode
    formTitle: "Write to Tino.",
    links: [
      { label: "YouTube", href: "https://www.youtube.com/@TinoMbasera" },
      { label: "Spotify", href: "https://open.spotify.com/artist/27T5p5QJzhzrAtx7NZS6xP" },
      { label: "Apple Music", href: "https://music.apple.com/zw/album/apo-jeso-achionekwa-single/1855286594" },
    ],
  },

  footer: {
    credit: "© 2026 Tino Mbasera. All recordings belong to their respective owners.",
    design: "Cinematic portfolio — design inspired by the Music from the Valley experience. Not affiliated with it.",
  },
};
