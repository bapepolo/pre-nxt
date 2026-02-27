# DB Selection UI

Keyboard-first database selection interface built with React + Vite.

This project focuses on **fast navigation**, **minimal interaction
cost**, and **clean theme-aware UI design**.

------------------------------------------------------------------------

## 🌐 Live Demo

Deployed on Vercel:

👉 https://pre-nxt01.vercel.app/

------------------------------------------------------------------------

## 🎯 What This Project Does

-   Navigate a list using keyboard arrows
-   Highlight the current selection
-   Toggle Dark Mode (Light / Dark / System)
-   Filter data via search (in progress)
-   Designed to expand into a full CRUD interface

------------------------------------------------------------------------

## ⌨️ Keyboard Shortcuts

  |  Key       |  Action                                  |
  |:----------:|:------------------------------------------|
  | ↑ / ↓      | Move selection                            |
  | Spacebar   | Move to next item                         |
  | Enter      | Move to next item (Reserved for future confirm action) |
  | D          | Toggle Dark Mode                          |
  | F          | Toggle Fullscreen                         |
  | U          | Jump to top of the list                   |

Keyboard shortcuts are disabled while typing inside input fields.

### Mouse Controls

- Left click (upper area) → Move selection up
- Left click (lower area) → Move selection down
- Drag (scroll gesture) → Move selection *(currently unstable / in progress)*

------------------------------------------------------------------------
## 📂 Data Source

The app supports multiple data sources:

- Local data
- Google Sheets (CSV)

### 🔗 Using Google Sheets

To use a Google Sheet as a data source:

1. Open your Google Sheet
2. Click **File → Share → Publish to web**
3. Select the sheet you want to publish
4. Choose **CSV format**
5. Copy the generated link
6. Paste it into the URL input field in the app

⚠ The sheet must be published to the web as **CSV format**.  
Private or non-published links will not work.

------------------------------------------------------------------------

## 🌗 Theme System

Supports:

-   Light Mode
-   Dark Mode
-   System Mode (follows OS setting)

Theme behavior:

-   Manual toggle overrides system mode
-   System mode uses `prefers-color-scheme`
-   Theme applied via `body.dark` class
-   All colors controlled through CSS variables

------------------------------------------------------------------------

## 🧱 Core Structure

Selection logic:

Data Source → List → selectedIndex → UI Projection

UI Layout:

Left Panel
- Data source controls
- Search
- URL input

Right Panel
- Dark mode toggle
- System mode toggle
- Full screen toggle

------------------------------------------------------------------------

## 🚀 Roadmap

Short-term: - Complete search filtering - Improve tab index & keyboard
accessibility

Mid-term: - Dynamic data source (Google Sheets) - Schema detection

Long-term: - Full CRUD interface - Abstract data source layer

------------------------------------------------------------------------

## 🛠 Tech Stack

-   React (Hooks)
-   TypeScript
-   Vite
-   CSS Variables
-   matchMedia API

------------------------------------------------------------------------

## 💡 Philosophy

-   Intuitive UX
-   Minimal UI
-   Clear visual hierarchy
-   Theme consistency
-   Expandable architecture
