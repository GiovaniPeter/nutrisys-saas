/* ============================================
   NutreClin — Landing Page Interações
   ============================================ */

(function() {
    'use strict';

    // ========== HEADER SCROLL EFFECT ==========
    const header = document.getElementById('lp-header');
    window.addEventListener('scroll', function() {
        header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // ========== MOBILE MENU ==========
    const menuBtn = document.getElementById('lp-menu-toggle');
    const nav = document.getElementById('lp-nav');
    menuBtn.addEventListener('click', function() {
        nav.classList.toggle('open');
        menuBtn.classList.toggle('active');
    });
    // Fechar ao clicar em link
    nav.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
            nav.classList.remove('open');
            menuBtn.classList.remove('active');
        });
    });

    // ========== SCREENSHOT TABS ==========
    var ssTabs = document.querySelectorAll('.lp-ss-tab');
    ssTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            ssTabs.forEach(function(t) { t.classList.remove('active'); });
            tab.classList.add('active');
            document.querySelectorAll('.lp-ss-panel').forEach(function(p) { p.classList.remove('active'); });
            var target = document.getElementById(tab.getAttribute('data-tab'));
            if (target) target.classList.add('active');
        });
    });

    // ========== PRICING TOGGLE (Mensal / Anual) ==========
    var toggleSwitch = document.getElementById('pricing-toggle');
    var toggleLabels = document.querySelectorAll('.lp-toggle-label');
    var isYearly = false;

    function updatePrices() {
        var allPriceSpans = document.querySelectorAll('[data-monthly][data-yearly]');
        allPriceSpans.forEach(function(el) {
            el.textContent = isYearly ? el.getAttribute('data-yearly') : el.getAttribute('data-monthly');
        });
        toggleLabels.forEach(function(label) {
            var period = label.getAttribute('data-period');
            label.classList.toggle('active', (period === 'yearly') === isYearly);
        });
        toggleSwitch.classList.toggle('active', isYearly);
    }

    toggleSwitch.addEventListener('click', function() {
        isYearly = !isYearly;
        updatePrices();
    });
    toggleLabels.forEach(function(label) {
        label.addEventListener('click', function() {
            isYearly = label.getAttribute('data-period') === 'yearly';
            updatePrices();
        });
    });

    // ========== FAQ ACCORDION ==========
    document.querySelectorAll('.lp-faq-question').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var item = btn.closest('.lp-faq-item');
            var wasOpen = item.classList.contains('open');
            // Fecha todos
            document.querySelectorAll('.lp-faq-item').forEach(function(i) { i.classList.remove('open'); });
            // Abre se não estava aberto
            if (!wasOpen) item.classList.add('open');
        });
    });

    // ========== SCROLL REVEAL ANIMATIONS ==========
    var fadeElements = document.querySelectorAll('.lp-feature-card, .lp-step, .lp-plan-card, .lp-testimonial-card, .lp-faq-item');
    fadeElements.forEach(function(el) { el.classList.add('lp-fade-in'); });

    function revealOnScroll() {
        var trigger = window.innerHeight * 0.88;
        fadeElements.forEach(function(el) {
            if (el.getBoundingClientRect().top < trigger) {
                el.classList.add('visible');
            }
        });
    }
    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll();

    // ========== MODAL ESTUDANTE ==========
    var studentModal    = document.getElementById('student-modal');
    var studentOverlay  = studentModal.querySelector('.lp-student-modal-overlay');
    var btnStudentModal = document.getElementById('btn-student-modal');
    var btnCloseStudent = document.getElementById('student-modal-close');
    var studentForm     = document.getElementById('student-modal-form');

    // Regex para e-mail institucional
    function isInstitutionalEmail(email) {
        return /^[^\s@]+@[^\s@]+\.(edu\.br|ac\.br|edu)$/i.test(email.trim());
    }

    function setEmailState(input, statusIcon, msgEl, state, msg) {
        input.classList.remove('valid', 'invalid');
        statusIcon.classList.remove('valid', 'invalid');
        msgEl.classList.remove('valid', 'invalid');
        statusIcon.textContent = '';
        msgEl.textContent = msg || '';
        if (state === 'valid') {
            input.classList.add('valid');
            statusIcon.classList.add('valid');
            msgEl.classList.add('valid');
            statusIcon.textContent = 'check_circle';
        } else if (state === 'invalid') {
            input.classList.add('invalid');
            statusIcon.classList.add('invalid');
            msgEl.classList.add('invalid');
            statusIcon.textContent = 'cancel';
        }
    }

    // Validação em tempo real: e-mail líder
    var smEmail        = document.getElementById('sm-email');
    var smEmailStatus  = smEmail.parentElement.querySelector('.lp-email-status');
    var smEmailMsg     = smEmail.parentElement.parentElement.querySelector('.lp-email-msg');
    smEmail.addEventListener('input', function() {
        var val = smEmail.value.trim();
        if (!val) { setEmailState(smEmail, smEmailStatus, smEmailMsg, '', ''); return; }
        if (isInstitutionalEmail(val)) {
            setEmailState(smEmail, smEmailStatus, smEmailMsg, 'valid', 'E-mail institucional válido ✓');
        } else {
            setEmailState(smEmail, smEmailStatus, smEmailMsg, 'invalid', 'Use um e-mail institucional (.edu.br, .ac.br ou .edu)');
        }
    });

    // Validação em tempo real: e-mails dos colegas
    document.querySelectorAll('.sm-member-email').forEach(function(input) {
        var statusIcon = input.parentElement.querySelector('.lp-email-status');
        var msgEl      = input.closest('.lp-smodal-member').querySelector('.lp-email-msg');
        input.addEventListener('input', function() {
            var val = input.value.trim();
            if (!val) { setEmailState(input, statusIcon, msgEl, '', ''); return; }
            if (isInstitutionalEmail(val)) {
                setEmailState(input, statusIcon, msgEl, 'valid', 'E-mail institucional válido ✓');
            } else {
                setEmailState(input, statusIcon, msgEl, 'invalid', 'Use um e-mail institucional (.edu.br, .ac.br ou .edu)');
            }
        });
    });

    function openStudentModal() {
        studentModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        document.getElementById('sm-name').focus();
    }
    function closeStudentModal() {
        studentModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    btnStudentModal.addEventListener('click', function(e) {
        e.preventDefault();
        openStudentModal();
    });
    btnCloseStudent.addEventListener('click', closeStudentModal);
    studentOverlay.addEventListener('click', closeStudentModal);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && studentModal.style.display === 'flex') closeStudentModal();
    });

    studentForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var name     = document.getElementById('sm-name').value.trim();
        var email    = smEmail.value.trim();
        var password = document.getElementById('sm-password').value;

        // Validações líder
        if (!name) { showLpToast('Informe seu nome completo.', 'error'); return; }
        if (!email) { showLpToast('Informe seu e-mail institucional.', 'error'); return; }
        if (!isInstitutionalEmail(email)) {
            showLpToast('Seu e-mail deve ser institucional (.edu.br, .ac.br ou .edu).', 'error');
            smEmail.focus(); return;
        }
        if (!password || password.length < 6) {
            showLpToast('A senha deve ter no mínimo 6 caracteres.', 'error'); return;
        }

        // Coleta e valida e-mails dos colegas
        var memberEmails = [];
        var memberInputs = document.querySelectorAll('.sm-member-email');
        var hasInvalid   = false;
        memberInputs.forEach(function(input) {
            var val = input.value.trim();
            if (!val) return; // campo vazio é ok (opcional)
            if (!isInstitutionalEmail(val)) {
                hasInvalid = true;
                var statusIcon = input.parentElement.querySelector('.lp-email-status');
                var msgEl      = input.closest('.lp-smodal-member').querySelector('.lp-email-msg');
                setEmailState(input, statusIcon, msgEl, 'invalid', 'E-mail institucional obrigatório');
            } else {
                memberEmails.push(val);
            }
        });
        if (hasInvalid) {
            showLpToast('Corrija os e-mails inválidos antes de continuar.', 'error');
            return;
        }

        // Verifica duplicatas entre todos os e-mails
        var allEmails = [email].concat(memberEmails);
        var uniqueEmails = allEmails.filter(function(v, i, a) { return a.indexOf(v) === i; });
        if (uniqueEmails.length !== allEmails.length) {
            showLpToast('Há e-mails duplicados no grupo.', 'error'); return;
        }

        var USERS_KEY = 'nutrisys_users';
        var users = [];
        try { users = JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch(err) { users = []; }

        // Verifica se algum e-mail já existe
        var taken = allEmails.find(function(em) {
            return users.some(function(u) { return u.email === em; });
        });
        if (taken) {
            showLpToast('O e-mail ' + taken + ' já está cadastrado.', 'error'); return;
        }

        var groupId = 'student_' + Date.now();

        // Cria conta do líder
        users.push({
            name: name, email: email, password: password,
            role: 'nutricionista', crn: '',
            plan: 'student', studentGroup: groupId, studentRole: 'leader',
            trialStart: new Date().toISOString(),
            trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

        // Cria contas pendentes para cada colega (conta privada separada)
        memberEmails.forEach(function(mem, idx) {
            users.push({
                name: 'Estudante ' + (idx + 2), email: mem, password: '',
                role: 'nutricionista', crn: '',
                plan: 'student', studentGroup: groupId, studentRole: 'member',
                pending: true, // deve definir senha no primeiro acesso
                trialStart: new Date().toISOString(),
                trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            });
        });

        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Auto-login como líder
        localStorage.setItem('nutrisys_user', JSON.stringify({ name: name, email: email, role: 'nutricionista', crn: '' }));

        showLpToast('Grupo criado! ' + memberEmails.length + ' convite(s) enviado(s). Redirecionando...', 'success');
        setTimeout(function() { window.location.href = 'index.html'; }, 1800);
    });

    // ========== TRIAL FORM ==========
    var trialForm = document.getElementById('trial-form');
    trialForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var name = document.getElementById('trial-name').value.trim();
        var email = document.getElementById('trial-email').value.trim();
        var password = document.getElementById('trial-password').value;

        if (!name || !email || !password) return;
        if (password.length < 6) {
            showLpToast('A senha deve ter no mínimo 6 caracteres.', 'error');
            return;
        }

        // Salva no localStorage como novo usuário do sistema
        var USERS_KEY = 'nutrisys_users';
        var users = [];
        try { users = JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch(err) { users = []; }

        // Verifica se e-mail já existe
        var exists = users.some(function(u) { return u.email === email; });
        if (exists) {
            showLpToast('Este e-mail já está cadastrado. Faça login.', 'error');
            return;
        }

        // Cria usuário trial
        var trialUser = {
            name: name,
            email: email,
            password: password,
            role: 'nutricionista',
            crn: '',
            plan: 'trial',
            trialStart: new Date().toISOString(),
            trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        users.push(trialUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Auto-login
        var sessionUser = { name: name, email: email, role: 'nutricionista', crn: '' };
        localStorage.setItem('nutrisys_user', JSON.stringify(sessionUser));

        showLpToast('Conta criada com sucesso! Redirecionando...', 'success');

        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1500);
    });

    // ========== TOAST SIMPLES ==========
    function showLpToast(message, type) {
        var existing = document.querySelector('.lp-toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.className = 'lp-toast lp-toast-' + type;
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);padding:14px 28px;border-radius:10px;font-size:0.9rem;font-weight:500;z-index:9999;animation:lpFadeIn 0.3s ease;font-family:Inter,sans-serif;max-width:90%;text-align:center;';
        if (type === 'success') {
            toast.style.background = '#057b64';
            toast.style.color = '#fff';
        } else {
            toast.style.background = '#e74c3c';
            toast.style.color = '#fff';
        }
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 4000);
    }

    // ========== SMOOTH SCROLL PARA ANCHORS ==========
    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            var targetId = link.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ========== MODAL DE LOGIN ==========
    var lpLoginModal   = document.getElementById('lp-login-modal');
    var lpLoginOverlay = document.getElementById('lp-login-overlay');
    var lpLoginClose   = document.getElementById('lp-login-close');
    var lpLoginForm    = document.getElementById('lp-login-form');
    var lpForgotPanel  = document.getElementById('lp-forgot-panel');
    var lpForgotBack   = document.getElementById('lp-forgot-back');
    var lpForgotUsers  = document.getElementById('lp-forgot-users');
    var lpBtnOpen      = document.getElementById('lp-btn-open-login');
    var lpLoginToTrial = document.getElementById('lp-login-to-trial');
    var lpGoogleBtn    = document.getElementById('lp-google-btn');
    var lpForgotLink   = document.getElementById('lp-login-forgot');

    function openLoginModal() {
        lpLoginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        lpLoginForm.style.display = '';
        lpForgotPanel.style.display = 'none';
        // Preenche e-mail salvo
        var saved = localStorage.getItem('nutrisys_saved_email');
        if (saved) {
            document.getElementById('lp-login-email').value = saved;
            document.getElementById('lp-login-remember').checked = true;
        }
        setTimeout(function() { document.getElementById('lp-login-email').focus(); }, 100);
    }

    function closeLoginModal() {
        lpLoginModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    lpBtnOpen.addEventListener('click', function(e) {
        e.preventDefault();
        openLoginModal();
    });

    lpLoginClose.addEventListener('click', closeLoginModal);
    lpLoginOverlay.addEventListener('click', closeLoginModal);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lpLoginModal.style.display === 'flex') closeLoginModal();
    });

    // Ir para trial ao clicar em "Não tem conta?"
    lpLoginToTrial.addEventListener('click', function(e) {
        e.preventDefault();
        closeLoginModal();
        var trialSection = document.getElementById('trial');
        if (trialSection) trialSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Entrar com Google (placeholder)
    lpGoogleBtn.addEventListener('click', function() {
        showLpToast('Login com Google disponível na versão completa.', 'error');
    });

    // Esqueceu a senha
    lpForgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        var USERS_KEY = 'nutrisys_users';
        var users = [];
        try { users = JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch(err) { users = []; }

        // Garante ao menos os usuários padrão
        if (!users.length) {
            users = [
                { name: 'Nutricionista', email: 'nutricionista@nutreclin.com', password: '123456' },
                { name: 'Secretária',    email: 'secretaria@nutreclin.com',    password: '123456' }
            ];
        }

        lpForgotUsers.innerHTML = users.map(function(u) {
            return '<div class="lp-forgot-user-card">'
                + '<div class="lp-fuc-name">' + escapeHtmlLp(u.name) + '</div>'
                + '<div class="lp-fuc-row"><span>E-mail:</span> ' + escapeHtmlLp(u.email) + '</div>'
                + '<div class="lp-fuc-row"><span>Senha:</span> ' + escapeHtmlLp(u.password) + '</div>'
                + '</div>';
        }).join('');

        lpLoginForm.style.display = 'none';
        lpForgotPanel.style.display = '';
    });

    lpForgotBack.addEventListener('click', function() {
        lpForgotPanel.style.display = 'none';
        lpLoginForm.style.display = '';
    });

    // Submit do login
    lpLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var email    = document.getElementById('lp-login-email').value.trim();
        var password = document.getElementById('lp-login-password').value;
        var remember = document.getElementById('lp-login-remember').checked;

        var USERS_KEY = 'nutrisys_users';
        var users = [];
        try { users = JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch(err) { users = []; }

        // Fallback: usuários padrão do sistema
        var defaultUsers = [
            { name: 'Nutricionista', email: 'nutricionista@nutreclin.com', password: '123456', role: 'nutricionista', crn: '' },
            { name: 'Secretária',    email: 'secretaria@nutreclin.com',    password: '123456', role: 'secretaria',    crn: '' }
        ];
        var allUsers = users.length ? users : defaultUsers;

        var user = allUsers.find(function(u) {
            return u.email === email && u.password === password;
        });

        if (user) {
            if (remember) {
                localStorage.setItem('nutrisys_saved_email', email);
            } else {
                localStorage.removeItem('nutrisys_saved_email');
            }
            localStorage.setItem('nutrisys_user', JSON.stringify({
                name: user.name, email: user.email, role: user.role || 'nutricionista', crn: user.crn || ''
            }));
            showLpToast('Bem-vindo(a), ' + user.name.split(' ')[0] + '! Redirecionando...', 'success');
            setTimeout(function() { window.location.href = 'index.html'; }, 1400);
        } else {
            showLpToast('E-mail ou senha incorretos.', 'error');
        }
    });

    function escapeHtmlLp(str) {
        var d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

})();
