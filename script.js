// FormSubmit handles email delivery; the recipient must activate their inbox once.
const ticketEmailEndpoint = 'https://formsubmit.co/ajax/johnalfredjauod05@gmail.com';
let ticketEmailPending = false;
async function emailJanjan(subject, body, button, status) {
    if (ticketEmailPending) {
        status.textContent = 'Another ticket is sending. Please wait a moment.';
        return;
    }
    const emailInput = document.getElementById('ticketCopyEmail');
    const copyEmail = emailInput.value.trim();
    emailInput.value = copyEmail;
    if (!emailInput.checkValidity()) {
        status.textContent = 'Please enter a valid email address for your copy, or leave it blank.';
        emailInput.reportValidity(); emailInput.focus(); return;
    }
    const payload = { _subject: subject, _template: 'table', Ticket: subject, 'Our plan': body };
    if (copyEmail) { payload.email = copyEmail; payload._replyto = copyEmail; payload._cc = copyEmail; }
    ticketEmailPending = true;
    const originalLabel = button.textContent;
    button.disabled = true; button.textContent = 'Sending your ticket…';
    status.textContent = 'Sending your ticket. Please keep this page open.';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
        const response = await fetch(ticketEmailEndpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload), signal: controller.signal
        });
        const result = await response.json();
        if (typeof result.message === 'string' && /needs activation/i.test(result.message)) {
            status.textContent = 'One-time setup needed: Janjan must open the FormSubmit email at johnalfredjauod05@gmail.com and click Activate Form. Then press Send again. Your ticket has not been confirmed as delivered yet.';
            return;
        }
        if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error('Submission rejected');
        status.textContent = 'Ticket submitted for email delivery to Janjan' + (copyEmail ? ' and a copy to ' + copyEmail : '') + '. ❤️ If this is the first submission, Janjan must activate FormSubmit from his inbox first. Please check Spam too.';
    } catch (error) {
        status.textContent = error.name === 'AbortError' ? 'The request timed out; delivery is unconfirmed. Check your inbox before retrying.' : 'Email submission could not be confirmed. Check your connection and try again, or save your ticket as an image.';
    } finally {
        clearTimeout(timeout); ticketEmailPending = false; button.disabled = false; button.textContent = originalLabel;
    }
}
        const plannerQuestions = [
            { title: 'Ano gusto mong gawin, babii?', options: ['Take photos 📸', 'Eat together 🍽️', 'Exchange letters 💌', 'Surprise me! 🎁'] },
            { title: 'Anong birthday treat mo?', options: ['Cake 🎂', 'Chocolates 🍫', 'Flowers 🌹', 'Ikaw bahala, babii ❤️'] },
            { title: 'Ano dadalhin mo?', options: ['My camera 📷', 'A birthday wish ✨', 'My appetite 😋', 'Sarili ko lang, sapat na ’yon 🤭'] }
        ];
        const plannerStorageKey = 'yanang-birthday-plan-v1';
        let birthdayPlan = { answers: ['', '', ''], wish: '', complete: false };
        try {
            const saved = JSON.parse(localStorage.getItem(plannerStorageKey));
            if (saved && Array.isArray(saved.answers)) {
                birthdayPlan.answers = plannerQuestions.map((question, i) => question.options.includes(saved.answers[i]) ? saved.answers[i] : '');
                birthdayPlan.wish = typeof saved.wish === 'string' ? saved.wish.slice(0, 500) : '';
                birthdayPlan.complete = saved.complete === true && birthdayPlan.answers.every(Boolean);
            }
        } catch {}
        let plannerStep = birthdayPlan.complete ? 4 : Math.max(0, birthdayPlan.answers.findIndex(answer => !answer));
        if (!birthdayPlan.complete && birthdayPlan.answers.every(Boolean)) plannerStep = 3;
        function saveBirthdayPlan() { try { localStorage.setItem(plannerStorageKey, JSON.stringify(birthdayPlan)); } catch {} }
        function birthdayPlanText() {
            return 'Our little birthday plan ❤️\nNovember 13, 2026 · 8:00–9:00 AM\nBayani Hall, Dagupan, Pangasinan\nTheme: Red & wine red\n\n' +
                'What we’ll do: ' + birthdayPlan.answers[0] + '\nBirthday treat: ' + birthdayPlan.answers[1] + '\nI’m bringing: ' + birthdayPlan.answers[2] +
                (birthdayPlan.wish.trim() ? '\n\nMy birthday wish: ' + birthdayPlan.wish.trim() : '') + '\n\nSee you, babii! ❤️';
        }
        function renderPlanner() {
            const host = document.getElementById('plannerContent');
            host.replaceChildren();
            const progress = document.createElement('p');
            progress.className = 'planner-progress';
            progress.textContent = plannerStep < 4 ? 'Step ' + (plannerStep + 1) + ' of 4' : 'Your birthday plan is ready 💌';
            host.append(progress);
            if (plannerStep < 3) {
                const question = plannerQuestions[plannerStep];
                const heading = document.createElement('h3');
                heading.className = 'planner-question'; heading.textContent = question.title;
                const options = document.createElement('div'); options.className = 'planner-options';
                options.setAttribute('role', 'group'); options.setAttribute('aria-label', question.title);
                question.options.forEach(option => {
                    const button = document.createElement('button');
                    button.textContent = option; button.setAttribute('aria-pressed', String(birthdayPlan.answers[plannerStep] === option));
                    button.onclick = () => {
                        birthdayPlan.answers[plannerStep] = option; birthdayPlan.complete = false; saveBirthdayPlan();
                        [...options.children].forEach(item => item.setAttribute('aria-pressed', String(item === button)));
                        document.getElementById('plannerNext').disabled = false;
                    };
                    options.append(button);
                });
                host.append(heading, options);
            } else if (plannerStep === 3) {
                const envelope = document.createElement('div'); envelope.className = 'wish-envelope'; envelope.textContent = '💌'; envelope.setAttribute('aria-hidden', 'true');
                const label = document.createElement('label'); label.htmlFor = 'birthdayWish'; label.className = 'planner-question'; label.textContent = 'One birthday wish, babii…';
                const wish = document.createElement('textarea'); wish.id = 'birthdayWish'; wish.maxLength = 500; wish.placeholder = 'Something you’re wishing for this year (optional)'; wish.value = birthdayPlan.wish;
                wish.oninput = () => { birthdayPlan.wish = wish.value; birthdayPlan.complete = false; saveBirthdayPlan(); };
                host.append(envelope, label, wish);
            } else {
                const summary = document.createElement('div'); summary.className = 'plan-summary'; summary.textContent = birthdayPlanText();
                const copy = document.createElement('button'); copy.className = 'plan-copy'; copy.textContent = 'Send my plan to Janjan 💌';
                const status = document.createElement('p'); status.className = 'copy-status'; status.setAttribute('role', 'status');
                copy.onclick = () => {
                    emailJanjan('Our birthday date plan ❤️', birthdayPlanText(), copy, status);
                };
                const save = document.createElement('button'); save.className = 'plan-copy save-ticket'; save.textContent = 'Save my birthday plan 🎟️';
                save.onclick = () => saveTicketImage(birthdayPlanText(), 'our-birthday-plan.png', status);
                host.append(summary, copy, save, status);
            }
            const nav = document.createElement('div'); nav.className = 'planner-nav';
            const back = document.createElement('button'); back.textContent = plannerStep === 4 ? 'Edit my plan' : '← Back'; back.disabled = plannerStep === 0;
            back.onclick = () => { plannerStep = plannerStep === 4 ? 0 : plannerStep - 1; renderPlanner(); focusPlanner(); };
            nav.append(back);
            if (plannerStep < 4) {
                const next = document.createElement('button'); next.id = 'plannerNext'; next.textContent = plannerStep === 3 ? 'Seal my wish 💌' : 'Next →'; next.disabled = plannerStep < 3 && !birthdayPlan.answers[plannerStep];
                next.onclick = () => { plannerStep++; if (plannerStep === 4) { birthdayPlan.complete = true; saveBirthdayPlan(); plannerConfetti(); } renderPlanner(); focusPlanner(); };
                nav.append(next);
            }
            host.append(nav);
        }
        function focusPlanner() {
            const host = document.getElementById('plannerContent'); host.tabIndex = -1; host.focus({ preventScroll: true }); host.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
        }
        function plannerConfetti() {
            if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            for (let i = 0; i < 24; i++) {
                const piece = document.createElement('div'); piece.className = 'confetti'; piece.textContent = ['❤️', '🎉', '✨'][i % 3];
                Object.assign(piece.style, { position: 'fixed', top: '0', left: Math.random() * 95 + '%', zIndex: '10', animationDelay: Math.random() * .4 + 's' });
                document.body.append(piece); setTimeout(() => piece.remove(), 4000);
            }
        }
        renderPlanner();
        const adventureIds = ['adventureAgain', 'adventureIdea', 'adventureCustomIdea', 'adventurePlace', 'adventureCustomPlace', 'adventureTiming', 'adventureDate', 'adventureWish'];
        const adventureKey = 'yanang-next-adventure-v1';
        const adventureField = id => document.getElementById(id);
        let ticketCreated = false;
        function updateAdventureFields() {
            adventureField('customIdeaField').hidden = adventureField('adventureIdea').value !== 'My own idea ✨';
            adventureField('customPlaceField').hidden = adventureField('adventurePlace').value !== 'A place I have in mind 📍';
            adventureField('specificDateField').hidden = adventureField('adventureTiming').value !== 'I have a date in mind 📅';
            adventureField('adventureCustomIdea').required = !adventureField('customIdeaField').hidden;
            adventureField('adventureCustomPlace').required = !adventureField('customPlaceField').hidden;
            adventureField('adventureDate').required = !adventureField('specificDateField').hidden;
            const ready = isAdventureComplete();
            adventureField('makeDateTicket').disabled = !ready;
            adventureField('adventureHelp').textContent = ready ? 'Your answers are ready — make your ticket, babii! ❤️' : 'Answer all four questions and fill in any custom details to unlock your ticket. The wish list is optional.';
            if (!ready) ticketCreated = false;
        }
        function isAdventureComplete() {
            return ['adventureAgain', 'adventureIdea', 'adventurePlace', 'adventureTiming'].every(id => adventureField(id).value.trim()) &&
                ['adventureCustomIdea', 'adventureCustomPlace', 'adventureDate'].every(id => {
                    const field = adventureField(id);
                    return !field.required || (Boolean(field.value.trim()) && field.validity.valid);
                });
        }
        function adventureText() {
            const customIdea = adventureField('adventureIdea').value === 'My own idea ✨';
            const customPlace = adventureField('adventurePlace').value === 'A place I have in mind 📍';
            let date = adventureField('adventureTiming').value;
            if (date === 'I have a date in mind 📅') {
                const rawDate = adventureField('adventureDate').value;
                date = rawDate ? new Date(rawDate + 'T12:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Let’s decide together';
            }
            return 'Our next little adventure ❤️\n\nAnother date? ' + (adventureField('adventureAgain').value || 'Let’s talk about it 💌') +
                '\nDate idea: ' + ((customIdea ? adventureField('adventureCustomIdea').value.trim() : adventureField('adventureIdea').value) || 'Let’s choose together') +
                '\nPlace: ' + ((customPlace ? adventureField('adventureCustomPlace').value.trim() : adventureField('adventurePlace').value) || 'Let’s choose together') +
                '\nWhen: ' + date + (adventureField('adventureWish').value.trim() ? '\n\nOur wish list: ' + adventureField('adventureWish').value.trim() : '') +
                '\n\nMore little memories with you, babii. 💌';
        }
        function updateDateTicket() {
            adventureField('dateTicket').hidden = !ticketCreated;
            adventureField('dateTicketText').textContent = adventureText();
            adventureField('dateTicketStatus').textContent = '';
            adventureField('dateTicket').querySelector('.copy-fallback')?.remove();
        }
        function saveAdventure() {
            const state = { ticketCreated };
            adventureIds.forEach(id => { state[id] = adventureField(id).value; });
            try { localStorage.setItem(adventureKey, JSON.stringify(state)); } catch {}
        }
        try {
            const state = JSON.parse(localStorage.getItem(adventureKey));
            if (state && typeof state === 'object') {
                adventureIds.forEach(id => { if (typeof state[id] === 'string') { const field = adventureField(id); field.value = state[id].slice(0, field.maxLength > 0 ? field.maxLength : 500); } });
                ticketCreated = state.ticketCreated === true;
            }
        } catch {}
        updateAdventureFields(); updateDateTicket();
        adventureField('adventureForm').addEventListener('input', () => { updateAdventureFields(); updateDateTicket(); saveAdventure(); });
        adventureField('adventureForm').addEventListener('change', () => { updateAdventureFields(); updateDateTicket(); saveAdventure(); });
        adventureField('adventureForm').addEventListener('submit', event => {
            event.preventDefault();
            if (!isAdventureComplete()) { updateAdventureFields(); updateDateTicket(); return; }
            ticketCreated = true; updateDateTicket(); saveAdventure(); plannerConfetti();
            adventureField('dateTicket').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
        });
        const dateJarIdeas = ['Café hopping ☕', 'Picnic 🧺', 'Movie night 🎬', 'Sunset walk 🌅', 'Cooking together 🍳', 'Bookstore browsing and coffee 📚', 'A photo walk with silly poses 📸', 'Try a new dessert together 🍰', 'Board games and snacks 🎲', 'Make a playlist for each other 🎶'];
        let drawnIdea = '';
        function drawDateIdea() {
            const choices = dateJarIdeas.filter(idea => idea !== drawnIdea);
            drawnIdea = choices[Math.floor(Math.random() * choices.length)];
            adventureField('jarResult').textContent = drawnIdea;
            adventureField('jarActions').hidden = false;
        }
        adventureField('drawDateIdea').onclick = drawDateIdea;
        adventureField('drawAnotherIdea').onclick = drawDateIdea;
        adventureField('useJarIdea').onclick = () => {
            const isPreset = [...adventureField('adventureIdea').options].some(option => option.value === drawnIdea);
            adventureField('adventureIdea').value = isPreset ? drawnIdea : 'My own idea ✨';
            if (!isPreset) adventureField('adventureCustomIdea').value = drawnIdea;
            updateAdventureFields(); updateDateTicket(); saveAdventure();
            adventureField('jarResult').textContent = drawnIdea + ' — added to our plan, babii! ❤️';
        };
        adventureField('copyDateTicket').onclick = () => {
            if (!isAdventureComplete()) { updateAdventureFields(); updateDateTicket(); return; }
            emailJanjan('Our next little adventure ❤️', adventureText(), adventureField('copyDateTicket'), adventureField('dateTicketStatus'));
        };
        const celebrationStart = new Date('2026-11-13T08:00:00+08:00').getTime();
        function updateCountdown() {
            const remaining = celebrationStart - Date.now();
            const countdown = document.getElementById('countdown');
            if (remaining <= 0) {
                countdown.textContent = Date.now() < celebrationStart + 3600000 ? 'It’s time to celebrate you, babii! 🎂' : 'A beautiful celebration to remember. ❤️';
                return;
            }
            const seconds = Math.floor(remaining / 1000);
            const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
            countdown.innerHTML = values.map((value, i) => '<div><strong>' + String(value).padStart(2, '0') + '</strong><small>' + ['Days', 'Hours', 'Minutes', 'Seconds'][i] + '</small></div>').join('');
        }
        updateCountdown();
        setInterval(updateCountdown, 1000);

        const galleryPhotos = [...document.querySelectorAll('.photo-gallery img')];
        const photoViewer = document.getElementById('photoViewer');
        let selectedPhoto = 0;
        function showPhoto(index) {
            selectedPhoto = (index + galleryPhotos.length) % galleryPhotos.length;
            const image = document.getElementById('viewerImage');
            image.src = galleryPhotos[selectedPhoto].src;
            image.alt = galleryPhotos[selectedPhoto].alt;
            document.getElementById('photoCount').textContent = (selectedPhoto + 1) + ' / ' + galleryPhotos.length;
        }
        galleryPhotos.forEach((photo, index) => {
            const card = photo.parentElement;
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', 'Open birthday photo ' + (index + 1));
            const open = () => { showPhoto(index); photoViewer.showModal(); document.body.style.overflow = 'hidden'; };
            card.addEventListener('click', open);
            card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
        });
        document.getElementById('closeViewer').onclick = () => photoViewer.close();
        photoViewer.addEventListener('close', () => { document.body.style.overflow = ''; });
        document.getElementById('previousPhoto').onclick = () => showPhoto(selectedPhoto - 1);
        document.getElementById('nextPhoto').onclick = () => showPhoto(selectedPhoto + 1);
        photoViewer.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showPhoto(selectedPhoto + (event.key === 'ArrowLeft' ? -1 : 1)); }
        });
        let swipeStart;
        photoViewer.addEventListener('touchstart', event => { swipeStart = event.changedTouches[0].clientX; }, { passive: true });
        photoViewer.addEventListener('touchend', event => {
            const distance = event.changedTouches[0].clientX - swipeStart;
            if (Math.abs(distance) > 60) showPhoto(selectedPhoto + (distance < 0 ? 1 : -1));
        }, { passive: true });
        function replayInvitation() {
            document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
            document.getElementById('landingScreen').classList.add('active');
            noAttempts = 0;
            lastNoAttempt = 0;
            const container = document.getElementById('buttonsContainer');
            container.classList.remove('dodging');
            container.querySelectorAll('button').forEach(button => button.removeAttribute('style'));
            document.getElementById('teaseMessage').classList.remove('show');
            window.scrollTo(0, 0);
        }
        // Sound effects
        const sounds = {
            click: () => {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBix+zPLTgjMGHm7A7+OZSA0PVqzm8LJjHAQ2jdXvz30pBSFyw+ffkT8JE1iy5O+nVBIIRJze77Bdw==');
                audio.volume = 0.3;
                audio.play().catch(() => {});
            },
            chime: () => {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBix+zPLTgjMGHm7A7+OZSA0PVqzm8LJjHAQ2jdXvz30pBSFyw+ffkT8JE1iy5O+nVBIIRJze77pdIAUqeMXuxYgyBhpsuO3nmUQND1as5vCzYhwENozU78p5KwUie8Tv2o8+ChJZr+Ptp1QSCEOb3O+yXCIEK37L8dSAMQYabLfx45dFDQ1Vqufw');
                audio.volume = 0.5;
                audio.play().catch(() => {});
            }
        };

        // Initialize floating hearts
        function createFloatingHearts() {
            const container = document.getElementById('heartsContainer');
            const hearts = ['🎂', '🎈', '🎁', '🎉', '💛', '🌸', '✨'];
            
            for (let i = 0; i < 12; i++) {
                const heart = document.createElement('div');
                heart.className = 'chibi-heart';
                heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                heart.style.left = Math.random() * 100 + '%';
                heart.style.top = Math.random() * 100 + '%';
                heart.style.animationDelay = Math.random() * 2 + 's';
                heart.style.animationDuration = (3 + Math.random() * 2) + 's';
                container.appendChild(heart);
            }
            
            // Create sparkles
            for (let i = 0; i < 20; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.left = Math.random() * 100 + '%';
                sparkle.style.top = Math.random() * 100 + '%';
                sparkle.style.animationDelay = Math.random() * 2 + 's';
                container.appendChild(sparkle);
            }
        }

        createFloatingHearts();

        // Screen transitions
        function goToInvitation() {
            sounds.click();
            document.getElementById('landingScreen').classList.remove('active');
            setTimeout(() => {
                document.getElementById('invitationScreen').classList.add('active');
                window.scrollTo(0, 0);
            }, 300);
        }

        // Every attempt to decline reveals a new message and boosts the Yes button.
        const noMessages = [
            'nakabook na po babii 🥺',
            'please babii hindi mo na ako lab 🥺💛',
            'babii may cake na po oh 🎂',
            'kahit one day lang babii please 🥹',
            'birthday girl, bawal tumanggi sa cake 🤭',
            'sige na babii, excited na ako makita ka 💕',
            'nakaready na ang birthday date natin 🎈',
            'yung Yes po ang pipindutin babii 🤭💛'
        ];
        let noAttempts = 0;
        let lastNoAttempt = 0;
        function dodgeNo(event) {
            if (event) event.preventDefault();
            // One message per attempt, even when a tap fires several events.
            const now = Date.now();
            if (now - lastNoAttempt < 350) return;
            lastNoAttempt = now;
            const message = document.getElementById('teaseMessage');
            message.textContent = noMessages[noAttempts % noMessages.length];
            message.classList.add('show');
            noAttempts++;
            const container = document.getElementById('buttonsContainer');
            const yes = container.querySelector('.btn-yes');
            const no = document.getElementById('noButton');
            yes.style.fontSize = Math.min(1.2 + noAttempts * 0.12, 1.9) + 'rem';
            yes.style.padding = Math.min(18 + noAttempts * 2, 30) + 'px 24px';
            yes.style.maxWidth = '100%';
            container.classList.add('dodging');
            no.style.position = 'absolute';
            const maxX = Math.max(0, container.clientWidth - no.offsetWidth);
            const previousX = parseFloat(no.style.left) || 0;
            no.style.left = (previousX < maxX / 2 ? maxX : 0) + 'px';
            no.style.top = (yes.offsetHeight + 25 + (noAttempts % 2) * 25) + 'px';
        }

        window.addEventListener('resize', () => {
            if (!noAttempts) return;
            const container = document.getElementById('buttonsContainer');
            const no = document.getElementById('noButton');
            no.style.left = Math.min(parseFloat(no.style.left) || 0, Math.max(0, container.clientWidth - no.offsetWidth)) + 'px';
            no.style.top = (container.querySelector('.btn-yes').offsetHeight + 25) + 'px';
        });

        // YES button
        function sayYes() {
            sounds.chime();
            
            const successScreen = document.getElementById('successScreen');
            const emojis = ['🎉', '🎊', '🎂', '🎈', '🎁', '✨', '💛'];
            
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                confetti.style.animationDuration = (2 + Math.random() * 1) + 's';
                successScreen.appendChild(confetti);
                setTimeout(() => confetti.remove(), 4000);
            }
            
            document.getElementById('invitationScreen').classList.remove('active');
            setTimeout(() => {
                document.getElementById('successScreen').classList.add('active');
                window.scrollTo(0, 0);
            }, 300);
        }

