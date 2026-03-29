// Ensure elements exist before running scripts Wait until DOM is loaded
document.addEventListener("DOMContentLoaded", () => {

    // 1. Command Palette Integration (Ctrl+K)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            const askNitin = document.querySelector('#ask-nitin');
            if(askNitin) askNitin.scrollIntoView({behavior: 'smooth'});
            const chatInput = document.querySelector('#chat-input');
            if(chatInput) Object.assign(chatInput.style, {transition: '0.1s'}), chatInput.focus();
        }
    });

    // 2. Typing Animation
    const typingText = document.getElementById("typing-text");
    if(typingText) {
        const phrases = [
            "Building scalable systems with Python",
            "Designing backend architectures",
            "Exploring intelligence through code"
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeEffect() {
            const currentPhrase = phrases[phraseIndex];
            if (isDeleting) {
                typingText.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingText.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentPhrase.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typeSpeed = 500;
            }

            setTimeout(typeEffect, typeSpeed);
        }
        typeEffect();
    }

    // 3. GSAP Animations (ScrollTrigger)
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Timeline elements
        gsap.utils.toArray('.timeline-item').forEach(item => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 80%",
                },
                opacity: 0,
                y: 50,
                duration: 1,
                ease: "power2.out"
            });
        });

        // Project Cards
        gsap.utils.toArray('.project-card').forEach(card => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                },
                opacity: 0,
                y: 40,
                duration: 0.8,
                ease: "back.out(1.7)"
            });
            
            // GSAP Hover Tilt
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                
                gsap.to(card, {
                    rotationY: (mouseX - centerX) / 20,
                    rotationX: -(mouseY - centerY) / 20,
                    transformPerspective: 1000,
                    duration: 0.5,
                    ease: "power1.out"
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationY: 0,
                    rotationX: 0,
                    duration: 0.5,
                    ease: "power1.out"
                });
            });
        });
    }

    // 4. Skills Nodes Staggered Animation (Removed to ensure perfect default visibility)
    if (typeof gsap !== 'undefined') {
        // Scroll triggers removed to eradicate any "disabled/faded" bugs halfway through scroll.
    }

    // 5. Ask Nitin Chatbot
    const chatInput = document.getElementById("chat-input");
    const chatSendBtn = document.getElementById("chat-send");
    const chatBox = document.getElementById("chat-box");
    const suggestionChips = document.querySelectorAll(".suggestion-chip");
    
    // Maintain Chat History State
    let chatHistory = [];

    // Setup Suggestion Chips
    if (suggestionChips) {
        suggestionChips.forEach(chip => {
            chip.addEventListener("click", () => {
                chatInput.value = chip.textContent;
                sendChatMessage();
            });
        });
    }

    async function sendChatMessage() {
        const text = chatInput.value.trim();
        if(!text) return;
        
        // Push user message to history
        chatHistory.push({ role: "user", parts: [text] });
        
        // DOM: Add User Message
        const userMsg = document.createElement("div");
        userMsg.className = "message user";
        userMsg.innerHTML = `<div class="avatar user-avatar">U</div><div class="msg-content">${text}</div>`;
        chatBox.appendChild(userMsg);
        chatInput.value = "";
        
        // Hide chips
        const suggestionsDiv = document.querySelector(".chat-suggestions");
        if(suggestionsDiv) suggestionsDiv.style.display = "none";
        
        chatBox.scrollTop = chatBox.scrollHeight;

        // Create Typing Indicator
        const typingId = "typing-" + Date.now();
        const typingMsg = document.createElement("div");
        typingMsg.className = "message bot";
        typingMsg.id = typingId;
        typingMsg.innerHTML = `
            <div class="avatar bot-avatar">N</div>
            <div class="typing-indicator">
                <svg viewBox="0 0 24 24" fill="none" class="brain-icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>
                <span class="thinking-text">Processing...</span>
            </div>
        `;
        chatBox.appendChild(typingMsg);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const response = await fetch('/api/ask/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: chatHistory })
            });
            
            // Remove typing indicator
            const tIndicator = document.getElementById(typingId);
            if(tIndicator) tIndicator.remove();

            // Check if fallback error occurred
            if (!response.ok || response.headers.get("content-type").includes("application/json")) {
                 const data = await response.json();
                 if (data.status === 'error' || data.reply) {
                    const fullText = data.reply || data.message || "Error";
                    const botMsg = document.createElement("div");
                    botMsg.className = "message bot";
                    botMsg.innerHTML = `<div class="avatar bot-avatar">N</div><div class="msg-content"></div>`;
                    chatBox.appendChild(botMsg);
                    chatHistory.push({ role: "model", parts: [fullText] });
                    const contentDiv = botMsg.querySelector(".msg-content");
                    
                    // Artificial Streaming effect for JSON Fallback
                    let charIdx = 0;
                    const streamInt = setInterval(() => {
                        contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(fullText.substring(0, charIdx + 1)));
                        charIdx += 2; // Speed up by taking 2 chars at a time
                        chatBox.scrollTop = chatBox.scrollHeight;
                        if(charIdx >= fullText.length) {
                            contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(fullText)); // ensure complete text is rendered
                            clearInterval(streamInt);
                        }
                    }, 15);
                    return;
                 }
            }

            // Normal Streaming Execution
            const botMsg = document.createElement("div");
            botMsg.className = "message bot";
            botMsg.innerHTML = `<div class="avatar bot-avatar">N</div><div class="msg-content"></div>`;
            chatBox.appendChild(botMsg);
            
            const contentDiv = botMsg.querySelector(".msg-content");
            let buffer = "";

            if (!response.body) throw new Error("ReadableStream not supported");
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let eventBuffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                eventBuffer += decoder.decode(value, {stream: true});
                let eolIndex = eventBuffer.indexOf("\n\n");
                
                while (eolIndex !== -1) {
                    const chunkLine = eventBuffer.slice(0, eolIndex).trim();
                    eventBuffer = eventBuffer.slice(eolIndex + 2);
                    
                    if (chunkLine.startsWith("data: ")) {
                        try {
                            const obj = JSON.parse(chunkLine.substring(6));
                            buffer += obj.text;
                            
                            // Safe render Markdown
                            contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(buffer));
                            chatBox.scrollTop = chatBox.scrollHeight;
                        } catch(e) {}
                    }
                    eolIndex = eventBuffer.indexOf("\n\n");
                }
            }
            
            // Store bot reply in memory
            chatHistory.push({ role: "model", parts: [buffer] });
            
        } catch (err) {
            console.error(err);
            const tIndicator = document.getElementById(typingId);
            if(tIndicator) tIndicator.remove();
            
            const botMsg = document.createElement("div");
            botMsg.className = "message bot";
            botMsg.innerHTML = `<div class="avatar bot-avatar">N</div><div class="msg-content">Connection interrupted.</div>`;
            chatBox.appendChild(botMsg);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    if(chatSendBtn) chatSendBtn.addEventListener("click", sendChatMessage);
    if(chatInput) chatInput.addEventListener("keypress", (e) => {
        if(e.key === 'Enter') sendChatMessage();
    });

    // 6. Contact Form
    const contactForm = document.getElementById("contact-form");
    const statusDiv = document.getElementById("contact-status");
    if(contactForm) {
        contactForm.addEventListener("submit", async(e) => {
            e.preventDefault();
            const name = document.getElementById("contact-name").value;
            const email = document.getElementById("contact-email").value;
            const message = document.getElementById("contact-message").value;

            statusDiv.textContent = "Transmitting...";
            statusDiv.style.color = "var(--accent-blue)";

            try {
                const response = await fetch('https://formspree.io/f/xqegajbg', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ name, email, message })
                });
                
                if(response.ok) {
                    statusDiv.innerHTML = ""; // Clear saving text
                    
                    // Create and animate the popup
                    const toast = document.createElement("div");
                    toast.className = "toast-popup";
                    toast.innerHTML = `<div class="toast-icon">✓</div><div>Transmission Successful!</div>`;
                    document.body.appendChild(toast);
                    
                    // Animate In
                    setTimeout(() => toast.classList.add("show"), 50);
                    
                    // Animate Out and Remove
                    setTimeout(() => {
                        toast.classList.remove("show");
                        setTimeout(() => toast.remove(), 400); // Wait for CSS transition
                    }, 4000);

                    contactForm.reset();
                } else {
                    const data = await response.json();
                    let errMsg = "Connection Failed.";
                    if (data.hasOwnProperty('errors')) {
                        errMsg = data.errors.map(error => error.message).join(", ");
                    } else if (data.hasOwnProperty('error')) {
                        errMsg = data.error;
                    }
                    statusDiv.innerHTML = `<span style="color:var(--accent-red)">Error: ${errMsg}</span>`;
                }
            } catch(err) {
                statusDiv.innerHTML = `<span style="color:var(--accent-red)">Connection Failed.</span>`;
            }
        });
    }

    // 7. Terminal Easter Egg
    const termBtn = document.getElementById("open-terminal_btn");
    const termOverlay = document.getElementById("terminal-overlay");
    const termClose = document.getElementById("close-terminal");
    const termInput = document.getElementById("terminal-input");
    const termBody = document.getElementById("terminal-body");

    if (termBtn && termOverlay) {
        termBtn.addEventListener("click", () => {
            termOverlay.classList.remove("hidden");
            termInput.focus();
        });
        termClose.addEventListener("click", () => {
            termOverlay.classList.add("hidden");
        });

        termInput.addEventListener("keypress", (e) => {
            if(e.key === 'Enter') {
                const cmd = termInput.value.trim().toLowerCase();
                termInput.value = "";
                
                const cmdLine = document.createElement("p");
                cmdLine.innerHTML = `<span class="prompt">guest@system:~$</span> ${cmd}`;
                termBody.insertBefore(cmdLine, termBody.lastElementChild);

                const responseLine = document.createElement("p");
                
                if (cmd === 'help') {
                    responseLine.innerHTML = "Commands: about, skills, clear, goto [section_id], download resume, sudo hire nitin";
                } else if (cmd.startsWith('goto ')) {
                    const sec = cmd.split(' ')[1];
                    const el = document.getElementById(sec);
                    if(el) {
                        el.scrollIntoView({behavior: 'smooth'});
                        responseLine.innerHTML = `<span style="color:var(--accent-cyan)">[SUCCESS] Navigating to ${sec}...</span>`;
                        setTimeout(() => termOverlay.classList.add("hidden"), 1000);
                    } else {
                        responseLine.innerHTML = `<span style="color:var(--accent-red)">[ERROR] Section not found: ${sec}</span>`;
                    }
                } else if (cmd === 'download resume') {
                    window.open('/static/files/Nitin_Daswani_Resume.pdf', '_blank');
                    responseLine.innerHTML = `<span style="color:var(--accent-green)">[SUCCESS] Downloading resume payload...</span>`;
                } else if (cmd === 'about') {
                    responseLine.innerHTML = "Nitin Daswani is a Backend Developer and System Builder.";
                } else if (cmd === 'skills') {
                    responseLine.innerHTML = "Python, Django, SQLite, OpenCV, JS, CSS.";
                } else if (cmd === 'clear') {
                    // clear lines except last (which is the input line container)
                    while (termBody.children.length > 1) {
                        termBody.removeChild(termBody.firstChild);
                    }
                    return;
                } else if (cmd === 'sudo hire nitin') {
                    responseLine.innerHTML = "<span style='color:var(--accent-green)'>[SUCCESS] Contract initiated. Contact nitin to proceed.</span>";
                } else if (cmd !== '') {
                    responseLine.innerHTML = `Command not found: ${cmd}`;
                }

                if(cmd !== '') termBody.insertBefore(responseLine, termBody.lastElementChild);
                termBody.scrollTop = termBody.scrollHeight;
            }
        });
    }

    // 8. Active Nav Link Highlighting
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -50% 0px",
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${entry.target.id}`) {
                        link.classList.add("active");
                        
                        // Functional Terminal Print Log
                        if (termBody && termBody.lastElementChild) {
                            const logLine = document.createElement("p");
                            logLine.innerHTML = `<span style="color:var(--text-muted)">[INFO] Loading ${entry.target.id} module dependencies... [SUCCESS]</span>`;
                            termBody.insertBefore(logLine, termBody.lastElementChild);
                            termBody.scrollTop = termBody.scrollHeight;
                        }
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(sec => sectionObserver.observe(sec));

});
