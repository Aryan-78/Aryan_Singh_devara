// Variant F — interactive layer (forked from Variant C)
(function () {
	const root = document.documentElement;

	/* Theme toggle */
	const stored = localStorage.getItem('theme-f');
	const initial = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
	root.setAttribute('data-theme', initial);
	const themeBtn = document.querySelector('.theme-btn');
	const setIcon = (t) => themeBtn.innerHTML = t === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
	setIcon(initial);
	themeBtn.addEventListener('click', () => {
		const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
		root.setAttribute('data-theme', next);
		localStorage.setItem('theme-f', next);
		setIcon(next);
	});

	/* Mobile menu */
	const menuBtn = document.querySelector('.menu-btn');
	const navLinks = document.querySelector('.nav-links');
	menuBtn.addEventListener('click', () => navLinks.classList.toggle('is-open'));
	navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('is-open')));

	/* Header scroll state */
	const header = document.querySelector('.site-header');
	const onScroll = () => {
		header.classList.toggle('is-scrolled', window.scrollY > 8);
		updateProgress();
		updateActiveNav();
	};
	window.addEventListener('scroll', onScroll, { passive: true });

	/* Scroll progress */
	const bar = document.querySelector('.scroll-progress');
	const updateProgress = () => {
		const h = document.documentElement;
		const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
		bar.style.width = (p * 100) + '%';
	};

	/* Active nav (scrollspy) */
	const links = document.querySelectorAll('.nav-links a[href^="#"]');
	const sections = Array.from(links).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
	const updateActiveNav = () => {
		const y = window.scrollY + 110;
		let active = sections[0];
		sections.forEach(s => { if (s.offsetTop <= y) active = s; });
		links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + (active && active.id)));
	};

	/* Reveal */
	if ('IntersectionObserver' in window) {
		const io = new IntersectionObserver((entries) => {
			entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
		}, { threshold: 0.12 });
		document.querySelectorAll('.reveal').forEach(el => io.observe(el));
	} else {
		document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
	}

	/* Project filters */
	const filterBtns = document.querySelectorAll('.proj-filters button');
	const cards = document.querySelectorAll('.proj-card');
	filterBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			filterBtns.forEach(b => b.classList.remove('is-active'));
			btn.classList.add('is-active');
			const f = btn.dataset.filter;
			cards.forEach(c => {
				const show = f === 'all' || c.dataset.cat.split(' ').includes(f);
				c.style.display = show ? '' : 'none';
			});
		});
	});

	/* Back to top */
	const top = document.querySelector('.to-top');
	top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
	window.addEventListener('scroll', () => top.classList.toggle('is-visible', window.scrollY > 500), { passive: true });

	/* Toast */
	const toast = document.querySelector('.toast');
	const showToast = (msg) => {
		toast.textContent = msg;
		toast.classList.add('is-visible');
		clearTimeout(showToast._t);
		showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 1800);
	};

	/* Copy email */
	document.querySelectorAll('[data-copy]').forEach(el => {
		el.addEventListener('click', (e) => {
			e.preventDefault();
			const text = el.dataset.copy;
			navigator.clipboard.writeText(text).then(() => showToast('Copied: ' + text));
		});
	});

	/* Form: AJAX submit with inline result panel */
	const form = document.getElementById('contact-form');
	const result = document.getElementById('form-result');
	const resetBtn = document.getElementById('form-result-reset');

	const showResult = (state) => {
		if (!form || !result) return;
		const icon = result.querySelector('.result-icon i');
		const title = result.querySelector('.result-title');
		const msg = result.querySelector('.result-msg');
		result.classList.remove('is-error');
		if (state === 'success') {
			icon.className = 'fa-solid fa-circle-check';
			title.textContent = 'Thank you for reaching out!';
			msg.textContent = "I've received your message and will get back to you as soon as possible.";
		} else if (state === 'fail') {
			result.classList.add('is-error');
			icon.className = 'fa-solid fa-circle-xmark';
			title.textContent = 'Oops! Something went wrong.';
			msg.textContent = 'Your message could not be sent. Please try again in a moment, or email me directly.';
		} else {
			result.classList.add('is-error');
			icon.className = 'fa-solid fa-triangle-exclamation';
			title.textContent = 'Network error';
			msg.textContent = 'We hit a technical issue submitting your message. Please refresh the page or try again after a few minutes.';
		}
		form.hidden = true;
		result.hidden = false;
		result.scrollIntoView({ behavior: 'smooth', block: 'center' });
	};

	const showForm = () => {
		if (!form || !result) return;
		result.hidden = true;
		form.hidden = false;
		const btn = form.querySelector('[type="submit"]');
		if (btn) { btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message'; btn.disabled = false; }
		form.querySelector('input, textarea')?.focus();
	};

	if (form) {
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const btn = form.querySelector('[type="submit"]');
			if (btn) { btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…'; btn.disabled = true; }
			try {
				const res = await fetch(form.action, {
					method: form.method || 'POST',
					body: new FormData(form),
					headers: { 'Accept': 'application/json' }
				});
				if (res.ok) {
					form.reset();
					showResult('success');
				} else {
					showResult('fail');
				}
			} catch (err) {
				console.error(err);
				showResult('error');
			}
		});
	}
	if (resetBtn) resetBtn.addEventListener('click', showForm);

	/* Animated counter on stats */
	const counters = document.querySelectorAll('.stat-num[data-count]');
	const counted = new WeakSet();
	const animateCount = (el) => {
		if (counted.has(el)) return;
		counted.add(el);
		const target = parseFloat(el.dataset.count);
		const suffix = el.dataset.suffix || '';
		const dur = 1100;
		const start = performance.now();
		const tick = (now) => {
			const t = Math.min(1, (now - start) / dur);
			const eased = 1 - Math.pow(1 - t, 3);
			const v = target * eased;
			el.textContent = (Number.isInteger(target) ? Math.round(v) : v.toFixed(2)) + suffix;
			if (t < 1) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	};
	if ('IntersectionObserver' in window) {
		const io2 = new IntersectionObserver((entries) => entries.forEach(e => { if (e.isIntersecting) animateCount(e.target); }), { threshold: 0.5 });
		counters.forEach(c => io2.observe(c));
	} else { counters.forEach(animateCount); }

	/* =======================================================
	   TERMINAL — cycling typewriter (ported from Variant D)
	   ======================================================= */
	(function initTerminal() {
		const el = document.getElementById('term-out');
		if (!el) return;
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const frames = [
			[
				{ type: 'prompt', text: '~/aryan-devara $ ' },
				{ type: 'cmd', text: 'whoami', speed: 60 },
				{ type: 'out', text: '\n<span class="key">aryan.devara</span> <span class="out">—</span> software engineer <span class="out">@</span> <span class="key">ptc r&amp;d</span>\n<span class="out">// 4+ yrs · cloud-migration, ci/cd, full-stack plm</span>\n' }
			],
			[
				{ type: 'prompt', text: '~/aryan-devara $ ' },
				{ type: 'cmd', text: 'cat skills.json', speed: 45 },
				{ type: 'out', text: '\n{\n  <span class="key">"stack"</span>: [<span class="str">"java"</span>, <span class="str">"angular"</span>, <span class="str">"azure"</span>, <span class="str">"python"</span>],\n  <span class="key">"devops"</span>: [<span class="str">"gitlab-ci"</span>, <span class="str">"terraform"</span>, <span class="str">"docker"</span>],\n  <span class="key">"exp_years"</span>: <span class="num">4</span>,\n  <span class="key">"awards"</span>: <span class="num">3</span>\n}\n' }
			],
			[
				{ type: 'prompt', text: '~/aryan-devara $ ' },
				{ type: 'cmd', text: 'git log --oneline -3', speed: 40 },
				{ type: 'out', text: '\n<span class="hash">f3a91c2</span> feat(ccd): add azure deployment hook\n<span class="hash">8c72b15</span> fix(redline): suspect-handling on merge\n<span class="hash">a01ff8e</span> chore(ci): pin gitlab runner image\n' }
			]
		];

		const cursor = '<span class="cur"></span>';
		let frameIdx = 0;
		let cancelled = false;

		function escapeHtml(s) { return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
		function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

		if (reduceMotion) {
			const f = frames[0];
			el.innerHTML = f.map(seg => {
				if (seg.type === 'prompt') return `<span class="prompt">${seg.text}</span>`;
				if (seg.type === 'cmd') return `<span class="cmd">${seg.text}</span>`;
				return seg.text;
			}).join('');
			return;
		}

		async function playFrame(frame) {
			let buf = '';
			for (const seg of frame) {
				if (cancelled) return;
				if (seg.type === 'prompt') {
					buf += `<span class="prompt">${seg.text}</span>`;
					el.innerHTML = buf + cursor;
					await sleep(180);
				} else if (seg.type === 'cmd') {
					buf += '<span class="cmd">';
					for (const ch of seg.text) {
						if (cancelled) return;
						buf += ch === ' ' ? '&nbsp;' : escapeHtml(ch);
						el.innerHTML = buf + '</span>' + cursor;
						await sleep(seg.speed || 50);
					}
					buf += '</span>';
				} else {
					buf += seg.text;
					el.innerHTML = buf + cursor;
					await sleep(50);
				}
			}
			el.innerHTML = buf + cursor;
		}

		(async function loop() {
			while (!cancelled) {
				await playFrame(frames[frameIdx]);
				await sleep(2400);
				frameIdx = (frameIdx + 1) % frames.length;
				el.innerHTML = cursor;
				await sleep(300);
			}
		})();
	})();

	onScroll();
})();
