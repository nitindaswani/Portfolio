# Portfolio Project

> A modern Django-powered personal portfolio website with an AI assistant, dynamic project showcase, and interactive frontend experience.

## ✨ Features

- Dynamic portfolio content managed through Django Admin
- Project showcase with optional live link and GitHub repository link
- Skills ecosystem grouped by categories
- Timeline section for journey/experience milestones
- AI chat assistant endpoint (`/api/ask/`) backed by Google Gemini (streaming response)
- Interactive frontend with:
  - GSAP scroll + hover animations
  - Typing effect in hero section
  - Terminal-style easter egg command interface
  - Suggestion chips and markdown-rendered AI responses
- Contact form integration via Formspree
- Media support for project images

## 🛠️ Tech Stack

- Backend:
  - Python
  - Django 5.x
  - Django ORM
  - Google Generative AI SDK (`google-generativeai`)
  - `python-dotenv`
- Frontend:
  - Django Templates
  - HTML5, CSS3, Vanilla JavaScript
  - GSAP + ScrollTrigger
  - Marked + DOMPurify
- Database:
  - SQLite (default, via `db.sqlite3`)

## ⚙️ Installation

Prerequisites:

- Python 3.10+ recommended
- `pip`
- Git

1. Clone the repository

```bash
git clone <your-repo-url>
cd portfolio_project
```

2. Create and activate a virtual environment

Windows (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
python -m venv .venv
source .venv/bin/activate
```

3. Install dependencies

Since this repository currently has no `requirements.txt`, install these packages manually:

```bash
pip install django python-dotenv google-generativeai pillow
```

4. Create a `.env` file in the project root

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Notes:

- `GEMINI_API_KEY` is required for AI chat (`/api/ask/`).
- If `GEMINI_API_KEY` is missing, the chatbot returns a fallback message.

5. Apply migrations

```bash
python manage.py migrate
```

6. (Optional) Create admin user

```bash
python manage.py createsuperuser
```

7. Run development server

```bash
python manage.py runserver
```

8. Open in browser

- App: `http://127.0.0.1:8000/`
- Admin: `http://127.0.0.1:8000/admin/`

9. Add content from admin panel

- Add `Project` entries
- Add `Skill` entries
- Add `TimelineEvent` entries

Without admin data, the homepage still shows fallback sample blocks in some sections.

## 📂 Project Structure

```text
portfolio_project/
├─ manage.py
├─ db.sqlite3
├─ core/
│  ├─ models.py          # Project, Skill, TimelineEvent models
│  ├─ views.py           # index view + /api/ask/ Gemini streaming endpoint
│  ├─ urls.py            # app routes
│  ├─ admin.py           # model admin configuration
│  └─ migrations/
├─ portfolio_project/
│  ├─ settings.py        # Django settings, static/media, dotenv
│  └─ urls.py            # root URL config
├─ templates/
│  ├─ base.html
│  └─ index.html
└─ static/
   ├─ css/style.css
   ├─ js/main.js
   ├─ files/
   └─ images/projects/
```

## 🔌 API

### POST `/api/ask/`

AI assistant endpoint for portfolio-focused Q&A.

Request body:

```json
{
  "messages": [{ "role": "user", "parts": ["What is your tech stack?"] }]
}
```

Alternative body (first-turn shortcut):

```json
{
  "query": "Tell me about your projects"
}
```

Behavior:

- Accepts JSON input
- Builds runtime context from database projects/skills
- Calls Gemini model (`gemini-2.5-flash`)
- Streams response as Server-Sent Events (`text/event-stream`)

Example stream chunks:

```text
data: {"text":"I build backend systems with..."}

data: {"text":"My core stack is Python and Django..."}
```

Possible error/fallback responses:

- Missing API key fallback message (HTTP 200 JSON)
- Invalid request or internal exception (JSON with `status: error`)

## 🚀 Future Improvements

- Add `requirements.txt` and pinned dependency versions
- Add Docker support for one-command setup
- Add automated tests for views and API behavior
- Add rate-limiting and auth protection for `/api/ask/`
- Add production-ready settings split (`dev` / `prod`)
- Add CI workflow (lint + tests)
- Add screenshot assets and a live demo link in README

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes

```bash
git commit -m "Add: short description"
```

4. Push branch and open a Pull Request

Please keep changes focused, readable, and well-tested.

## 📜 License

No license file is currently included in this repository.

If you want open-source usage, add a `LICENSE` file (MIT is a common choice for portfolio projects).

## 🙋‍♂️ Author

Nitin Daswani

- Location: Jodhpur, Rajasthan, India
- Email: nitindaswani771@gmail.com
- GitHub: https://github.com/nitindaswani
- LinkedIn: https://www.linkedin.com/in/nitindaswani/