// Connect page buttons to their actions.
document.querySelectorAll('.page-shortcuts a').forEach(link => {
    link.addEventListener('click', event => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    });
});

// Render a standalone keepsake without uploading her choices or requiring a library.
async function saveTicketImage(text, filename, status) {
    try {
        await document.fonts.ready;
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas unavailable');
        context.font = '28px Inter, sans-serif';
        const lines = [];
        for (const paragraph of text.split('\n')) {
            let line = '';
            for (const character of paragraph) {
                if (line && context.measureText(line + character).width > 760) { lines.push(line); line = ''; }
                line += character;
            }
            lines.push(line);
        }
        canvas.height = Math.max(700, 300 + lines.length * 44);
        context.fillStyle = '#791b34'; context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#fff7ee'; context.fillRect(48, 48, 904, canvas.height - 96);
        context.strokeStyle = '#bc8c50'; context.lineWidth = 2; context.strokeRect(68, 68, 864, canvas.height - 136);
        context.fillStyle = '#791b34'; context.font = 'bold 18px Inter, sans-serif';
        context.fillText('JANJAN & YANANG  /  A LITTLE KEEPSAKE', 120, 132);
        context.strokeStyle = '#d8a2ad'; context.setLineDash([8, 8]);
        context.beginPath(); context.moveTo(120, 162); context.lineTo(880, 162); context.stroke();
        context.font = '28px Inter, sans-serif'; context.fillStyle = '#512c36';
        lines.forEach((line, index) => context.fillText(line, 120, 220 + index * 44));
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error('Image could not be created');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = filename;
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        status.textContent = 'Your keepsake image is ready! Check your downloads, babii. ❤️';
    } catch {
        status.textContent = 'The image could not be saved. You can still email your plan with the Send button.';
    }
}
document.getElementById('saveDateTicket').addEventListener('click', () => {
    saveTicketImage(adventureText(), 'our-next-date-ticket.png', document.getElementById('dateTicketStatus'));
});
document.querySelector('[data-handler-1]').addEventListener('click', function (event) { goToInvitation(); });
document.querySelector('[data-handler-2]').addEventListener('click', function (event) { sayYes(); });
document.querySelector('[data-handler-3]').addEventListener('pointerenter', function (event) { dodgeNo(event); });
document.querySelector('[data-handler-4]').addEventListener('pointerdown', function (event) { dodgeNo(event); });
document.querySelector('[data-handler-5]').addEventListener('click', function (event) { dodgeNo(event); });
document.querySelector('[data-handler-6]').addEventListener('click', function (event) { replayInvitation(); });
