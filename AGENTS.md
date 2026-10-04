# 🤖 Antigravity / AI Agent Instructions for ClassMate AI

This file provides system context and architectural guidelines for any Antigravity or AI coding assistant working in this repository.

---

## 📌 Project Overview
**ClassMate AI** is an AI-powered tutor for secondary school students (7th grade FGOS standard and higher), designed as both a Web application (GitHub Pages) and an Android Native App (Capacitor APK).

- **Web App**: React 19 + Vite 8 + Tailwind CSS v4
- **Mobile App**: Capacitor 8 + Android Native (BridgeActivity, GPU Hardware Acceleration)
- **AI Engine**: Mistral Large / Pixtral 12B Vision (multimodal image & homework analysis)
- **Deployment**:
  - Web: GitHub Pages (`npx gh-pages -d client/dist`)
  - Mobile: `client/build-apk.js` generates `ClassMateAI.apk`

---

## ⚠️ Critical Development Rules

1. **NEVER COMMIT `.apk` FILES**:
   - `ClassMateAI.apk` is ~113MB. GitHub rejects any commit with files over 100MB. Keep `*.apk` in `.gitignore`.
2. **TEXTBOOK & EXERCISE INTEGRATION**:
   - Embedded textbooks live in `client/public/textbooks/` (PDFs: Algebra 7th grade, Geometry 7-9th grade, Russian 7th grade).
   - Exercise to Page mapping is defined in `client/src/constants/exerciseIndex.js`.
   - When users query exercises like `"упр 89 русский"` or `"номер 148 алгебра"`, the app uses `detectExerciseInQuery` to automatically pinpoint the textbook page, render it with PDF.js, and attach it to the AI prompt.
3. **MOBILE APP AESTHETICS & PERFORMANCE**:
   - Avoid slow CSS backdrop blurs (`backdrop-blur-md`) in core typing areas on Android WebView; use solid opaque backgrounds (`bg-white/95 dark:bg-slate-900/95`).
   - Mobile uses a native **Bottom Navigation Bar** (`client/src/components/BottomNavBar.jsx`). Do not re-introduce cluttered web banners or desktop subject grids into the mobile layout.
   - Always respect Android Safe Area Insets (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`).
4. **JAVA / GRADLE ENVIRONMENT**:
   - Android Gradle build requires Java JDK 17 or 21 (`$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"`).

---

## 🛠️ Common Commands

```bash
# Web development
npm --prefix client run dev

# Web production build
npm --prefix client run build

# Deploy to GitHub Pages
npx gh-pages -d client/dist

# Sync Capacitor & Build Android APK
node client/build-apk.js
```
