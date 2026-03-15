# NutriAI Frontend — Full Web App

## Cách chạy

```bash
cd frontend
npm install
npm run dev
```

Mở trình duyệt: **http://localhost:5173**

---

## Các trang

| Route | Mô tả |
|-------|-------|
| `/` | Landing page — hero, features, roadmap, pricing, testimonials |
| `/intro` | Intro page — how it works, ecosystem, revenue model, team, vision |
| `/login` | Login / Register — 2 panel, social buttons, form validation |
| `/dashboard` | Dashboard — sidebar nav, 5 tabs đầy đủ |

## Dashboard tabs

- **Tổng quan** — Macro rings, weekly calo chart, AI alerts, meal suggestions
- **Bữa ăn** — Danh sách bữa ăn hôm nay + gợi ý AI
- **Tracking** — Bước chân, giấc ngủ, nước, nhịp tim + wearable devices
- **Phân tích** — Bar charts, AI review, xu hướng 30 ngày
- **Thử thách** — Progress challenges + bảng xếp hạng

## Cấu trúc

```
src/
├── App.jsx                  ← Router chính (4 routes)
├── main.jsx
├── index.css                ← Global variables + reset
├── components/
│   ├── Icons.jsx            ← 25+ SVG icons
│   ├── Navbar.jsx           ← Shared navbar
│   └── Navbar.module.css
├── hooks/
│   └── useAuth.jsx          ← Auth context (login/register/logout)
└── pages/
    ├── Landing.jsx + .css
    ├── Intro.jsx + .css
    ├── Login.jsx + .css
    └── Dashboard.jsx + .css
```

## Tech stack
- React 18 + Vite + React Router v6
- CSS Modules (không dùng Tailwind)
- Font: Syne (display) + DM Sans (body)
- Auth: Context API (mock — nhận mọi email/password)
