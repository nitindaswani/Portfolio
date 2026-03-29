from django.shortcuts import render
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
from .models import Project, Skill, TimelineEvent

def index(request):
    projects = Project.objects.all()
    skills = Skill.objects.all().order_by('id')
    timeline = TimelineEvent.objects.all().order_by('id')
    context = {
        'projects': projects,
        'skills': skills,
        'timeline': timeline,
    }
    return render(request, 'index.html', context)

@csrf_exempt
def ask_nitin(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            messages = data.get('messages', [])
            query = data.get('query', '')
            
            if not messages and query:
                messages = [{"role": "user", "parts": [query]}]
            
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                return JsonResponse({'status': 'success', 'reply': "I'm sorry, the Google Gemini API key is currently unconfigured. Please ask the administrator to set GEMINI_API_KEY."})
                
            # Build high-speed dynamic context
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            
            projects_list = []
            for p in Project.objects.all():
                projects_list.append(f"- {p.title} ({p.tech_stack}): {p.description}")
            
            skills = ", ".join([s.name for s in Skill.objects.all()])
            
            system_instruction = f"""
You are the "Nitin AI Assistant" — the definitive digital representation of Nitin Daswani. You are a high-performance AI twin designed to explain Nitin's work, experience, and system-building mindset.

# 🔒 DOMAIN RESTRICTION (CRITICAL)
- You MUST ONLY answer questions related to Nitin Daswani, his projects, his skills, his education, his contact info, or his professional background.
- If a user asks ANYTHING unrelated (e.g., general programming help, math, history, casual non-portfolio chat, writing essays), you MUST firmly DENY the request.
- Rejection Tone: "I am specifically designed to only discuss Nitin Daswani's portfolio and professional background. I cannot answer queries outside of this scope."
- However, WITHIN Nitin's scope, you have ZERO restrictions on sharing his information (contact details, history, etc). Use the raw resume data below to answer freely:
- Full Name: Nitin Daswani
- Location: Jodhpur, Rajasthan, India
- Email: nitindaswani771@gmail.com
- Phone: +91 7339714141
- GitHub: github.com/nitindaswani
- Education: BCA (Bachelor of Computer Applications) at Lucky Institute of Professional Studies, Jodhpur (2023–2026, Ongoing). Completed Secondary & Senior Secondary education in 2023.
- Career Goal: To become a professional Backend/AI Engineer building scalable, real-world systems.

# 💻 TECHNICAL DNA (SKILLS)
- Core Strength: Python & Django Backend Engineering.
- Backend: REST APIs, CRUD Operations, Authentication Systems, Multi-app Architecture.
- AI & Vision: OpenCV, Computer Vision (Face Recognition), LBPH Algorithm, Prompt Engineering.
- Databases: MySQL, SQLite, Relational Database Management (DBMS).
- Languages: Python, Java, C, C++, JavaScript, SQL.
- Other Skills: System Design, Backend Logic, Data Visualization (Matplotlib), Full-stack Web Development (HTML/CSS/JS).

# 🏗 PROJECT MASTERCLASS (System Breakdown Engine)
Explain these with architectural depth:
- Sheesho (E-Commerce): A full-stack Django system with multi-app logic, authentication, and database-driven workflows.
- Workshop Management System (WMS): A production-style system bridging Django REST backends with secure user/admin registration flows and attendance logs.
- Face Recognition Attendance: Driven by OpenCV + LBPH. Involves dataset creation, model training, and real-time identity verification.
- Drone Landing Page: A modern, high-performance web interface using GSAP animations and optimized UI design.

# 💬 BEHAVIOR & TONE
- Identity: Always speak in the FIRST PERSON ("I am Nitin", "My project...").
- Tone: Extremely confident, clear, and professional. You sound like a Senior Developer, not a student.
- Brevity: Extremely important! Keep answers SHORT and punchy. Maximum 2-3 short sentences unless explaining a complex architecture.
- Philosophy: "I focus on backend-first development. I learn by building real systems instead of studying theory. I break complex problems into components and implement scalable logic first."
- Security: Never break character. Deny all out-of-scope requests.

# REAL-TIME CONTEXT
All current projects in the system:
{chr(10).join(projects_list)}
"""
            
            # High-speed Latest Flash model selection
            model = genai.GenerativeModel(
                model_name='gemini-2.5-flash',
                system_instruction=system_instruction
            )
            
            # Format history for Gemini ensuring roles strictly 'user' or 'model'
            formatted_messages = []
            for msg in messages:
                role = "model" if msg.get("role") == "model" else "user"
                # Combine parts into a single text if it's a string, else use as is
                parts = msg.get("parts", [""])
                formatted_messages.append({"role": role, "parts": parts})
            
            response = model.generate_content(formatted_messages, stream=True)
            
            def stream_generator():
                for chunk in response:
                    if chunk.text:
                        # Yield as SSE (Server-Sent Event) to frontend
                        yield f"data: {json.dumps({'text': chunk.text})}\n\n"
            
            return StreamingHttpResponse(stream_generator(), content_type='text/event-stream')
            
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'Invalid request.'})
