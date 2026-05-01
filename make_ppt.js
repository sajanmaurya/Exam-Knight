const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Sajan Kumar";
pres.title = "Exam Knight — Anti-Cheating Online Exam Platform";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:       "0f172a",
  bg2:      "1e293b",
  bg3:      "0e1e35",
  indigo:   "6366f1",
  indigoDk: "4338ca",
  green:    "22c55e",
  yellow:   "fbbf24",
  red:      "ef4444",
  cyan:     "06b6d4",
  white:    "ffffff",
  gray:     "94a3b8",
  grayLt:   "cbd5e1",
  card:     "1e293b",
  cardBd:   "334155",
  purple:   "a855f7",
  orange:   "f97316",
};

const W = 10, H = 5.625;
const mkShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.35 });

// ── Helpers ───────────────────────────────────────────────────────────────────
function slideBg(slide, color) {
  slide.background = { color: color || C.bg };
}

function title(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.4, y: opts.y ?? 0.18, w: opts.w ?? 9.2, h: opts.h ?? 0.65,
    fontSize: opts.size ?? 28, bold: true, color: C.white,
    fontFace: "Calibri", align: opts.align ?? "left", margin: 0,
    ...opts,
  });
}

function pill(slide, text, x, y, color) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.35, h: 0.28, fill: { color }, rectRadius: 0.06, line: { color, width: 0 } });
  slide.addText(text, { x, y, w: 1.35, h: 0.28, fontSize: 9, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
}

function card(slide, x, y, w, h, color) {
  color = color || C.card;
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color }, line: { color: C.cardBd, width: 0.5 }, shadow: mkShadow() });
}

function accent(slide, x, y, h) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h, fill: { color: C.indigo }, line: { color: C.indigo, width: 0 } });
}

function divider(slide, y) {
  slide.addShape(pres.shapes.LINE, { x: 0.4, y, w: 9.2, h: 0, line: { color: C.cardBd, width: 0.5 } });
}

