// /view/js/servicios.js
(function () {
    const LS_USER_KEY = 'fw_user';
    const LS_AGENDAS_KEY = 'fw_agendas';

    // Utilities
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const saveUser = (user) => localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
    const clearUser = () => localStorage.removeItem(LS_USER_KEY);
    const getUser = () => {
        try {
            return JSON.parse(localStorage.getItem(LS_USER_KEY));
        } catch (e) {
            return null;
        }
    };
    const saveAgenda = (agenda) => {
        const arr = JSON.parse(localStorage.getItem(LS_AGENDAS_KEY) || '[]');
        arr.push(agenda);
        localStorage.setItem(LS_AGENDAS_KEY, JSON.stringify(arr));
    };

    // DOM refs
    const searchInput = $('.search-input');
    const searchButton = $('.search-button');
    const serviceCards = $$('.service-card');
    const navLinks = $$('.nav-bar a');
    let loginLink = navLinks.find(a => /iniciar/i.test(a.textContent)) || null;

    if (!loginLink) {
        const navBar = $('.nav-bar');
        loginLink = document.createElement('a');
        loginLink.href = '#';
        loginLink.textContent = 'Iniciar Sesión';
        navBar.appendChild(loginLink);
    }

    function filterServices(query) {
        const q = (query || '').trim().toLowerCase();
        serviceCards.forEach(card => {
            const title = ($('.service-title', card)?.textContent || '').toLowerCase();
            const desc = ($('.service-desc', card)?.textContent || '').toLowerCase();
            const price = ($('.service-price', card)?.textContent || '').toLowerCase();
            const matched = [title, desc, price].some(text => text.includes(q));
            card.style.display = q === '' || matched ? '' : 'none';
        });
    }

    function createModal(contentEl) {
        const overlay = document.createElement('div');
        overlay.className = 'fw-modal-overlay';
        Object.assign(overlay.style, {
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            padding: '20px', boxSizing: 'border-box'
        });
        const container = document.createElement('div');
        container.className = 'fw-modal';
        Object.assign(container.style, {
            background: '#fff', padding: '20px', borderRadius: '12px', width: 'min(520px,96%)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)', fontFamily: 'Inter, system-ui, Arial, sans-serif',
            color: '#222'
        });
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.textContent = '✕';
        Object.assign(closeBtn.style, {
            position: 'absolute', right: '18px', top: '16px', border: 'none', background: 'transparent',
            fontSize: '18px', cursor: 'pointer', color: '#666'
        });
        closeBtn.addEventListener('click', () => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        });
        container.appendChild(closeBtn);

        const contentWrap = document.createElement('div');
        contentWrap.appendChild(contentEl);
        container.appendChild(contentWrap);
        overlay.appendChild(container);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        });

        document.body.appendChild(overlay);
        const firstInput = container.querySelector('input, textarea, select, button');
        if (firstInput) firstInput.focus();
        return overlay;
    }

    function showLoginModal(onSuccess) {
        window.location.href = './login.html';
    }

    function showRegisterModal(onSuccess) {
        const form = document.createElement('form');
        form.innerHTML = `
            <div style="text-align:center;margin-bottom:12px">
                <h3 style="margin:0 0 6px;font-size:20px">Registrarse</h3>
                <p style="margin:0;color:#555">Crea una cuenta rápida</p>
            </div>
            <label style="display:block;margin:10px 0">
                <input name="username" required placeholder="Nombre de usuario" style="width:100%;padding:10px;border:1px solid #e6e6e6;border-radius:8px" />
            </label>
            <label style="display:block;margin:10px 0">
                <input name="password" type="password" required placeholder="Contraseña" style="width:100%;padding:10px;border:1px solid #e6e6e6;border-radius:8px" />
            </label>
            <div style="display:flex;gap:10px;margin-top:14px;justify-content:flex-end">
                <button type="submit" style="background:#00c853;color:#fff;padding:10px 14px;border-radius:8px;border:none;cursor:pointer">Registrarse</button>
            </div>
        `;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const username = (fd.get('username') || '').toString().trim();
            if (!username) return alert('Ingrese un nombre de usuario.');
            saveUser({ username });
            updateAuthUI();
            form.closest('.fw-modal-overlay')?.remove();
            if (typeof onSuccess === 'function') onSuccess();
        });
        createModal(form);
    }

    function showAuthPromptModal(onSuccess) {
        const wrap = document.createElement('div');
        Object.assign(wrap.style, { textAlign: 'center', padding: '6px 6px 2px' });
        wrap.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;justify-content:center;margin-bottom:12px">
                <div style="width:64px;height:64px;border-radius:12px;background:linear-gradient(135deg,#ffd54f,#ff7043);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:24px">FW</div>
                <div style="text-align:left">
                    <h3 style="margin:0;font-size:18px">Debes iniciar sesión primero</h3>
                    <p style="margin:6px 0 0;color:#555">Para solicitar un servicio crea una cuenta o inicia sesión.</p>
                </div>
            </div>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:14px">
                <button class="fw-register-btn" style="flex:1;padding:10px 12px;border-radius:10px;border:1px solid #e0e0e0;background:#fff;cursor:pointer">Registrarse</button>
                <button class="fw-login-btn" style="flex:1;padding:10px 12px;border-radius:10px;border:none;background:#0b74ff;color:#fff;cursor:pointer">Iniciar sesión</button>
            </div>
            <div style="margin-top:12px;color:#888;font-size:13px">No compartiremos tu información en este demo.</div>
        `;
        const overlay = createModal(wrap);
        const btnReg = wrap.querySelector('.fw-register-btn');
        const btnLog = wrap.querySelector('.fw-login-btn');

        btnReg.addEventListener('click', () => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            showRegisterModal(() => {
                if (typeof onSuccess === 'function') onSuccess();
            });
        });
        btnLog.addEventListener('click', () => {
            window.location.href = './login.html';
        });
    }

    function showScheduleModal(serviceTitle, servicePrice) {
        const user = getUser();
        if (!user) {
            return showAuthPromptModal(() => showScheduleModal(serviceTitle, servicePrice));
        }
        const form = document.createElement('form');
        form.innerHTML = `
            <h3>Agendar: ${escapeHtml(serviceTitle)}</h3>
            <p>Precio: <strong>${escapeHtml(servicePrice)}</strong></p>
            <label style="display:block;margin:8px 0">
                Fecha
                <input type="date" name="date" required style="padding:8px;width:100%;margin-top:4px;border-radius:8px;border:1px solid #e6e6e6" />
            </label>
            <label style="display:block;margin:8px 0">
                Hora
                <input type="time" name="time" required style="padding:8px;width:100%;margin-top:4px;border-radius:8px;border:1px solid #e6e6e6" />
            </label>
            <label style="display:block;margin:8px 0">
                Dirección
                <input name="address" required style="padding:8px;width:100%;margin-top:4px;border-radius:8px;border:1px solid #e6e6e6" placeholder="Dirección donde se realizará el servicio" />
            </label>
            <div style="margin-top:10px;display:flex;justify-content:flex-end">
                <button type="submit" style="background:#0b74ff;color:#fff;padding:10px 14px;border-radius:8px;border:none;cursor:pointer">Confirmar agendamiento</button>
            </div>
        `;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const date = fd.get('date'), time = fd.get('time'), address = (fd.get('address') || '').toString().trim();
            if (!date || !time || !address) return alert('Complete todos los campos.');
            const agenda = {
                serviceTitle,
                servicePrice,
                date,
                time,
                address,
                user: user.username,
                createdAt: new Date().toISOString()
            };
            saveAgenda(agenda);
            form.closest('.fw-modal-overlay')?.remove();
            alert('Agendamiento confirmado.\nRevisa la sección "Mis agendamientos" (demo almacenado localmente).');
        });
        createModal(form);
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function updateAuthUI() {
        const user = getUser();
        if (user) {
            loginLink.textContent = `Hola, ${user.username} (Cerrar)`;
            loginLink.href = '#';
            loginLink.removeEventListener('click', handleLoginClick);
            loginLink.addEventListener('click', handleLogoutClick);
        } else {
            loginLink.textContent = 'Iniciar Sesión';
            loginLink.href = './login.html';
            loginLink.removeEventListener('click', handleLogoutClick);
            loginLink.addEventListener('click', handleLoginClick);
        }
    }

    function handleLoginClick(e) {
        e.preventDefault();
        window.location.href = './login.html';
    }
    function handleLogoutClick(e) {
        e.preventDefault();
        const ok = confirm('¿Cerrar sesión?');
        if (!ok) return;
        clearUser();
        updateAuthUI();
    }

    function handleSolicitarClick(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const card = btn.closest('.service-card');
        const title = ($('.service-title', card)?.textContent || '').trim();
        const price = ($('.service-price', card)?.textContent || '').trim();
        const user = getUser();
        if (!user) {
            return showAuthPromptModal(() => showScheduleModal(title, price));
        }
        showScheduleModal(title, price);
    }

    function init() {
        if (searchInput) {
            searchInput.addEventListener('input', (e) => filterServices(e.target.value));
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') e.preventDefault();
            });
        }
        if (searchButton) {
            searchButton.addEventListener('click', () => filterServices(searchInput?.value || ''));
        }

        const solicitarButtons = $$('.service-btn');
        solicitarButtons.forEach(btn => {
            btn.addEventListener('click', handleSolicitarClick);
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });

        updateAuthUI();
        filterServices('');

        window.__fw = window.__fw || {};
        window.__fw.getUser = getUser;
        window.__fw.getAgendas = () => JSON.parse(localStorage.getItem(LS_AGENDAS_KEY) || '[]');
    }

    document.addEventListener('DOMContentLoaded', init);
})();

(function () {
    function patchRegisterButtons(root = document) {
        const btns = (root.querySelectorAll && root.querySelectorAll('.fw-register-btn')) || [];
        btns.forEach(btn => {
            const replacement = btn.cloneNode(true);
            replacement.addEventListener('click', (ev) => {
                ev.preventDefault();
                window.location.href = './login.html';
            });
            btn.parentNode.replaceChild(replacement, btn);
        });
    }

    patchRegisterButtons(document);

    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (!(node instanceof Element)) continue;
                if (node.classList && node.classList.contains('fw-modal-overlay')) {
                    patchRegisterButtons(node);
                } else {
                    patchRegisterButtons(node);
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('click', (e) => {
        const b = e.target.closest && e.target.closest('.fw-register-btn');
        if (b) {
            e.preventDefault();
            window.location.href = './login.html';
        }
    }, true);
})();