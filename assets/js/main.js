/* André Fecury · portfólio
 * Conteúdo em data.js. Este arquivo: renderização, interações e animações.
 * Tudo funciona sem GSAP (conteúdo visível); com GSAP + movimento permitido,
 * entram os capítulos cinematográficos (pin, scrub, horizontal).
 */
(() => {
  "use strict";
  const D = window.PORTFOLIO;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const LANG_COLOR = { Python: "#3572A5", Kotlin: "#A97BFF", Java: "#B07219", "C#": "#178600", C: "#7A8597", Dart: "#00B4AB", HTML: "#E34C26", JavaScript: "#F1E05A" };
  // O build web do app (gerado) faz o GitHub classificar o Picped como JavaScript; o Cubo só tem o APK.
  const LANG_OVERRIDE = { Picped: "Python", "Cubo-Magico-3D": "Java" };

  /* ------------------------------------------------------------ arte abstrata dos projetos sem imagem */
  function art(p) {
    const c = p.cor;
    const seed = [...p.id].reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const waves = Array.from({ length: 9 }, (_, i) => {
      const y = 40 + i * 26, a = 10 + ((seed + i * 7) % 18);
      return `<path d="M-20 ${y} C 90 ${y - a}, 180 ${y + a}, 300 ${y - a / 2} S 470 ${y + a}, 520 ${y}" stroke="${i < 4 ? "#5E9CC4" : c}" stroke-opacity="${0.18 + (i % 3) * 0.12}" fill="none" stroke-width="1"/>`;
    }).join("");
    return `<div class="work__art" aria-hidden="true"><svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="g-${p.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B1A22"/><stop offset="1" stop-color="${c}" stop-opacity=".55"/></linearGradient></defs>
      <rect width="480" height="360" fill="url(#g-${p.id})"/>${waves}</svg></div>
      <span class="work__mono" aria-hidden="true">${esc(p.nome.split(" ")[0])}</span>`;
  }

  /* ------------------------------------------------------------ renderização */
  function renderExperience() {
    const areas = D.experiencia.areas;
    $(".exp__areas").innerHTML = areas.map((a) => `
      <li class="area" id="area-${a.id}">
        <h3>${esc(a.titulo)}</h3>
        <p>${esc(a.texto)}</p>
        <ul>${a.itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
        <span class="area__flow" aria-hidden="true"></span>
      </li>`).join("");
    $(".exp__index").innerHTML = areas.map((a) => `<li>${esc(a.titulo)}</li>`).join("");
    $('[data-field="cargo"]').textContent = D.pessoa.cargo;
  }

  function renderSkills() {
    const label = { pro: "profissional", proj: "em projetos", acad: "acadêmico", exp: "explorando" };
    $(".skills__grid").innerHTML = D.skills.map((g) => `
      <section class="skillcat" data-reveal>
        <h3>${esc(g.cat)}</h3>
        <ul>${g.itens.map(([n, ctx, onde]) => `
          <li class="skill"><i class="${ctx}" title="${label[ctx]}"></i>
            <span><b>${esc(n)}</b><small><span class="sr">${label[ctx]}: </span>${esc(onde)}</small></span></li>`).join("")}
        </ul>
      </section>`).join("");
  }

  function media(p) {
    if (p.imagens.length >= 3) {
      return `<div class="work__media work__media--shots">${p.imagens.slice(0, 3).map(([src, alt]) =>
        `<img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async" width="520" height="1126">`).join("")}</div>`;
    }
    if (p.imagens.length) {
      const [src, alt] = p.imagens[0];
      return `<div class="work__media"><img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async"></div>`;
    }
    return `<div class="work__media">${art(p)}</div>`;
  }

  function renderWorks() {
    const destaque = D.projetos.filter((p) => p.destaque);
    $(".works__track").innerHTML = destaque.map((p) => `
      <li class="work">
        <button class="work__btn" type="button" data-case="${p.id}" aria-haspopup="dialog">
          ${media(p)}
          <span class="work__body">
            <span class="work__meta"><span>${p.ano}</span><span>·</span><span class="badge">${esc(p.estado.split(" · ")[0])}</span>${p.privado ? "<span>· privado</span>" : ""}</span>
            <h3>${esc(p.nome)}</h3>
            <p>${esc(p.resumo)}</p>
            <span class="work__tech">${p.tecnologias.slice(0, 4).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</span>
            <span class="work__more">Estudo de caso →</span>
          </span>
        </button>
      </li>`).join("");

    $(".filters").innerHTML = D.filtros.map(([id, nome], i) =>
      `<button class="filter" type="button" data-filter="${id}" aria-pressed="${i === 0}">${esc(nome)}</button>`).join("");
    $(".index__list").innerHTML = D.projetos.map((p) => `
      <li class="row" data-tipos="${p.tipo.join(" ")}">
        <button class="row__btn" type="button" data-case="${p.id}" aria-haspopup="dialog">
          <span class="row__yr">${p.ano}</span>
          <span class="row__name">${esc(p.nome)}</span>
          <span class="row__desc">${esc(p.resumo)}</span>
        </button>
      </li>`).join("");
  }

  function renderTimeline() {
    $(".journey__list").innerHTML = D.timeline.map(([d, t, p]) =>
      `<li class="stop"><time>${esc(d)}</time><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join("");
  }

  /* ------------------------------------------------------------ filtros */
  function setupFilters() {
    $(".filters").addEventListener("click", (e) => {
      const b = e.target.closest(".filter");
      if (!b) return;
      $$(".filter").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const f = b.dataset.filter;
      $$(".row").forEach((r) => { r.hidden = !(f === "todos" || r.dataset.tipos.split(" ").includes(f)); });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  /* ------------------------------------------------------------ estudo de caso */
  function setupCase() {
    const dlg = $(".case"), body = $(".case__body");
    let origem = null;
    function open(id) {
      const p = D.projetos.find((x) => x.id === id);
      if (!p) return;
      origem = document.activeElement;
      const links = [];
      if (p.repo) links.push(`<a class="btn btn--solid" href="${p.repo}" target="_blank" rel="noopener">Ver repositório ↗</a>`);
      if (p.demo) links.push(`<a class="btn btn--ghost" href="${p.demo}" target="_blank" rel="noopener">${esc(p.demoRotulo || "Demonstração")} ↗</a>`);
      if (!p.repo) links.push(`<span class="case__private">Repositório privado · sem link público</span>`);
      body.innerHTML = `
        <p class="kicker"><span class="dot" aria-hidden="true"></span>${p.ano} · ${esc(p.estado)}</p>
        <h2 id="case-title">${esc(p.nome)}</h2>
        <p class="case__lede">${esc(p.resumo)}</p>
        ${p.imagens.length ? `<div class="case__shots">${p.imagens.map(([s, a]) => `<img src="${s}" alt="${esc(a)}" loading="lazy">`).join("")}</div>` : ""}
        <div class="case__grid">
          <section><h3>Problema</h3><p>${esc(p.problema)}</p></section>
          <section><h3>Participação</h3><p>${esc(p.participacao)}</p></section>
          <section><h3>${p.estado.startsWith("Em criação") ? "O que está planejado" : "Funcionalidades"}</h3><ul>${p.funcionalidades.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></section>
          <section><h3>Tecnologias</h3><div class="work__tech">${p.tecnologias.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div></section>
        </div>
        <div class="case__links">${links.join("")}</div>`;
      dlg.showModal();
      dlg.scrollTop = 0;
      $(".case__close").focus();
    }
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-case]");
      if (t) open(t.dataset.case);
    });
    dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });
    dlg.addEventListener("close", () => { if (origem) origem.focus({ preventScroll: true }); });
    window.__abrirCaso = open;
  }

  /* ------------------------------------------------------------ navegação */
  function setupNav() {
    const nav = $("[data-nav]"), toggle = $(".nav__toggle");
    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    $$(".nav__links a").forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus(); }
    });

    const bar = $(".progress span");
    let lastY = scrollY, ticking = false;
    function onScroll() {
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      nav.classList.toggle("is-solid", y > 40);
      const down = y > lastY + 4, up = y < lastY - 4;
      if (down && y > 300 && !nav.classList.contains("is-open") && !nav.contains(document.activeElement)) nav.classList.add("is-hidden");
      if (up) nav.classList.remove("is-hidden");
      lastY = y; ticking = false;
    }
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    nav.addEventListener("focusin", () => nav.classList.remove("is-hidden"));
    onScroll();

    // capítulo ativo no menu
    const links = new Map($$(".nav__links a").map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.remove("is-active"));
        const a = links.get(en.target.id);
        if (a) a.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => io.observe(s));
  }

  /* ------------------------------------------------------------ copiar e-mail */
  function setupCopy() {
    $$("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
      const toast = $(".toast");
      let ok = false;
      try { await navigator.clipboard.writeText(b.dataset.copy); ok = true; } catch (e) {
        const t = document.createElement("textarea");
        t.value = b.dataset.copy; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select();
        try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
        t.remove();
      }
      toast.textContent = ok ? "E-mail copiado ✓" : "Não deu para copiar. Selecione o endereço ao lado.";
      toast.classList.add("is-on");
      clearTimeout(b._t);
      b._t = setTimeout(() => toast.classList.remove("is-on"), 2600);
    }));
  }

  /* ------------------------------------------------------------ GitHub ao vivo (com cache e fallback) */
  async function setupGitHub() {
    const KEY = "af-gh-v1", TTL = 6 * 3600 * 1000;
    let repos = null, fonte = "";
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || "null");
      if (c && Date.now() - c.t < TTL) { repos = c.r; fonte = "cache"; }
    } catch (_) { /* armazenamento indisponível */ }
    if (!repos) {
      try {
        const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 6000);
        const r = await fetch(`https://api.github.com/users/${D.pessoa.githubUser}/repos?per_page=100&sort=pushed`, { signal: ctrl.signal, headers: { Accept: "application/vnd.github+json" } });
        clearTimeout(to);
        if (!r.ok) throw new Error(r.status);
        const json = await r.json();
        repos = json.filter((x) => !x.fork).map((x) => ({ n: x.name, d: x.description, l: x.language, p: (x.pushed_at || "").slice(0, 10) }));
        fonte = "api";
        try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), r: repos })); } catch (_) {}
      } catch (_) { repos = null; }
    }
    if (!repos) { repos = D.githubSnapshot.repos; fonte = "snapshot"; }

    const lista = repos.filter((r) => r.n !== D.pessoa.githubUser);
    const lang = (r) => LANG_OVERRIDE[r.n] || r.l;
    const contagem = {};
    lista.forEach((r) => { const l = lang(r); if (l) contagem[l] = (contagem[l] || 0) + 1; });
    const total = Object.values(contagem).reduce((a, b) => a + b, 0) || 1;
    const ordenadas = Object.entries(contagem).sort((a, b) => b[1] - a[1]);
    const ultimo = lista.map((r) => r.p).filter(Boolean).sort().pop();

    $('[data-gh="repos"]').textContent = String(fonte === "snapshot" ? D.githubSnapshot.publicos : repos.length);
    $('[data-gh="langs"]').textContent = String(ordenadas.length);
    $('[data-gh="last"]').textContent = ultimo ? new Date(ultimo + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—";
    $(".gh__langs").innerHTML = ordenadas.map(([l, n]) => `<span style="width:${(n / total) * 100}%;background:${LANG_COLOR[l] || "#8b919a"}" title="${l}"></span>`).join("");
    $(".gh__langs").insertAdjacentHTML("afterend", `<p class="gh__legend">${ordenadas.map(([l, n]) => `<span><i style="background:${LANG_COLOR[l] || "#8b919a"}"></i>${esc(l)} · ${n}</span>`).join("")}</p>`);
    $(".gh__repos").innerHTML = lista.slice(0, 8).map((r) => `
      <li class="repo"><a href="https://github.com/${D.pessoa.githubUser}/${encodeURIComponent(r.n)}" target="_blank" rel="noopener">
        <b>${esc(r.n)}</b><p>${esc(r.d || "Sem descrição.")}</p>
        <small>${lang(r) ? `<span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${LANG_COLOR[lang(r)] || "#8b919a"};margin-right:6px"></i>${esc(lang(r))}</span>` : ""}<span>${r.p ? new Date(r.p + "T12:00:00").toLocaleDateString("pt-BR") : ""}</span></small>
      </a></li>`).join("");
    $('[data-gh="source"]').textContent = fonte === "snapshot"
      ? `API do GitHub indisponível agora: mostrando o retrato salvo em ${new Date(D.githubSnapshot.data + "T12:00:00").toLocaleDateString("pt-BR")}.`
      : "Dados da API pública do GitHub (atualizados a cada 6 horas). Linguagem principal de cada repositório; Picped conta como Python, já que o JavaScript dele é o build web gerado.";
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  /* ------------------------------------------------------------ terminal */
  function setupTerminal() {
    const dlg = $(".term"), out = $(".term__out"), inp = $("#term-in");
    const P = D.pessoa;
    const print = (html) => { out.insertAdjacentHTML("beforeend", html + "\n"); out.scrollTop = out.scrollHeight; };
    const cmds = {
      help: () => `<span class="d">comandos disponíveis:</span>
  <span class="p">about</span>       quem sou
  <span class="p">experience</span>  estágio no SIDIA
  <span class="p">skills</span>      tecnologias e onde uso
  <span class="p">projects</span>    lista de projetos
  <span class="p">open &lt;n&gt;</span>    abre o estudo de caso do projeto n
  <span class="p">github</span>      perfil e repositórios
  <span class="p">contact</span>     e-mail e redes
  <span class="p">clear</span>       limpa a tela`,
      about: () => `${esc(P.nomeCompleto)}\n${P.posicionamento.join(" | ")}\n${esc(P.curso)} · ${esc(P.faculdade)} · ${esc(P.semestre)}\n${esc(P.local)}`,
      experience: () => `${esc(P.cargo)} @ ${esc(P.empresa)} · desde ${D.experiencia.inicio}\n` + D.experiencia.areas.map((a) => `  <span class="p">›</span> ${esc(a.titulo)}`).join("\n"),
      skills: () => D.skills.map((g) => `<span class="p">${esc(g.cat.toLowerCase())}</span>\n  ${g.itens.map((i) => esc(i[0])).join(" · ")}`).join("\n"),
      projects: () => D.projetos.map((p, i) => `<span class="p">[${i + 1}]</span> ${esc(p.nome)} <span class="d">· ${esc(p.estado)}</span>`).join("\n") + `\n<span class="d">use: open 1</span>`,
      github: () => `<a href="${P.github}" target="_blank" rel="noopener">${P.github.replace("https://", "")}</a>\n<span class="d">os repositórios aparecem no capítulo GitHub da página.</span>`,
      contact: () => `e-mail    <a href="mailto:${P.email}">${P.email}</a>\ngithub    <a href="${P.github}" target="_blank" rel="noopener">github.com/${P.githubUser}</a>\nlinkedin  <a href="${P.linkedin}" target="_blank" rel="noopener">linkedin.com/in/andré-fecury</a>`,
      clear: () => { out.innerHTML = ""; return null; },
    };
    const alias = { ajuda: "help", sobre: "about", experiencia: "experience", projetos: "projects", contato: "contact", limpar: "clear", abrir: "open" };
    function run(raw) {
      const line = raw.trim(); if (!line) return;
      print(`<span class="p">$</span> ${esc(line)}`);
      let [c, arg] = line.toLowerCase().split(/\s+/);
      c = alias[c] || c;
      if (c === "open") {
        const p = D.projetos[parseInt(arg, 10) - 1];
        if (!p) return print("informe o número do projeto. ex.: open 1");
        print(`abrindo ${esc(p.nome)}…`);
        dlg.close();
        return window.__abrirCaso(p.id);
      }
      const f = cmds[c];
      const r = f ? f() : `comando não encontrado: ${esc(c)}. digite <span class="p">help</span>`;
      if (r !== null) print(r);
    }
    $(".term__form").addEventListener("submit", (e) => { e.preventDefault(); run(inp.value); inp.value = ""; });
    $(".term__hints").innerHTML = ["help", "about", "experience", "skills", "projects", "github", "contact"].map((c) => `<button type="button">${c}</button>`).join("");
    $(".term__hints").addEventListener("click", (e) => { if (e.target.tagName === "BUTTON") { run(e.target.textContent); inp.focus(); } });
    $$("[data-open-terminal]").forEach((b) => b.addEventListener("click", () => { dlg.showModal(); inp.focus(); }));
    dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });
    print(`<span class="d">terminal opcional: tudo aqui também está na página.</span>\n<span class="d">digite</span> <span class="p">help</span> <span class="d">ou use os atalhos abaixo.</span>`);
  }

  /* ------------------------------------------------------------ hero: encontro das águas (canvas 2D) */
  function setupWaters() {
    const cv = $(".hero__waters");
    const ctx = cv.getContext("2d", { alpha: false });
    let w = 0, h = 0, dpr = 1, t = 0, raf = 0, visivel = true, parts = [];
    const pouco = matchMedia("(max-width: 700px)").matches || (navigator.hardwareConcurrency || 4) <= 4;
    const N = pouco ? 180 : 380;
    let grad = null;
    // fronteira entre as águas: diagonal sinuosa
    const borda = (x, tt) => h * 0.62 - (x / w) * h * 0.38 + Math.sin(x * 0.006 + tt * 0.35) * h * 0.05 + Math.sin(x * 0.017 - tt * 0.6) * h * 0.015;
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      grad = ctx.createLinearGradient(0, h * 0.3, w, h);
      grad.addColorStop(0, "#3d2f1f"); grad.addColorStop(1, "#6b5134");
      parts = Array.from({ length: N }, () => nova(true));
    }
    function nova(qualquer) {
      const x = qualquer ? Math.random() * w : -10;
      const y = Math.random() * h;
      return { x, y, v: 0.35 + Math.random() * 0.9, l: 8 + Math.random() * 26, a: 0.15 + Math.random() * 0.45 };
    }
    function fundo(tt) {
      ctx.fillStyle = "#081219"; ctx.fillRect(0, 0, w, h);
      ctx.beginPath(); ctx.moveTo(0, h);
      for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, borda(x, tt));
      ctx.lineTo(w, h); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();
      // faixa de mistura na fronteira
      ctx.lineWidth = 1;
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        for (let x = 0; x <= w + 8; x += 10) { const y = borda(x, tt + k * 0.4) + (k - 2) * 7; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.strokeStyle = `rgba(233,226,211,${0.05 + k * 0.012})`; ctx.stroke();
      }
    }
    function frame() {
      fundo(t);
      for (const p of parts) {
        const b = borda(p.x, t), acima = p.y < b;
        const dy = Math.sin(p.x * 0.01 + t * 0.5 + p.y * 0.004) * 0.25 - (acima ? 0.12 : 0.05);
        const x2 = p.x + p.l, y2 = p.y + dy * p.l;
        ctx.strokeStyle = acima ? `rgba(94,156,196,${p.a})` : `rgba(212,168,90,${p.a * 0.8})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(x2, y2); ctx.stroke();
        p.x += p.v * (acima ? 1.25 : 0.8); p.y += dy;
        if (p.x > w + 20 || p.y < -20 || p.y > h + 20) Object.assign(p, nova(false));
      }
      t += 0.016;
      if (!reduced.matches && visivel) raf = requestAnimationFrame(frame);
    }
    size();
    // primeiro quadro estático já no carregamento; a animação só começa depois que a página carrega
    let animar = false;
    const parado = reduced.matches;
    visivel = false;
    frame();
    const iniciar = () => { animar = true; visivel = true; if (!parado) raf = requestAnimationFrame(frame); };
    if (document.readyState === "complete") setTimeout(iniciar, 600); else addEventListener("load", () => setTimeout(iniciar, 600), { once: true });
    let rt = 0;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { cancelAnimationFrame(raf); size(); frame(); }, 150); });
    new IntersectionObserver(([e]) => {
      if (!animar) return;
      visivel = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visivel && !reduced.matches) raf = requestAnimationFrame(frame);
    }).observe(cv);
    document.addEventListener("visibilitychange", () => { if (!animar) return; visivel = !document.hidden; if (visivel && !reduced.matches) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } });
  }

  /* ------------------------------------------------------------ animações com GSAP */
  function dividirPalavras(el) {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    const txt = el.textContent.trim();
    el.setAttribute("aria-label", txt);
    el.innerHTML = txt.split(/\s+/).map((w) => `<span class="w" aria-hidden="true">${esc(w)}</span>`).join(" ");
  }

  function setupMotion() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add({ motion: "(prefers-reduced-motion: no-preference)", desk: "(min-width: 960px)", wide: "(min-width: 1024px)" }, (ctx) => {
      const { motion, desk, wide } = ctx.conditions;
      if (!motion) return;

      /* entrada do hero */
      gsap.timeline({ defaults: { ease: "expo.out" } })
        .from("[data-hero-word]", { yPercent: 110, duration: 1.4, stagger: 0.12 })
        .from("[data-hero-item]", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08 }, "-=1.0")
        .from(".hero__legend, .scroll-cue", { autoAlpha: 0, duration: 1 }, "-=0.6");

      /* hero ao rolar: camadas em velocidades diferentes */
      const hero = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero__waters", { yPercent: 12, scale: 1.08, ease: "none", scrollTrigger: hero });
      gsap.to(".hero__name", { yPercent: -30, ease: "none", scrollTrigger: hero });
      gsap.to(".hero__inner > :not(.hero__name)", { y: -60, autoAlpha: 0.15, ease: "none", scrollTrigger: hero });
      gsap.to(".hero__legend", { y: 80, ease: "none", scrollTrigger: hero });

      /* tipografia cinética: palavras ganham opacidade conforme a rolagem */
      $$("[data-words]").forEach((el) => {
        dividirPalavras(el);
        // começa num cinza com contraste 3:1 (texto grande) e acende para o creme
        gsap.fromTo(el.querySelectorAll(".w"), { color: "#646a73", y: 12 }, {
          color: "#e9e2d3", y: 0, stagger: 0.06, ease: "none",
          scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 55%", scrub: 0.6 },
        });
      });

      /* revelações reversíveis */
      $$("[data-reveal]").forEach((el) => {
        gsap.from(el, { y: 32, autoAlpha: 0, duration: 1, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" } });
      });
      $$(".area").forEach((el) => { if (!desk) gsap.from(el, { y: 40, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" } }); });

      /* transição de tom entre capítulos */
      const tons = [["#sobre", "#0a1116"], ["#experiencia", "#0b1a22"], ["#tecnologias", "#0c1015"], ["#projetos", "#07090c"], ["#trajetoria", "#0a1116"], ["#github", "#0c1015"], ["#contato", "#0b1a22"]];
      tons.forEach(([sel, cor], i) => {
        ScrollTrigger.create({ trigger: sel, start: "top 60%", end: "bottom 60%",
          onEnter: () => gsap.to("body", { backgroundColor: cor, duration: 0.8, overwrite: "auto" }),
          onEnterBack: () => gsap.to("body", { backgroundColor: cor, duration: 0.8, overwrite: "auto" }),
          onLeaveBack: () => { if (i === 0) gsap.to("body", { backgroundColor: "#07090c", duration: 0.8, overwrite: "auto" }); } });
      });

      /* trajetória: a linha do rio se desenha com a rolagem */
      gsap.fromTo(".journey__line span", { scaleY: 0 }, { scaleY: 1, ease: "none",
        scrollTrigger: { trigger: ".journey__wrap", start: "top 70%", end: "bottom 70%", scrub: true } });
      $$(".stop").forEach((s, i) => gsap.from(s, { x: desk ? (i % 2 ? 40 : -40) : 0, y: desk ? 0 : 24, autoAlpha: 0, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: s, start: "top 85%", toggleActions: "play none none reverse" } }));

      /* contato */
      gsap.from(".connect__waters", { yPercent: 20, scale: 0.9, ease: "none", scrollTrigger: { trigger: ".connect", start: "top bottom", end: "bottom bottom", scrub: true } });

      /* experiência: capítulo fixo, áreas reveladas uma a uma */
      if (desk) {
        document.documentElement.classList.add("is-cine");
        const areas = $$(".area"), idx = $$(".exp__index li");
        gsap.set(areas, { yPercent: 18, autoAlpha: 0 });
        gsap.set(areas[0], { yPercent: 0, autoAlpha: 1 });
        idx[0].classList.add("is-on");
        const tl = gsap.timeline({ scrollTrigger: {
          trigger: ".exp__pin", start: "top top", end: () => "+=" + innerHeight * 0.75 * areas.length, pin: true, scrub: 0.8,
          anticipatePin: 1, invalidateOnRefresh: true,
          snap: { snapTo: 1 / (areas.length - 1), duration: { min: 0.2, max: 0.5 }, delay: 0.1, ease: "power1.inOut" },
          onUpdate: (st) => { const n = Math.round(st.progress * (areas.length - 1)); idx.forEach((li, i) => li.classList.toggle("is-on", i === n)); },
        } });
        areas.forEach((a, i) => {
          if (!i) return;
          tl.to(areas[i - 1], { yPercent: -10, scale: 0.94, autoAlpha: 0, duration: 1, ease: "power2.inOut" })
            .to(a, { yPercent: 0, autoAlpha: 1, duration: 1, ease: "power2.inOut" }, "<0.15");
        });
      }

      /* projetos: faixa horizontal guiada pela rolagem vertical */
      if (wide) {
        document.documentElement.classList.add("is-cine");
        const track = $(".works__track"), vp = $(".works__viewport");
        const dist = () => Math.max(0, track.scrollWidth - vp.clientWidth + parseFloat(getComputedStyle(vp).paddingLeft) * 2);
        const tween = gsap.to(track, { x: () => -dist(), ease: "none",
          scrollTrigger: { trigger: ".works__pin", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.7, invalidateOnRefresh: true, anticipatePin: 1 } });
        $$(".work").forEach((card) => {
          gsap.from(card.querySelector(".work__media"), { clipPath: "inset(0 0 100% 0)", ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 95%", end: "left 60%", scrub: true } });
        });
        // teclado: ao focar um card fora da tela, a página rola até ele
        track.addEventListener("focusin", (e) => {
          const card = e.target.closest(".work"); if (!card) return;
          const st = tween.scrollTrigger, d = dist(); if (!d) return;
          const alvo = Math.min(1, Math.max(0, (card.offsetLeft - 40) / d));
          window.scrollTo({ top: st.start + alvo * (st.end - st.start), behavior: "instant" });
        });
      }

      return () => document.documentElement.classList.remove("is-cine");
    });

    addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ------------------------------------------------------------ início */
  renderExperience();
  renderSkills();
  renderWorks();
  renderTimeline();
  setupFilters();
  setupCase();
  setupNav();
  setupCopy();
  setupTerminal();
  setupWaters();
  setupMotion();
  setupGitHub();
})();