function badge(slide, text, x, y, fg, bg) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 0.95, h: 0.26, fill: { color: bg }, rectRadius: 0.05, line: { color: bg, width: 0 } });
  slide.addText(text, { x, y, w: 0.95, h: 0.26, fontSize: 7.5, bold: true, color: fg, align: "center", valign: "middle", margin: 0 });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);

  // Left accent bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: H, fill: { color: C.indigo }, line: { color: C.indigo, width: 0 } });

  // Big title
  s.addText("Exam Knight", { x: 0.55, y: 1.0, w: 7, h: 1.3, fontSize: 64, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });

  // Indigo underline
  s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: 2.1, w: 4.2, h: 0.06, fill: { color: C.indigo }, line: { color: C.indigo, width: 0 } });

  // Subtitle
  s.addText("AI-Powered Anti-Cheating Online Exam Platform", {
    x: 0.55, y: 2.3, w: 7.5, h: 0.5, fontSize: 17, color: C.grayLt, fontFace: "Calibri", margin: 0,
  });

  // Author
  s.addText("Sajan Kumar  |  College Project Presentation  |  2026", {
    x: 0.55, y: 2.9, w: 7, h: 0.35, fontSize: 11, color: C.gray, fontFace: "Calibri", margin: 0,
  });

  // Tech badges
  const techs = [
    ["React", C.cyan], ["Node.js", C.green], ["PostgreSQL", "3b82f6"],
    ["Socket.io", C.purple], ["TensorFlow.js", C.orange], ["Docker", "2563eb"],
  ];
  techs.forEach(([t, c], i) => pill(s, t, 0.55 + i * 1.45, 3.45, c));

  // Right decorative circuit pattern
  const dots = [[8.5,0.6],[9.2,0.6],[8.5,1.1],[9.2,1.1],[8.5,1.6],[9.2,1.6],[8.5,2.1],[9.2,2.1]];
  dots.forEach(([x,y]) => s.addShape(pres.shapes.OVAL, { x, y, w: 0.08, h: 0.08, fill: { color: C.indigo, transparency: 50 }, line: { color: C.indigo, width: 0 } }));
  s.addShape(pres.shapes.LINE, { x: 8.5, y: 0.64, w: 0.7, h: 0, line: { color: C.indigo, width: 0.5, transparency: 50 } });
  s.addShape(pres.shapes.LINE, { x: 8.5, y: 1.14, w: 0.7, h: 0, line: { color: C.indigo, width: 0.5, transparency: 50 } });
  s.addShape(pres.shapes.LINE, { x: 8.5, y: 1.64, w: 0.7, h: 0, line: { color: C.indigo, width: 0.5, transparency: 50 } });
  s.addShape(pres.shapes.LINE, { x: 8.5, y: 2.14, w: 0.7, h: 0, line: { color: C.indigo, width: 0.5, transparency: 50 } });

  // Bottom bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: H - 0.3, w: W, h: 0.3, fill: { color: C.indigoDk }, line: { color: C.indigoDk, width: 0 } });
  s.addText("github.com/sajanmaurya/anti-cheat-exam-platform", {
    x: 0.4, y: H - 0.3, w: 9.2, h: 0.3, fontSize: 9, color: C.grayLt, align: "center", valign: "middle", margin: 0,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — PROBLEM STATEMENT
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.75, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "The Problem with Online Exams", { y: 0.1, size: 24 });
  accent(s, 0.4, 0.1, 0.55);

  const problems = [
    ["🔀", "Tab Switching", "Students switch tabs to search answers on Google mid-exam"],
    ["📋", "Copy-Pasting",  "Answers copied from notes, PDFs, or other websites"],
    ["👥", "Extra People",  "Friend or family member physically present to assist"],
    ["🛠️", "DevTools",      "Browser developer tools used to inspect answers or manipulate DOM"],
    ["👁️", "No Supervision","Teacher has zero visibility into what students are doing"],
  ];

  problems.forEach(([icon, head, desc], i) => {
    const x = 0.4, y = 0.95 + i * 0.82;
    card(s, x, y, 9.1, 0.7, C.bg2);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.07, h: 0.7, fill: { color: C.red }, line: { color: C.red, width: 0 } });
    s.addText(icon,  { x: 0.6, y, w: 0.5, h: 0.7, fontSize: 18, align: "center", valign: "middle", margin: 0 });
    s.addText(head,  { x: 1.22, y: y + 0.05, w: 2.2, h: 0.3, fontSize: 12, bold: true, color: C.white, margin: 0 });
    s.addText(desc,  { x: 1.22, y: y + 0.33, w: 8.0, h: 0.28, fontSize: 9.5, color: C.gray, margin: 0 });
  });

  // Bold bottom statement
  s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 5.1, w: 9.1, h: 0.32, fill: { color: "3b0a0a" }, line: { color: C.red, width: 1 } });
  s.addText('❌  "Traditional online exams have zero enforcement"', {
    x: 0.4, y: 5.1, w: 9.1, h: 0.32, fontSize: 11.5, bold: true, color: C.red, align: "center", valign: "middle", margin: 0,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — OUR SOLUTION
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.75, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "Exam Knight — Our Solution", { y: 0.1, size: 24 });
  accent(s, 0.4, 0.1, 0.55);

  const cols = [
    { icon: "🤖", color: C.purple, head: "AI Monitoring",      sub: "Face Detection",    points: ["BlazeFace TensorFlow.js model","Detects 0 or multiple faces","Every 3 seconds via webcam","Camera denial is logged"] },
    { icon: "📡", color: C.cyan,   head: "Real-Time Proctoring",sub: "WebSocket Alerts",  points: ["Socket.io live connection","Teacher sees violations instantly","Student join/leave tracking","Live proctoring dashboard"] },
    { icon: "🛡️", color: C.green,  head: "Browser Enforcement", sub: "8 Anti-Cheat Layers",points: ["Fullscreen enforcement","Tab-switch detection","Copy/paste blocked","DevTools blocked"] },
  ];

  cols.forEach((c, i) => {
    const x = 0.35 + i * 3.12, y = 0.95, w = 2.95, h = 3.85;
    card(s, x, y, w, h, C.bg2);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.08, fill: { color: c.color }, line: { color: c.color, width: 0 } });
    s.addText(c.icon, { x, y: y + 0.15, w, h: 0.55, fontSize: 28, align: "center", margin: 0 });
    s.addText(c.head, { x, y: y + 0.72, w, h: 0.38, fontSize: 13, bold: true, color: C.white, align: "center", margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.35, y: y + 1.08, w: w - 0.7, h: 0.26, fill: { color: c.color, transparency: 75 }, rectRadius: 0.05, line: { color: c.color, width: 0 } });
    s.addText(c.sub, { x: x + 0.35, y: y + 1.08, w: w - 0.7, h: 0.26, fontSize: 9, bold: true, color: c.color, align: "center", valign: "middle", margin: 0 });
    c.points.forEach((pt, j) => {
      s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 1.52 + j * 0.5, w: 0.08, h: 0.08, fill: { color: c.color }, line: { color: c.color, width: 0 } });
      s.addText(pt, { x: x + 0.36, y: y + 1.46 + j * 0.5, w: w - 0.5, h: 0.3, fontSize: 9.5, color: C.grayLt, margin: 0 });
    });
  });

  // Tagline
  s.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: 4.98, w: 9.3, h: 0.38, fill: { color: C.indigoDk }, line: { color: C.indigo, width: 1 } });
  s.addText("✅  Multi-layered security that makes cheating extremely difficult to go undetected", {
    x: 0.35, y: 4.98, w: 9.3, h: 0.38, fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle", margin: 0,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — KEY FEATURES
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.75, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "Key Features", { y: 0.1, size: 24 });
  accent(s, 0.4, 0.1, 0.55);

  const feats = [
    { icon: "👥", color: C.indigo,  head: "3 User Roles",          desc: "Admin · Teacher · Student" },
    { icon: "🛡️", color: C.red,     head: "8 Anti-Cheat Layers",    desc: "Browser-level enforcement" },
    { icon: "🤖", color: C.purple,  head: "AI Face Detection",       desc: "TensorFlow.js BlazeFace" },
    { icon: "📡", color: C.cyan,    head: "Live Proctoring",         desc: "WebSocket real-time alerts" },
    { icon: "💻", color: C.green,   head: "Code Execution",          desc: "8 languages via Piston API" },
    { icon: "⏰", color: C.yellow,  head: "Auto Scheduling",         desc: "node-cron every minute" },
    { icon: "📧", color: C.orange,  head: "Email Notifications",     desc: "nodemailer welcome & results" },
    { icon: "📥", color: "0ea5e9",  head: "Bulk CSV Import",         desc: "Users & questions at scale" },
  ];

  feats.forEach((f, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.3 + col * 2.37, y = 0.9 + row * 2.15, w = 2.2, h = 1.9;
    card(s, x, y, w, h, C.bg2);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.06, fill: { color: f.color }, line: { color: f.color, width: 0 } });
    s.addText(f.icon, { x, y: y + 0.12, w, h: 0.55, fontSize: 24, align: "center", margin: 0 });
    s.addText(f.head, { x, y: y + 0.7, w, h: 0.38, fontSize: 11, bold: true, color: C.white, align: "center", margin: 0 });
    s.addText(f.desc, { x, y: y + 1.1, w, h: 0.55, fontSize: 9, color: C.gray, align: "center", margin: 0 });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — TECH STACK
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.75, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "Technology Stack", { y: 0.1, size: 24 });
  accent(s, 0.4, 0.1, 0.55);

  const sections = [
    { label: "FRONTEND", color: C.cyan, x: 0.3, items: [
      ["React 18", "UI library — component-based, virtual DOM"],
      ["React Router v6", "Client-side routing & protected routes"],
      ["Axios", "HTTP client with JWT interceptor"],
      ["Socket.io-client", "WebSocket real-time connection"],
      ["TensorFlow.js", "ML model inference in browser"],
      ["Chart.js", "Dashboard analytics & charts"],
    ]},
    { label: "BACKEND", color: C.green, x: 3.55, items: [
      ["Node.js + Express", "REST API server, middleware pipeline"],
      ["PostgreSQL", "Relational DB — ACID, JSONB, UUID"],
      ["Sequelize ORM", "Models, associations & queries"],
      ["Socket.io", "WebSocket server with JWT auth"],
      ["node-cron", "Exam lifecycle scheduler"],
      ["nodemailer", "Email service with SMTP"],
    ]},
    { label: "INFRASTRUCTURE", color: C.purple, x: 6.8, items: [
      ["Docker", "Containerised server & client"],
      ["Nginx", "Serves React build in production"],
      ["Neon (Postgres)", "Serverless cloud database"],
      ["Piston API", "Sandboxed code execution"],
      ["bcryptjs", "Password hashing (12 rounds)"],
      ["Helmet + Rate Limit", "HTTP security headers"],
    ]},
  ];

  sections.forEach(sec => {
    const w = 3.1, y = 0.9, h = 4.55;
    card(s, sec.x, y, w, h, C.bg2);
    s.addShape(pres.shapes.RECTANGLE, { x: sec.x, y, w, h: 0.35, fill: { color: sec.color, transparency: 20 }, line: { color: sec.color, width: 0 } });
    s.addText(sec.label, { x: sec.x, y, w, h: 0.35, fontSize: 10, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    sec.items.forEach(([name, desc], i) => {
      const iy = y + 0.45 + i * 0.68;
      s.addShape(pres.shapes.OVAL, { x: sec.x + 0.15, y: iy + 0.03, w: 0.1, h: 0.1, fill: { color: sec.color }, line: { color: sec.color, width: 0 } });
      s.addText(name, { x: sec.x + 0.32, y: iy, w: w - 0.4, h: 0.25, fontSize: 10.5, bold: true, color: C.white, margin: 0 });
      s.addText(desc, { x: sec.x + 0.32, y: iy + 0.25, w: w - 0.4, h: 0.28, fontSize: 8.5, color: C.gray, margin: 0 });
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — SYSTEM ARCHITECTURE
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "System Architecture", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  // Browser box
  s.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 0.78, w: 5, h: 1.05, fill: { color: C.bg2 }, line: { color: C.cyan, width: 1.5 } });
  s.addText("🌐  BROWSER  (React 18 SPA)", { x: 2.5, y: 0.78, w: 5, h: 0.32, fontSize: 10, bold: true, color: C.cyan, align: "center", valign: "middle", margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 2.5, y: 1.1, w: 5, h: 0, line: { color: C.cyan, width: 0.5 } });
  s.addText("AuthContext  ·  SocketContext  ·  useAntiCheat  ·  FaceDetection  ·  CodeRunner", {
    x: 2.5, y: 1.12, w: 5, h: 0.5, fontSize: 8.5, color: C.grayLt, align: "center", margin: 0,
  });

  // Arrows from browser
  s.addShape(pres.shapes.LINE, { x: 3.5, y: 1.83, w: 0, h: 0.65, line: { color: C.green, width: 1.5 } });
  s.addText("REST API", { x: 3.0, y: 2.08, w: 1.1, h: 0.22, fontSize: 8, color: C.green, align: "center", margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 6.5, y: 1.83, w: 0, h: 0.65, line: { color: C.purple, width: 1.5 } });
  s.addText("WebSocket", { x: 6.1, y: 2.08, w: 1.2, h: 0.22, fontSize: 8, color: C.purple, align: "center", margin: 0 });

  // Server box
  s.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 2.48, w: 7, h: 1.3, fill: { color: C.bg2 }, line: { color: C.indigo, width: 1.5 } });
  s.addText("⚙️  NODE.JS + EXPRESS SERVER", { x: 1.5, y: 2.48, w: 7, h: 0.32, fontSize: 10, bold: true, color: C.indigo, align: "center", valign: "middle", margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 1.5, y: 2.8, w: 7, h: 0, line: { color: C.indigo, width: 0.5 } });

  const serverItems = [
    ["REST Routes", C.green], ["Socket.io", C.purple], ["node-cron", C.yellow], ["Sequelize ORM", C.cyan],
  ];
  serverItems.forEach(([lbl, c], i) => {
    const sx = 1.7 + i * 1.7;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: sx, y: 2.88, w: 1.5, h: 0.75, fill: { color: c, transparency: 80 }, rectRadius: 0.06, line: { color: c, width: 0.5 } });
    s.addText(lbl, { x: sx, y: 2.88, w: 1.5, h: 0.75, fontSize: 9, bold: true, color: c, align: "center", valign: "middle", margin: 0 });
  });

  // Arrow to DB
  s.addShape(pres.shapes.LINE, { x: 5, y: 3.78, w: 0, h: 0.55, line: { color: "3b82f6", width: 1.5 } });

  // DB box
  s.addShape(pres.shapes.RECTANGLE, { x: 2.8, y: 4.33, w: 4.4, h: 0.72, fill: { color: C.bg2 }, line: { color: "3b82f6", width: 1.5 } });
  s.addText("🗄️  PostgreSQL  (Neon Serverless)", { x: 2.8, y: 4.33, w: 4.4, h: 0.72, fontSize: 11, bold: true, color: "3b82f6", align: "center", valign: "middle", margin: 0 });

  // External APIs
  s.addShape(pres.shapes.RECTANGLE, { x: 7.7, y: 2.48, w: 2.0, h: 0.6, fill: { color: C.bg2 }, line: { color: C.orange, width: 1 } });
  s.addText("🔧 Piston API\n(Code Execution)", { x: 7.7, y: 2.48, w: 2.0, h: 0.6, fontSize: 8.5, color: C.orange, align: "center", valign: "middle", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 7.7, y: 3.2, w: 2.0, h: 0.6, fill: { color: C.bg2 }, line: { color: C.yellow, width: 1 } });
  s.addText("📧 SMTP Server\n(Emails)", { x: 7.7, y: 3.2, w: 2.0, h: 0.6, fontSize: 8.5, color: C.yellow, align: "center", valign: "middle", margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 7.7, y: 2.78, w: -0.2, h: 0, line: { color: C.orange, width: 1 } });
  s.addShape(pres.shapes.LINE, { x: 7.7, y: 3.5, w: -0.2, h: 0, line: { color: C.yellow, width: 1 } });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — DATABASE SCHEMA
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "Database Design — 7 Models", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  const models = [
    { name: "Users",         color: C.indigo,  x: 0.3,  y: 0.8,  fields: ["id (UUID)", "name, email", "password (bcrypt)", "role (ENUM)", "isActive"] },
    { name: "Exams",         color: "3b82f6",  x: 3.3,  y: 0.8,  fields: ["id (UUID)", "title, duration", "startTime, endTime", "status (ENUM)", "createdBy (FK)"] },
    { name: "Questions",     color: C.cyan,    x: 6.4,  y: 0.8,  fields: ["id (UUID)", "examId (FK)", "type (ENUM)", "marks, order", "testCases (JSONB)"] },
    { name: "Options",       color: C.green,   x: 7.6,  y: 3.2,  fields: ["id (UUID)", "questionId (FK)", "text, isCorrect", "order"] },
    { name: "Submissions",   color: C.orange,  x: 3.3,  y: 3.2,  fields: ["id (UUID)", "examId, studentId", "startedAt, submittedAt", "totalScore", "suspiciousActivity"] },
    { name: "Answers",       color: C.yellow,  x: 0.3,  y: 3.2,  fields: ["id (UUID)", "submissionId (FK)", "questionId (FK)", "textAnswer", "marksAwarded"] },
    { name: "ProctoringLogs",color: C.red,     x: 5.8,  y: 3.2,  fields: ["id (UUID)", "submissionId (FK)", "eventType (ENUM)", "details (JSONB)", "timestamp"] },
  ];

  const bw = 2.6, bh = 1.92;
  models.forEach(m => {
    s.addShape(pres.shapes.RECTANGLE, { x: m.x, y: m.y, w: bw, h: bh, fill: { color: C.bg2 }, line: { color: m.color, width: 1.2 }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: m.x, y: m.y, w: bw, h: 0.32, fill: { color: m.color }, line: { color: m.color, width: 0 } });
    s.addText(m.name, { x: m.x, y: m.y, w: bw, h: 0.32, fontSize: 10, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    m.fields.forEach((f, i) => {
      s.addText(f, { x: m.x + 0.1, y: m.y + 0.38 + i * 0.3, w: bw - 0.2, h: 0.28, fontSize: 8.5, color: C.grayLt, margin: 0 });
    });
  });

  // Relationship arrows (lines)
  const arrows = [
    [1.6, 1.3, 3.3, 1.3, C.indigo],    // Users→Exams
    [5.9, 1.3, 6.4, 1.3, "3b82f6"],    // Exams→Questions
    [7.7, 2.72, 7.7, 3.2, C.cyan],     // Questions→Options
    [4.6, 2.72, 4.6, 3.2, "3b82f6"],   // Exams→Submissions
    [3.3, 4.16, 2.9, 4.16, C.orange],  // Submissions→Answers
    [5.9, 4.16, 5.8, 4.16, C.orange],  // Submissions→ProctoringLogs
  ];
  arrows.forEach(([x1,y1,x2,y2,c]) => {
    s.addShape(pres.shapes.LINE, { x: x1, y: y1, w: x2-x1, h: y2-y1, line: { color: c, width: 1 } });
  });

  const relLabels = [
    [2.1, 1.05, "creates"],
    [5.8, 1.05, "has"],
    [7.2, 2.92, "has"],
    [4.2, 2.88, "has"],
    [2.8, 3.95, "has"],
    [5.2, 3.95, "has"],
  ];
  relLabels.forEach(([x, y, lbl]) => {
    s.addText(lbl, { x, y, w: 0.7, h: 0.22, fontSize: 7.5, color: C.gray, align: "center", italic: true, margin: 0 });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — THREE USER ROLES
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "Role-Based Access Control (RBAC)", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  const roles = [
    { icon: "👨‍🎓", label: "STUDENT", color: C.cyan, x: 0.3,
      perms: ["Take available exams", "View own results & scores", "Run code (coding questions)", "Monitored by anti-cheat system", "Real-time webcam monitoring"] },
    { icon: "👨‍🏫", label: "TEACHER", color: C.green, x: 3.55,
      perms: ["All Student permissions", "Create & manage exams", "Add / edit questions", "Publish & schedule exams", "Monitor students live", "Grade subjective answers", "Bulk import questions (CSV)"] },
    { icon: "👨‍💼", label: "ADMIN",   color: C.indigo, x: 6.8,
      perms: ["All Teacher permissions", "Manage all users & roles", "Activate / deactivate accounts", "View all proctoring logs", "Bulk import users (CSV)", "Access full dashboard stats"] },
  ];

  roles.forEach(r => {
    const w = 3.0, y = 0.85, h = 4.58;
    card(s, r.x, y, w, h, C.bg2);
    s.addShape(pres.shapes.RECTANGLE, { x: r.x, y, w, h: 0.08, fill: { color: r.color }, line: { color: r.color, width: 0 } });
    s.addText(r.icon, { x: r.x, y: y + 0.1, w, h: 0.6, fontSize: 30, align: "center", margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: r.x + 0.4, y: y + 0.73, w: w - 0.8, h: 0.32, fill: { color: r.color }, rectRadius: 0.06, line: { color: r.color, width: 0 } });
    s.addText(r.label, { x: r.x + 0.4, y: y + 0.73, w: w - 0.8, h: 0.32, fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    r.perms.forEach((p, i) => {
      s.addShape(pres.shapes.OVAL, { x: r.x + 0.2, y: y + 1.22 + i * 0.5, w: 0.09, h: 0.09, fill: { color: r.color }, line: { color: r.color, width: 0 } });
      s.addText(p, { x: r.x + 0.38, y: y + 1.16 + i * 0.5, w: w - 0.5, h: 0.35, fontSize: 9.5, color: C.grayLt, margin: 0 });
    });
  });

  // Hierarchy arrow
  s.addText("▶", { x: 3.18, y: 2.9, w: 0.3, h: 0.3, fontSize: 12, color: C.gray, align: "center", margin: 0 });
  s.addText("▶", { x: 6.42, y: 2.9, w: 0.3, h: 0.3, fontSize: 12, color: C.gray, align: "center", margin: 0 });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — ANTI-CHEAT SYSTEM
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "8-Layer Anti-Cheat System", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  const layers = [
    { n: "1", icon: "⛶",  head: "Fullscreen",        desc: "Auto-requests & re-enters on exit",       color: C.red },
    { n: "2", icon: "🔄",  head: "Tab Switch",         desc: "Warnings at 3 & 5 switches, then flag",  color: C.orange },
    { n: "3", icon: "📋",  head: "Copy/Paste Block",   desc: "All clipboard operations blocked",       color: C.yellow },
    { n: "4", icon: "🖱️",  head: "Right-Click",        desc: "Context menu completely disabled",        color: C.green },
    { n: "5", icon: "🔧",  head: "DevTools Block",     desc: "F12, Ctrl+Shift+I/J/C blocked",          color: C.cyan },
    { n: "6", icon: "📐",  head: "Resize Detection",   desc: "Catches side-by-side window tricks",     color: "3b82f6" },
    { n: "7", icon: "😴",  head: "Inactivity Alert",   desc: "2-minute timeout triggers warning",      color: C.purple },
    { n: "8", icon: "✋",  head: "Text Selection CSS", desc: "Cannot drag-select text on page",        color: C.indigo },
  ];

  layers.forEach((l, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.3 + col * 2.38, y = 0.82 + row * 2.18, w = 2.2, h = 1.95;
    card(s, x, y, w, h, C.bg2);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.36, h: h, fill: { color: l.color, transparency: 80 }, line: { color: l.color, width: 0 } });
    s.addText(l.n, { x, y, w: 0.36, h: 0.5, fontSize: 11, bold: true, color: l.color, align: "center", valign: "middle", margin: 0 });
    s.addText(l.icon, { x, y: y + 0.55, w: 0.36, h: 0.55, fontSize: 18, align: "center", margin: 0 });
    s.addText(l.head, { x: x + 0.42, y: y + 0.12, w: w - 0.5, h: 0.38, fontSize: 11.5, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.LINE, { x: x + 0.42, y: y + 0.52, w: w - 0.55, h: 0, line: { color: C.cardBd, width: 0.4 } });
    s.addText(l.desc, { x: x + 0.42, y: y + 0.6, w: w - 0.5, h: 0.9, fontSize: 9, color: C.gray, margin: 0 });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — AI FACE DETECTION
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "AI-Powered Face Detection", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  // Pipeline steps
  const steps = [
    { n:"1", icon:"⚡", head:"TF.js Ready",      desc:"TensorFlow.js initialises WebGL backend in browser" },
    { n:"2", icon:"📦", head:"Model Loaded",      desc:"BlazeFace model auto-downloads from tfhub CDN (~1.2MB)" },
    { n:"3", icon:"📷", head:"Webcam Active",     desc:"getUserMedia captures 320x240 video stream" },
    { n:"4", icon:"🔍", head:"Detect Every 3s",   desc:"estimateFaces() processes each frame" },
    { n:"5", icon:"📊", head:"Count Faces",       desc:"Returns array of bounding boxes per frame" },
    { n:"6", icon:"📤", head:"Log & Alert",       desc:"0 faces → face_not_detected  |  2+ faces → multiple_faces" },
  ];

  steps.forEach((st, i) => {
    const x = 0.3 + i * 1.57, y = 0.85;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.42, h: 2.35, fill: { color: C.bg2 }, line: { color: C.purple, width: 0.8 } });
    s.addShape(pres.shapes.OVAL, { x: x + 0.51, y: y + 0.08, w: 0.4, h: 0.4, fill: { color: C.purple }, line: { color: C.purple, width: 0 } });
    s.addText(st.n, { x: x + 0.51, y: y + 0.08, w: 0.4, h: 0.4, fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    s.addText(st.icon, { x, y: y + 0.52, w: 1.42, h: 0.45, fontSize: 20, align: "center", margin: 0 });
    s.addText(st.head, { x, y: y + 1.0, w: 1.42, h: 0.35, fontSize: 9.5, bold: true, color: C.white, align: "center", margin: 0 });
    s.addText(st.desc, { x, y: y + 1.35, w: 1.42, h: 0.8, fontSize: 8, color: C.gray, align: "center", margin: 0 });
    if (i < 5) s.addShape(pres.shapes.LINE, { x: x + 1.42, y: y + 1.17, w: 0, h: 0, line: { color: C.purple, width: 1 } });
  });

  // Connect arrows
  for (let i = 0; i < 5; i++) {
    const ax = 1.72 + i * 1.57;
    s.addText("→", { x: ax, y: 1.72, w: 0.25, h: 0.3, fontSize: 14, color: C.purple, align: "center", margin: 0 });
  }

  // Outcome boxes
  const outcomes = [
    { color: C.green, label: "1 Face ✅", sub: "Normal — no action" },
    { color: C.red,   label: "0 Faces ❌", sub: "Logs face_not_detected" },
    { color: C.orange,label: "2+ Faces ⚠️", sub: "Logs multiple_faces" },
  ];
  outcomes.forEach((o, i) => {
    const x = 0.3 + i * 3.12, y = 3.45;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.95, h: 0.75, fill: { color: C.bg2 }, line: { color: o.color, width: 1.2 } });
    s.addText(o.label, { x, y, w: 2.95, h: 0.38, fontSize: 12, bold: true, color: o.color, align: "center", valign: "middle", margin: 0 });
    s.addText(o.sub,   { x, y: y + 0.37, w: 2.95, h: 0.3, fontSize: 9, color: C.gray, align: "center", margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 4.42, w: 9.4, h: 0.85, fill: { color: "1a1030" }, line: { color: C.purple, width: 0.8 } });
  s.addText("🔒  Runs 100% in the browser — no video is ever sent to the server  |  Privacy preserved", {
    x: 0.3, y: 4.42, w: 9.4, h: 0.85, fontSize: 11, bold: true, color: C.purple, align: "center", valign: "middle", margin: 0,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — REAL-TIME PROCTORING
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "Real-Time Teacher Monitoring", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  // Student side
  card(s, 0.3, 0.82, 3.5, 3.6, C.bg2);
  s.addText("👨‍🎓  STUDENT", { x: 0.3, y: 0.82, w: 3.5, h: 0.38, fontSize: 11, bold: true, color: C.cyan, align: "center", valign: "middle", margin: 0 });
  const studentEvents = [
    ["🔀", "Switches tab", C.red],
    ["📋", "Attempts copy", C.orange],
    ["👥", "2nd face detected", C.purple],
    ["⛶", "Exits fullscreen", C.yellow],
  ];
  studentEvents.forEach(([icon, evt, c], i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.48, y: 1.3 + i * 0.75, w: 3.14, h: 0.62, fill: { color: c, transparency: 85 }, line: { color: c, width: 0.5 } });
    s.addText(icon, { x: 0.55, y: 1.3 + i * 0.75, w: 0.45, h: 0.62, fontSize: 16, align: "center", valign: "middle", margin: 0 });
    s.addText(evt, { x: 1.05, y: 1.3 + i * 0.75, w: 2.4, h: 0.62, fontSize: 10, color: C.white, valign: "middle", margin: 0 });
  });

  // Arrow + Socket label
  s.addShape(pres.shapes.LINE, { x: 3.8, y: 2.62, w: 2.4, h: 0, line: { color: C.indigo, width: 2 } });
  s.addText("📡", { x: 4.55, y: 2.25, w: 0.5, h: 0.4, fontSize: 20, align: "center", margin: 0 });
  s.addText("WebSocket", { x: 4.3, y: 2.62, w: 1.4, h: 0.28, fontSize: 9, bold: true, color: C.indigo, align: "center", margin: 0 });
  s.addText("Socket.io Room", { x: 4.25, y: 2.88, w: 1.5, h: 0.22, fontSize: 8, color: C.gray, align: "center", margin: 0 });
  s.addText("exam:{id}", { x: 4.35, y: 3.1, w: 1.3, h: 0.22, fontSize: 8, color: C.gray, align: "center", margin: 0 });

  // Teacher side
  card(s, 6.2, 0.82, 3.5, 3.6, C.bg2);
  s.addText("👨‍🏫  TEACHER MONITOR", { x: 6.2, y: 0.82, w: 3.5, h: 0.38, fontSize: 11, bold: true, color: C.green, align: "center", valign: "middle", margin: 0 });
  const teacherItems = [
    "🔴  Live violation alerts",
    "👥  Students online count",
    "📊  Suspicious activity flags",
    "⚠️  Tab switch counter per student",
  ];
  teacherItems.forEach((item, i) => {
    s.addText(item, { x: 6.38, y: 1.3 + i * 0.78, w: 3.14, h: 0.65, fontSize: 10, color: C.grayLt, margin: 0, valign: "middle" });
  });

  // Socket events table
  card(s, 0.3, 4.6, 9.4, 0.72, "0f1f30");
  const evts = ["join_exam", "heartbeat (30s)", "proctoring_alert", "student_joined", "student_left"];
  s.addText("Socket Events: ", { x: 0.45, y: 4.65, w: 1.4, h: 0.5, fontSize: 9, bold: true, color: C.indigo, margin: 0 });
  evts.forEach((e, i) => badge(s, e, 1.9 + i * 1.56, 4.72, C.white, C.indigoDk));
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — CODE EXECUTION ENGINE
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "Live Code Execution Engine", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  // Flow
  const flow = [
    { icon: "✍️", label: "Student Writes Code", sub: "Monaco-style textarea\nLanguage selector" },
    { icon: "▶️", label: "Clicks Run Code",       sub: "POST /submissions\n/:id/run-code" },
    { icon: "📤", label: "Server → Piston API",   sub: "Sandboxed container\n5s timeout limit" },
    { icon: "📥", label: "Result Returned",        sub: "stdout, stderr\nexit code" },
    { icon: "✅", label: "Test Cases Run",          sub: "Expected vs Actual\nPass/Fail per case" },
  ];
  flow.forEach((f, i) => {
    const x = 0.3 + i * 1.87, y = 0.82, w = 1.72, h = 2.15;
    card(s, x, y, w, h, C.bg2);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.06, fill: { color: C.green }, line: { color: C.green, width: 0 } });
    s.addText(f.icon, { x, y: y + 0.1, w, h: 0.5, fontSize: 22, align: "center", margin: 0 });
    s.addText(f.label, { x, y: y + 0.65, w, h: 0.5, fontSize: 9.5, bold: true, color: C.white, align: "center", margin: 0 });
    s.addText(f.sub, { x, y: y + 1.18, w, h: 0.75, fontSize: 8.5, color: C.gray, align: "center", margin: 0 });
    if (i < 4) s.addText("→", { x: x + w, y: y + 0.88, w: 0.22, h: 0.32, fontSize: 14, color: C.green, align: "center", margin: 0 });
  });

  // Languages
  s.addText("Supported Languages", { x: 0.3, y: 3.18, w: 4, h: 0.32, fontSize: 11, bold: true, color: C.white, margin: 0 });
  const langs = [["Python","fbbf24"],["JavaScript","f59e0b"],["Java","f97316"],["C++","ef4444"],["C","dc2626"],["Go","06b6d4"],["Rust","a855f7"],["Ruby","ec4899"]];
  langs.forEach(([l, c], i) => badge(s, l, 0.3 + i * 1.2, 3.58, C.white, c));

  // Security note
  card(s, 0.3, 4.12, 9.4, 1.25, "061a12");
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 4.12, w: 0.07, h: 1.25, fill: { color: C.green }, line: { color: C.green, width: 0 } });
  s.addText("🔒  Security", { x: 0.5, y: 4.22, w: 2, h: 0.3, fontSize: 11, bold: true, color: C.green, margin: 0 });
  s.addText([
    { text: "Code runs in Piston's isolated Docker containers — ", options: {} },
    { text: "never on our server.", options: { bold: true } },
    { text: " CPU time limit: 5s. Memory limit enforced. No network access inside sandbox.", options: {} },
  ], { x: 0.5, y: 4.55, w: 9.0, h: 0.55, fontSize: 10, color: C.grayLt, margin: 0 });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 13 — EXAM LIFECYCLE
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "Automated Exam Lifecycle", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  // States
  const states = [
    { label: "DRAFT",     color: C.gray,   x: 0.4,  y: 1.5 },
    { label: "PUBLISHED", color: C.cyan,   x: 2.8,  y: 1.5 },
    { label: "ACTIVE",    color: C.green,  x: 5.2,  y: 1.5 },
    { label: "COMPLETED", color: C.indigo, x: 7.6,  y: 1.5 },
  ];
  states.forEach(st => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: st.x, y: st.y, w: 2.2, h: 0.7, fill: { color: st.color, transparency: 20 }, rectRadius: 0.1, line: { color: st.color, width: 1.5 } });
    s.addText(st.label, { x: st.x, y: st.y, w: 2.2, h: 0.7, fontSize: 13, bold: true, color: st.color, align: "center", valign: "middle", margin: 0 });
  });

  // Horizontal arrows
  const hArrows = [
    [2.6, 1.85, "Teacher\nPublishes"],
    [5.0, 1.85, "cron: startTime\nreached"],
    [7.4, 1.85, "cron: endTime\nreached"],
  ];
  hArrows.forEach(([x, y, lbl]) => {
    s.addShape(pres.shapes.LINE, { x, y, w: 0.22, h: 0, line: { color: C.gray, width: 1.2 } });
    s.addText(lbl, { x: x - 0.6, y: y - 0.52, w: 1.4, h: 0.48, fontSize: 7.5, color: C.gray, align: "center", margin: 0 });
  });

  // ACTIVE branches down
  s.addShape(pres.shapes.LINE, { x: 6.3, y: 2.2, w: 0, h: 0.65, line: { color: C.yellow, width: 1.2 } });
  s.addShape(pres.shapes.LINE, { x: 6.3, y: 2.85, w: -3.0, h: 0, line: { color: C.yellow, width: 1.2 } });
  s.addText("Student Submits", { x: 6.35, y: 2.5, w: 1.8, h: 0.32, fontSize: 8, color: C.yellow, margin: 0 });

  const subStates = [
    { label: "SUBMITTED", color: C.yellow,  x: 2.6,  y: 2.85 },
    { label: "GRADED",    color: C.orange,  x: 5.0,  y: 2.85 },
  ];
  subStates.forEach(st => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: st.x, y: st.y, w: 2.2, h: 0.65, fill: { color: st.color, transparency: 20 }, rectRadius: 0.1, line: { color: st.color, width: 1.5 } });
    s.addText(st.label, { x: st.x, y: st.y, w: 2.2, h: 0.65, fontSize: 12, bold: true, color: st.color, align: "center", valign: "middle", margin: 0 });
  });
  s.addShape(pres.shapes.LINE, { x: 4.8, y: 3.17, w: 0.22, h: 0, line: { color: C.gray, width: 1.2 } });
  s.addText("Teacher\nGrades", { x: 4.35, y: 2.88, w: 1, h: 0.42, fontSize: 7.5, color: C.gray, align: "center", margin: 0 });

  // Auto-submit note
  s.addShape(pres.shapes.RECTANGLE, { x: 7.6, y: 2.48, w: 2.1, h: 1.05, fill: { color: "0a1a10" }, line: { color: C.green, width: 0.8 } });
  s.addText("⏰  Auto-Submit", { x: 7.6, y: 2.5, w: 2.1, h: 0.3, fontSize: 9, bold: true, color: C.green, align: "center", margin: 0 });
  s.addText("cron detects end time\n→ auto-submits all\nin-progress submissions", { x: 7.65, y: 2.78, w: 2.0, h: 0.65, fontSize: 8, color: C.grayLt, align: "center", margin: 0 });

  // Cron box
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.82, w: 9.4, h: 1.08, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0.5 } });
  s.addText("🕐  node-cron schedule: * * * * *  (every minute)", { x: 0.4, y: 3.88, w: 9.2, h: 0.36, fontSize: 11, bold: true, color: C.yellow, margin: 0 });
  s.addText("Checks: published exams with startTime ≤ now  →  ACTIVE  |  active exams with endTime ≤ now  →  COMPLETED", {
    x: 0.4, y: 4.24, w: 9.2, h: 0.45, fontSize: 9.5, color: C.gray, margin: 0,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 14 — API DESIGN
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "REST API — 20+ Endpoints", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  const groups = [
    { base: "/api/auth",        color: C.cyan,    x: 0.3,  y: 0.82, endpoints: ["POST /register", "POST /login", "GET /profile", "PUT /profile"] },
    { base: "/api/exams",       color: "3b82f6",  x: 2.35, y: 0.82, endpoints: ["GET /all  GET /my-exams", "POST /  PUT /:id", "DELETE /:id", "POST /:id/publish", "GET /:id/submissions", "POST /:id/questions"] },
    { base: "/api/submissions", color: C.green,   x: 4.4,  y: 0.82, endpoints: ["POST /start/:examId", "POST /:id/answer", "POST /:id/submit", "POST /:id/run-code", "POST /:id/proctor-log", "GET /my-submissions"] },
    { base: "/api/admin",       color: C.purple,  x: 6.45, y: 0.82, endpoints: ["GET /dashboard", "GET/POST /users", "PUT/DELETE /users/:id", "GET /proctoring-logs"] },
    { base: "/api/import",      color: C.orange,  x: 8.3,  y: 0.82, endpoints: ["POST /users", "POST /questions/:id", "GET /template/users", "GET /template/questions"] },
  ];

  groups.forEach(g => {
    const w = 1.85, h = 4.6;
    card(s, g.x, g.y, w, h, C.bg2);
    s.addShape(pres.shapes.RECTANGLE, { x: g.x, y: g.y, w, h: 0.32, fill: { color: g.color }, line: { color: g.color, width: 0 } });
    s.addText(g.base, { x: g.x, y: g.y, w, h: 0.32, fontSize: 7.5, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    g.endpoints.forEach((ep, i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: g.x + 0.08, y: g.y + 0.42 + i * 0.68, w: w - 0.16, h: 0.6, fill: { color: C.bg, transparency: 0 }, line: { color: C.cardBd, width: 0.3 } });
      s.addText(ep, { x: g.x + 0.1, y: g.y + 0.42 + i * 0.68, w: w - 0.2, h: 0.6, fontSize: 8, color: g.color, fontFace: "Courier New", margin: 0, valign: "middle" });
    });
  });

  // JWT note
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 5.18, w: 9.4, h: 0.3, fill: { color: C.indigoDk }, line: { color: C.indigo, width: 0 } });
  s.addText("🔐  JWT Bearer Token required on all protected routes  |  Role checked via authorize() middleware", {
    x: 0.3, y: 5.18, w: 9.4, h: 0.3, fontSize: 9, bold: true, color: C.grayLt, align: "center", valign: "middle", margin: 0,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 15 — SECURITY
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "Security Implementation", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  const secs = [
    { icon:"🔑", head:"JWT Tokens",          desc:"Stateless auth, 24hr expiry, signed with HS256",  color: C.yellow },
    { icon:"🔒", head:"bcrypt Hashing",       desc:"12 salt rounds, ~250ms per hash (brute-force resistant)", color: C.orange },
    { icon:"🪖", head:"Helmet Headers",       desc:"11 HTTP security headers: CSP, X-Frame, HSTS...", color: C.red },
    { icon:"⏱️", head:"Rate Limiting",        desc:"200/15min general  |  20/15min on auth routes",  color: C.purple },
    { icon:"🌐", head:"CORS Whitelist",        desc:"Only CLIENT_URL origin allowed (not *)",          color: C.cyan },
    { icon:"👮", head:"RBAC Middleware",       desc:"Role checked on every route — 403 if unauthorized", color: C.green },
    { icon:"✅", head:"Input Validation",      desc:"express-validator on all auth inputs",            color: "3b82f6" },
    { icon:"🙈", head:"Answer Sanitization",   desc:"Correct answers stripped before sending to student", color: C.indigo },
  ];

  secs.forEach((sec, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.3 + col * 2.38, y = 0.82 + row * 2.2, w = 2.2, h = 2.0;
    card(s, x, y, w, h, C.bg2);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.06, fill: { color: sec.color }, line: { color: sec.color, width: 0 } });
    s.addText(sec.icon, { x, y: y + 0.1, w, h: 0.5, fontSize: 24, align: "center", margin: 0 });
    s.addText(sec.head, { x, y: y + 0.65, w, h: 0.38, fontSize: 11, bold: true, color: C.white, align: "center", margin: 0 });
    s.addText(sec.desc, { x: x + 0.1, y: y + 1.05, w: w - 0.2, h: 0.82, fontSize: 8.8, color: C.gray, align: "center", margin: 0 });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 16 — DOCKER DEPLOYMENT
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "Production Deployment with Docker", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  // Containers
  const containers = [
    { name: "PostgreSQL 16", icon: "🗄️", color: "3b82f6", desc: "Persistent data volume\npgdata mounted", port: "5432" },
    { name: "Node.js Server", icon: "⚙️", color: C.green,  desc: "Waits for DB healthy\nAll API routes",  port: "5000" },
    { name: "React + Nginx",  icon: "🌐", color: C.orange,  desc: "Multi-stage build\nProxies /api/",     port: "80" },
  ];

  containers.forEach((c, i) => {
    const x = 0.3 + i * 3.2, y = 0.85, w = 3.0, h = 2.8;
    card(s, x, y, w, h, C.bg2);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.08, fill: { color: c.color }, line: { color: c.color, width: 0 } });
    s.addText(c.icon, { x, y: y + 0.12, w, h: 0.6, fontSize: 28, align: "center", margin: 0 });
    s.addText(c.name, { x, y: y + 0.75, w, h: 0.38, fontSize: 13, bold: true, color: C.white, align: "center", margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.95, y: y + 1.15, w: 1.1, h: 0.28, fill: { color: c.color, transparency: 70 }, rectRadius: 0.05, line: { color: c.color, width: 0.5 } });
    s.addText("port " + c.port, { x: x + 0.95, y: y + 1.15, w: 1.1, h: 0.28, fontSize: 9, bold: true, color: c.color, align: "center", valign: "middle", margin: 0 });
    s.addText(c.desc, { x: x + 0.15, y: y + 1.55, w: w - 0.3, h: 0.72, fontSize: 10, color: C.gray, align: "center", margin: 0 });
  });

  // Command box
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.85, w: 9.4, h: 0.48, fill: { color: C.bg }, line: { color: C.green, width: 1 } });
  s.addText("$  docker-compose up --build", {
    x: 0.5, y: 3.85, w: 9.2, h: 0.48, fontSize: 16, bold: true, color: C.green, fontFace: "Courier New", valign: "middle", margin: 0,
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 4.42, w: 9.4, h: 0.88, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0.5 } });
  const envVars = [["DATABASE_URL","Neon connection string"],["JWT_SECRET","Signing key"],["CLIENT_URL","CORS whitelist"],["SMTP_*","Email config (optional)"]];
  s.addText("Environment Variables:", { x: 0.5, y: 4.46, w: 2.5, h: 0.28, fontSize: 9, bold: true, color: C.white, margin: 0 });
  envVars.forEach(([k, v], i) => {
    s.addText(k, { x: 0.5 + i * 2.35, y: 4.74, w: 1.6, h: 0.24, fontSize: 8.5, bold: true, color: C.yellow, fontFace: "Courier New", margin: 0 });
    s.addText(v, { x: 0.5 + i * 2.35, y: 4.95, w: 2.0, h: 0.24, fontSize: 8, color: C.gray, margin: 0 });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 17 — PROJECT BY NUMBERS
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "Project by Numbers", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  const stats = [
    { num: "50+",   label: "Files",                    color: C.indigo },
    { num: "3K+",   label: "Lines of Code",             color: C.cyan },
    { num: "7",     label: "Database Models",           color: "3b82f6" },
    { num: "20+",   label: "API Endpoints",             color: C.green },
    { num: "8",     label: "Anti-Cheat Layers",         color: C.red },
    { num: "8",     label: "Languages Supported",       color: C.orange },
    { num: "11",    label: "Proctoring Event Types",    color: C.purple },
    { num: "3",     label: "User Roles",                color: C.yellow },
  ];

  stats.forEach((st, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.35 + col * 2.35, y = 0.85 + row * 2.3, w = 2.15, h = 2.05;
    card(s, x, y, w, h, C.bg2);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.06, fill: { color: st.color }, line: { color: st.color, width: 0 } });
    s.addText(st.num, { x, y: y + 0.2, w, h: 1.0, fontSize: 52, bold: true, color: st.color, align: "center", fontFace: "Calibri", margin: 0 });
    s.addText(st.label, { x: x + 0.1, y: y + 1.25, w: w - 0.2, h: 0.6, fontSize: 10.5, color: C.grayLt, align: "center", margin: 0 });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 18 — CHALLENGES & LEARNINGS
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "Challenges & What We Learned", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  // Challenges
  card(s, 0.3, 0.82, 4.6, 4.55, C.bg2);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.82, w: 4.6, h: 0.36, fill: { color: C.red, transparency: 15 }, line: { color: C.red, width: 0 } });
  s.addText("⚡  Challenges", { x: 0.3, y: 0.82, w: 4.6, h: 0.36, fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });

  const challenges = [
    ["TF.js Model Loading", "BlazeFace downloads at runtime from external CDN — had to handle loading states and CORS"],
    ["Socket.io Room Isolation", "Ensuring each exam's proctoring events only go to that exam's teachers, not all teachers"],
    ["Anti-Cheat vs UX Balance", "Blocking shortcuts/selection must not break typing in answer textarea"],
    ["Sequelize sync() Bug",     "ALTER TABLE REFERENCES syntax error with alter:true — fixed by using plain sync()"],
    ["Code Sandbox Security",    "Needed sandboxed execution — chose Piston API to avoid running untrusted code locally"],
  ];
  challenges.forEach(([head, desc], i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.38, y: 1.25 + i * 0.72, w: 0.06, h: 0.55, fill: { color: C.red }, line: { color: C.red, width: 0 } });
    s.addText(head, { x: 0.55, y: 1.25 + i * 0.72, w: 4.2, h: 0.25, fontSize: 10, bold: true, color: C.white, margin: 0 });
    s.addText(desc, { x: 0.55, y: 1.5 + i * 0.72, w: 4.2, h: 0.35, fontSize: 8.8, color: C.gray, margin: 0 });
  });

  // Learnings
  card(s, 5.1, 0.82, 4.6, 4.55, C.bg2);
  s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 0.82, w: 4.6, h: 0.36, fill: { color: C.green, transparency: 15 }, line: { color: C.green, width: 0 } });
  s.addText("🎓  Learnings", { x: 5.1, y: 0.82, w: 4.6, h: 0.36, fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });

  const learnings = [
    ["WebSocket Architecture",    "Room-based isolation with Socket.io for scalable real-time multi-user events"],
    ["Browser Security APIs",     "visibilitychange, fullscreenchange, contextmenu — powerful native browser hooks"],
    ["ML in the Browser",         "TensorFlow.js + WebGL backend enables real neural network inference client-side"],
    ["Full-Stack System Design",  "Auth flows, RBAC, ORM associations, rate limiting — production-ready patterns"],
    ["Docker Orchestration",      "Multi-stage builds, health checks, depends_on — professional deployment setup"],
  ];
  learnings.forEach(([head, desc], i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 5.18, y: 1.25 + i * 0.72, w: 0.06, h: 0.55, fill: { color: C.green }, line: { color: C.green, width: 0 } });
    s.addText(head, { x: 5.35, y: 1.25 + i * 0.72, w: 4.2, h: 0.25, fontSize: 10, bold: true, color: C.white, margin: 0 });
    s.addText(desc, { x: 5.35, y: 1.5 + i * 0.72, w: 4.2, h: 0.35, fontSize: 8.8, color: C.gray, margin: 0 });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 19 — FUTURE IMPROVEMENTS
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0 } });
  title(s, "Future Improvements", { y: 0.08, size: 22 });
  accent(s, 0.4, 0.08, 0.5);

  const items = [
    { icon:"🎥", head:"Video Recording",       desc:"Record webcam session to S3, teacher replays alongside proctoring log timeline",     color: C.red },
    { icon:"🧠", head:"AI-Powered Proctoring", desc:"Eye-gaze estimation, emotion detection, speaker recognition using advanced ML models", color: C.purple },
    { icon:"📝", head:"Plagiarism Detection",  desc:"TF-IDF cosine similarity to compare subjective answers across all students in exam",   color: C.orange },
    { icon:"📊", head:"Analytics Dashboard",   desc:"Score distribution, question difficulty heatmap, time-per-question analytics",         color: C.cyan },
    { icon:"⚡", head:"Redis + Scaling",       desc:"socket.io-adapter-redis for horizontal scaling across multiple Node.js instances",      color: C.yellow },
    { icon:"📱", head:"Mobile App",            desc:"React Native app with same anti-cheat features adapted for mobile exam-taking",         color: C.green },
  ];

  items.forEach((item, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.3 + col * 3.18, y = 0.85 + row * 2.28, w = 3.0, h = 2.1;
    card(s, x, y, w, h, C.bg2);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.06, fill: { color: item.color }, line: { color: item.color, width: 0 } });
    s.addText(item.icon, { x, y: y + 0.1, w, h: 0.5, fontSize: 24, align: "center", margin: 0 });
    s.addText(item.head, { x, y: y + 0.63, w, h: 0.38, fontSize: 11, bold: true, color: item.color, align: "center", margin: 0 });
    s.addText(item.desc, { x: x + 0.12, y: y + 1.05, w: w - 0.24, h: 0.9, fontSize: 9, color: C.gray, align: "center", margin: 0 });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 20 — THANK YOU
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  slideBg(s, C.bg);

  // Full background accent bar on left
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.22, h: H, fill: { color: C.indigo }, line: { color: C.indigo, width: 0 } });

  // Top decorative bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.08, fill: { color: C.indigo }, line: { color: C.indigo, width: 0 } });

  s.addText("🙏  Thank You!", { x: 0.5, y: 0.8, w: 9, h: 1.0, fontSize: 50, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.72, w: 5, h: 0.06, fill: { color: C.indigo }, line: { color: C.indigo, width: 0 } });

  s.addText("Exam Knight provides a complete, production-ready solution\nfor secure, AI-monitored online examinations.", {
    x: 0.5, y: 1.9, w: 8.5, h: 0.75, fontSize: 14, color: C.grayLt, fontFace: "Calibri", margin: 0,
  });

  // GitHub link box
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 2.85, w: 5.5, h: 0.52, fill: { color: C.bg2 }, line: { color: C.cardBd, width: 0.5 } });
  s.addText("🔗  github.com/sajanmaurya/anti-cheat-exam-platform", {
    x: 0.5, y: 2.85, w: 5.5, h: 0.52, fontSize: 12, color: C.indigo, fontFace: "Courier New", valign: "middle", margin: 0, bold: true,
  });

  // Badge row
  const techs = [
    ["React", C.cyan], ["Node.js", C.green], ["PostgreSQL", "3b82f6"],
    ["Socket.io", C.purple], ["TensorFlow.js", C.orange], ["Docker", "2563eb"],
  ];
  techs.forEach(([t, c], i) => pill(s, t, 0.5 + i * 1.45, 3.6, c));

  // Questions
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.2, w: 9, h: 0.9, fill: { color: C.indigoDk }, rectRadius: 0.1, line: { color: C.indigo, width: 1 } });
  s.addText("❓  Questions?", { x: 0.5, y: 4.2, w: 9, h: 0.9, fontSize: 22, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });

  // Bottom bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: H - 0.28, w: W, h: 0.28, fill: { color: C.indigoDk }, line: { color: C.indigoDk, width: 0 } });
  s.addText("Sajan Kumar  |  Anti-Cheating Exam Platform  |  College Project 2026", {
    x: 0.4, y: H - 0.28, w: 9.2, h: 0.28, fontSize: 8.5, color: C.grayLt, align: "center", valign: "middle", margin: 0,
  });
}

// ── Write file ───────────────────────────────────────────────────────────────
pres.writeFile({ fileName: "C:\\Users\\sajan\\Downloads\\cheat\\Exam Knight_Presentation.pptx" })
  .then(() => console.log("✅  Exam Knight_Presentation.pptx saved!"))
  .catch(e => console.error("❌  Error:", e));
