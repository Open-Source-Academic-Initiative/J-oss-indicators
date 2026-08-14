/*
 * mod_oss_indicators — OSS ticker (config-driven, multi-instance)
 * Copyright (C) 2026 Open Source Academic Initiative (OpenSAI). GPL-3.0-or-later.
 *
 * Each ticker instance is a `.oss-ticker-root[data-ossi="<id>"]` element whose
 * config lives in window.OSSI[<id>] (written by tmpl/default.php). If a config
 * provides no `indicators`, the built-in DEFAULT_INDICATORS below are used.
 *
 * Indicator schema (declarative): { label, icon, relevance, type, arg, value,
 * change, tone, url }. `type` selects a resolver; each resolver returns the
 * live { v (value), c (change), t (tone), u (url) } for that entry.
 */
(function () {
  'use strict';

  if (window.__ossiTickerLoaded) { return; }
  window.__ossiTickerLoaded = true;

  /* ---- built-in default indicators (the original "Strategic 49") ---- */
  var DEFAULT_INDICATORS = [
    { label: 'AI Trending', icon: '🤖', relevance: 'Modelo de IA abierta con mayor tracción en la comunidad hoy.', type: 'hf_top', change: 'Top DLs', tone: 'positive' },
    { label: 'PyTorch', icon: '🔥', relevance: 'Framework líder global para investigación en IA.', type: 'gh_stars', arg: 'pytorch/pytorch', value: 'PyTorch', tone: 'neutral', url: 'https://pytorch.org' },
    { label: 'TensorFlow', icon: '🧠', relevance: 'Framework líder para IA en entornos de producción.', type: 'gh_stars', arg: 'tensorflow/tensorflow', value: 'TensorFlow', tone: 'neutral', url: 'https://tensorflow.org' },
    { label: 'LangChain', icon: '🦜', relevance: 'Estándar para el desarrollo rápido de aplicaciones con LLMs.', type: 'gh_stars', arg: 'langchain-ai/langchain', value: 'LangChain', tone: 'positive', url: 'https://langchain.com' },
    { label: 'Ollama', icon: '🦙', relevance: 'Plataforma líder para ejecutar modelos de IA localmente.', type: 'gh_stars', arg: 'ollama/ollama', value: 'Ollama', tone: 'positive', url: 'https://ollama.ai' },
    { label: 'OpenCV', icon: '👁️', relevance: 'Librería base global para visión por computadora.', type: 'gh_stars', arg: 'opencv/opencv', value: 'OpenCV', tone: 'neutral', url: 'https://opencv.org' },
    { label: 'Auto-GPT', icon: '🤖', relevance: 'Referencia en el desarrollo de agentes autónomos de IA.', type: 'gh_stars', arg: 'Significant-Gravitas/AutoGPT', value: 'Auto-GPT', tone: 'neutral', url: 'https://github.com/Significant-Gravitas/AutoGPT' },
    { label: 'Cyber Alert', icon: '🛡️', relevance: 'Última vulnerabilidad crítica (CVE) detectada y parcheada a nivel global.', type: 'gh_advisory', change: 'Critical CVE', tone: 'negative' },
    { label: 'OpenSSL', icon: '🔒', relevance: 'Actualizaciones del estándar global de encriptación web.', type: 'gh_tag', arg: 'openssl/openssl', value: 'OpenSSL ', change: 'Sec. Core', tone: 'neutral', url: 'https://openssl.org' },
    { label: 'Lets Encrypt', icon: '🔐', relevance: 'Adopción global de certificados SSL gratuitos y abiertos.', type: 'gh_stars', arg: 'certbot/certbot', value: 'Certbot', tone: 'positive', url: 'https://letsencrypt.org' },
    { label: 'Supply Sec', icon: '⛓️', relevance: 'Velocidad de parcheo automatizado en cadenas de suministro de software.', type: 'gh_stars', arg: 'dependabot/dependabot-core', value: 'Dependabot', tone: 'neutral', url: 'https://github.com/dependabot/dependabot-core' },
    { label: 'OWASP Top 10', icon: '⚠️', relevance: 'Concienciación sobre las vulnerabilidades web más críticas.', type: 'gh_stars', arg: 'OWASP/Top10', value: 'Top 10', tone: 'neutral', url: 'https://owasp.org' },
    { label: 'Suricata', icon: '🦅', relevance: 'Motor open source líder en detección de amenazas de red (IDS/IPS).', type: 'gh_stars', arg: 'OISF/suricata', value: 'Suricata', tone: 'neutral', url: 'https://suricata.io' },
    { label: 'Kali Linux', icon: '🐉', relevance: 'OS estándar para pruebas de penetración y auditorías de seguridad.', type: 'gh_stars', arg: 'offensive-security/kali-linux', value: 'Kali', tone: 'neutral', url: 'https://kali.org' },
    { label: 'Cloud Native', icon: '☁️', relevance: 'Versión estable de Kubernetes, el estándar global de orquestación en la nube.', type: 'gh_tag', arg: 'kubernetes/kubernetes', value: 'K8s ', change: 'Stable', tone: 'neutral', url: 'https://kubernetes.io' },
    { label: 'Docker', icon: '🐳', relevance: 'Adopción del motor de contenerización líder en la industria.', type: 'gh_stars', arg: 'moby/moby', value: 'Docker (Moby)', tone: 'neutral', url: 'https://docker.com' },
    { label: 'Terraform', icon: '🏗️', relevance: 'Estándar para Infraestructura como Código (IaC).', type: 'gh_stars', arg: 'hashicorp/terraform', value: 'Terraform', tone: 'neutral', url: 'https://terraform.io' },
    { label: 'Prometheus', icon: '🔥', relevance: 'Sistema principal de monitorización y alertas cloud-native.', type: 'gh_stars', arg: 'prometheus/prometheus', value: 'Prometheus', tone: 'neutral', url: 'https://prometheus.io' },
    { label: 'Ansible', icon: '⚙️', relevance: 'Plataforma open source líder en automatización TI.', type: 'gh_stars', arg: 'ansible/ansible', value: 'Ansible', tone: 'neutral', url: 'https://ansible.com' },
    { label: 'Apache Kafka', icon: '⚡', relevance: 'Escala de procesamiento de flujos de eventos en tiempo real.', type: 'gh_stars', arg: 'apache/kafka', value: 'Kafka', tone: 'neutral', url: 'https://kafka.apache.org' },
    { label: 'Nginx', icon: '🌐', relevance: 'Cuota de mercado y soporte del servidor web más utilizado del mundo.', type: 'gh_stars', arg: 'nginx/nginx', value: 'Nginx', tone: 'neutral', url: 'https://nginx.org' },
    { label: 'PostgreSQL', icon: '🐘', relevance: 'Base de datos relacional open source más avanzada y adoptada.', type: 'gh_stars', arg: 'postgres/postgres', value: 'PostgreSQL', tone: 'neutral', url: 'https://postgresql.org' },
    { label: 'Redis', icon: '🟥', relevance: 'Almacén de estructura de datos en memoria ultrarrápido.', type: 'gh_stars', arg: 'redis/redis', value: 'Redis', tone: 'neutral', url: 'https://redis.io' },
    { label: 'MongoDB', icon: '🍃', relevance: 'Base de datos NoSQL líder orientada a documentos.', type: 'gh_stars', arg: 'mongodb/mongo', value: 'MongoDB', tone: 'neutral', url: 'https://mongodb.com' },
    { label: 'Apache Spark', icon: '✨', relevance: 'Motor unificado de análisis para procesamiento de Big Data.', type: 'gh_stars', arg: 'apache/spark', value: 'Spark', tone: 'neutral', url: 'https://spark.apache.org' },
    { label: 'Elasticsearch', icon: '🔍', relevance: 'Motor de búsqueda y análisis distribuido empresarial.', type: 'gh_stars', arg: 'elastic/elasticsearch', value: 'Elasticsearch', tone: 'neutral', url: 'https://elastic.co' },
    { label: 'Data Science', icon: '🐼', relevance: 'Librería fundamental para análisis y manipulación de datos en Python.', type: 'gh_stars', arg: 'pandas-dev/pandas', value: 'Pandas', tone: 'positive', url: 'https://pandas.pydata.org' },
    { label: 'Hadoop', icon: '🐘', relevance: 'Framework clásico para almacenamiento distribuido de datos masivos.', type: 'gh_stars', arg: 'apache/hadoop', value: 'Hadoop', tone: 'neutral', url: 'https://hadoop.apache.org' },
    { label: 'Global Core', icon: '🐧', relevance: 'Última versión del kernel de Linux, el sistema nervioso de los servidores mundiales.', type: 'gh_tag', arg: 'torvalds/linux', value: 'Linux ', change: 'Mainline', tone: 'neutral', url: 'https://kernel.org' },
    { label: 'Ubuntu OS', icon: '🟠', relevance: 'Distribución Linux líder para entornos empresariales y cloud.', type: 'static', value: 'Ubuntu Server', change: 'LTS Core', tone: 'neutral', url: 'https://ubuntu.com' },
    { label: 'Hardware Abierto', icon: '🎛️', relevance: 'Arquitectura de conjunto de instrucciones (ISA) abierta y libre.', type: 'gh_stars', arg: 'riscv/riscv-isa-manual', value: 'RISC-V ISA', tone: 'neutral', url: 'https://riscv.org' },
    { label: 'Edge OS', icon: '🍓', relevance: 'Sistema base para computación perimetral (Edge) y educación.', type: 'gh_stars', arg: 'raspberrypi/linux', value: 'Raspberry OS', tone: 'neutral', url: 'https://raspberrypi.org' },
    { label: 'IoT Abierto', icon: '♾️', relevance: 'Plataforma estándar global de hardware IoT open source.', type: 'gh_stars', arg: 'arduino/Arduino', value: 'Arduino IDE', tone: 'neutral', url: 'https://arduino.cc' },
    { label: 'Frontend Scale', icon: '⚛️', relevance: 'Volumen de descargas de ReactJS, indicando la escala de la web.', type: 'npm_week', arg: 'react', value: 'ReactJS', tone: 'positive', url: 'https://npmjs.com/package/react' },
    { label: 'Enterprise Web', icon: '▲', relevance: 'Adopción del framework web React dominante en corporaciones.', type: 'npm_week', arg: 'next', value: 'Next.js', tone: 'positive', url: 'https://nextjs.org' },
    { label: 'Vue.js', icon: '🟩', relevance: 'Adopción del framework progresivo de interfaces de usuario.', type: 'npm_week', arg: 'vue', value: 'Vue.js', tone: 'positive', url: 'https://vuejs.org' },
    { label: 'Rust Supply', icon: '📦', relevance: 'Velocidad de crecimiento del ecosistema de componentes de Rust.', type: 'gh_stars', arg: 'rust-lang/crates.io', value: 'Crates.io', tone: 'neutral', url: 'https://crates.io' },
    { label: 'Java Ecosystem', icon: '☕', relevance: 'Infraestructura central de componentes para desarrollo empresarial en Java.', type: 'gh_stars', arg: 'apache/maven', value: 'Maven', tone: 'neutral', url: 'https://maven.apache.org' },
    { label: 'Memory Safe', icon: '🦀', relevance: 'Adopción de Rust para prevenir vulnerabilidades de memoria a nivel industrial.', type: 'gh_tag', arg: 'rust-lang/rust', value: 'Rust ', change: 'Enterprise', tone: 'positive', url: 'https://rust-lang.org' },
    { label: 'AI Language', icon: '🐍', relevance: 'Tracción de Python, el lenguaje base de la IA y la Ciencia de Datos.', type: 'gh_stars', arg: 'python/cpython', value: 'Python Core', tone: 'neutral', url: 'https://python.org' },
    { label: 'Cloud Lang', icon: '🐹', relevance: 'Adopción de Go, el lenguaje diseñado para infraestructura cloud concurrente.', type: 'gh_stars', arg: 'golang/go', value: 'Golang', tone: 'neutral', url: 'https://go.dev' },
    { label: 'Type Safe Web', icon: '🟦', relevance: 'Estándar global para el desarrollo web seguro y escalable.', type: 'npm_week', arg: 'typescript', value: 'TypeScript', tone: 'positive', url: 'https://typescriptlang.org' },
    { label: 'WebAssembly', icon: '🕸️', relevance: 'Tecnología para ejecutar aplicaciones de alto rendimiento en navegadores.', type: 'gh_stars', arg: 'WebAssembly/design', value: 'WASM', tone: 'neutral', url: 'https://webassembly.org' },
    { label: 'Fediverse', icon: '🐘', relevance: 'Número de servidores activos en la red social descentralizada Mastodon.', type: 'mastodon', change: 'Instances', tone: 'positive', url: 'https://joinmastodon.org' },
    { label: 'Privacy Protocol', icon: '💬', relevance: 'Tracción del protocolo estándar global para mensajería cifrada (E2EE).', type: 'gh_stars', arg: 'signalapp/Signal-Android', value: 'Signal', tone: 'neutral', url: 'https://signal.org' },
    { label: 'Anonymity', icon: '🧅', relevance: 'Actualizaciones de la red de ruteo global para privacidad y libertad de expresión.', type: 'gh_stars', arg: 'torproject/tor', value: 'Tor Project', tone: 'neutral', url: 'https://torproject.org' },
    { label: 'Open Geo Data', icon: '🗺️', relevance: 'Proyecto colaborativo global para crear un mapa libre y editable del mundo.', type: 'gh_stars', arg: 'openstreetmap/openstreetmap-website', value: 'OpenStreetMap', tone: 'neutral', url: 'https://openstreetmap.org' },
    { label: 'Dev Environment', icon: '💻', relevance: 'Dominio global del editor de código open source más utilizado.', type: 'gh_stars', arg: 'microsoft/vscode', value: 'VS Code', tone: 'neutral', url: 'https://code.visualstudio.com' },
    { label: 'R&D Trending', icon: '🚀', relevance: 'Proyecto open source creado en las últimas 24h con mayor crecimiento global.', type: 'gh_search', arg: 'created:>{yesterday}', change: 'New Trend', tone: 'positive' }
  ];

  /* ---- low-level fetchers ---- */
  var api = {
    ghStars: function (repo) {
      return fetch('https://api.github.com/repos/' + repo).then(function (r) { return r.json(); })
        .then(function (d) { return d.stargazers_count ? (d.stargazers_count / 1000).toFixed(1) + 'K ★' : null; });
    },
    ghTag: function (repo) {
      return fetch('https://api.github.com/repos/' + repo + '/tags?per_page=1').then(function (r) { return r.json(); })
        .then(function (d) { return (d && d[0]) ? d[0].name : null; });
    },
    npmWeek: function (pkg) {
      return fetch('https://api.npmjs.org/downloads/point/last-week/' + pkg).then(function (r) { return r.json(); })
        .then(function (d) { return d.downloads ? (d.downloads / 1000000).toFixed(1) + 'M DLs' : null; });
    },
    ghSearch: function (q) {
      return fetch('https://api.github.com/search/repositories?q=' + encodeURIComponent(q) + '&sort=stars&order=desc&per_page=1')
        .then(function (r) { return r.json(); })
        .then(function (d) { return (d.items && d.items[0]) ? d.items[0] : null; });
    }
  };

  /* ---- resolvers: entry -> { v, c, t, u } ---- */
  var RESOLVERS = {
    gh_stars: function (e) { return api.ghStars(e.arg).then(function (v) { return { v: e.value || e.label, c: v, t: e.tone || 'neutral', u: e.url }; }); },
    gh_tag: function (e) { return api.ghTag(e.arg).then(function (tag) { return { v: (e.value || '') + (tag || ''), c: e.change || '', t: e.tone || 'neutral', u: e.url }; }); },
    npm_week: function (e) { return api.npmWeek(e.arg).then(function (v) { return { v: e.value || e.label, c: v, t: e.tone || 'positive', u: e.url }; }); },
    gh_search: function (e) {
      var q = String(e.arg || '');
      if (q.indexOf('{yesterday}') !== -1) {
        q = q.replace('{yesterday}', new Date(Date.now() - 86400000).toISOString().split('T')[0]);
      }
      return api.ghSearch(q).then(function (r) { return r ? { v: r.name, c: e.change || 'Trend', t: e.tone || 'positive', u: r.html_url } : null; });
    },
    gh_advisory: function (e) {
      return fetch('https://api.github.com/advisories?severity=critical&per_page=1').then(function (r) { return r.json(); })
        .then(function (d) { var a = d && d[0]; return a ? { v: a.cve_id || a.ghsa_id, c: e.change || 'Critical CVE', t: e.tone || 'negative', u: a.html_url } : null; });
    },
    hf_top: function (e) {
      return fetch('https://huggingface.co/api/models?sort=downloads&direction=-1&limit=1').then(function (r) { return r.json(); })
        .then(function (d) { var m = d && d[0]; return m ? { v: m.id.split('/').pop(), c: e.change || 'Top DLs', t: e.tone || 'positive', u: 'https://huggingface.co/' + m.id } : null; });
    },
    mastodon: function (e) {
      return fetch('https://api.joinmastodon.org/servers').then(function (r) { return r.json(); })
        .then(function (d) { return { v: Array.isArray(d) ? d.length.toLocaleString() : '10K+', c: e.change || 'Instances', t: e.tone || 'positive', u: e.url || 'https://joinmastodon.org' }; });
    },
    static: function (e) { return Promise.resolve({ v: e.value || e.label, c: e.change || '', t: e.tone || 'neutral', u: e.url }); }
  };

  /* ---- helpers ---- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function toneClass(t) { return (t === 'positive' || t === 'negative') ? t : 'neutral'; }
  function safeUrl(u) { u = String(u || ''); return /^https?:\/\//i.test(u) ? u : '#'; }
  function shuffle(a) { return a.slice().sort(function () { return 0.5 - Math.random(); }); }

  /* Fetch a random subset, in batches of 5, and cache the display rows. */
  function getData(indicators, cfg) {
    var KEY = cfg.cacheKey || 'ossi_default_v1';
    var TTL = (cfg.cacheHours || 24) * 3600 * 1000;
    var need = Math.min(cfg.showCount || 7, indicators.length);

    try {
      var cached = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (cached && (Date.now() - cached.ts) < TTL && cached.data && cached.data.length >= need) {
        return Promise.resolve(cached.data);
      }
    } catch (e) { /* ignore */ }

    var subset = shuffle(indicators).slice(0, cfg.fetchCount || 10);
    var out = [];

    function runBatch(i) {
      if (i >= subset.length) { return Promise.resolve(); }
      var batch = subset.slice(i, i + 5);
      return Promise.all(batch.map(function (e) {
        var rsv = RESOLVERS[e.type];
        if (!rsv) { return Promise.resolve(); }
        return rsv(e).then(function (d) {
          if (d && d.v) {
            out.push({ v: d.v, c: d.c, t: d.t, u: d.u, icon: e.icon, label: e.label, relevance: e.relevance });
          }
        }).catch(function () { /* skip failed indicator */ });
      })).then(function () { return runBatch(i + 5); });
    }

    return runBatch(0).then(function () {
      if (out.length) {
        try { localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), data: out })); } catch (e) { /* ignore */ }
        return out;
      }
      try { var c = JSON.parse(localStorage.getItem(KEY) || 'null'); return c ? c.data : null; } catch (e) { return null; }
    });
  }

  function render(root, cfg, rows) {
    var wrapper = root.querySelector('.oss-ticker-wrapper');
    var loader = root.querySelector('.oss-ticker-loading');
    var pick = shuffle(rows).slice(0, cfg.showCount || 7);
    var tip = esc(cfg.tooltipTitle || '');
    var html = '';

    pick.forEach(function (d) {
      html += '<a class="oss-ticker-item" href="' + esc(safeUrl(d.u)) + '" target="_blank" rel="noopener noreferrer">'
        + '<span class="oss-ticker-icon">' + esc(d.icon) + '</span>'
        + '<span class="oss-ticker-label">' + esc(d.label) + '</span>'
        + '<span class="oss-ticker-value">' + esc(d.v) + '</span>'
        + '<span class="oss-ticker-change ' + toneClass(d.t) + '">' + esc(d.c) + '</span>'
        + '<div class="oss-tooltip"><strong>' + tip + '</strong><br>' + esc(d.relevance) + '</div>'
        + '</a>';
    });

    if (wrapper) { wrapper.innerHTML = html + html; wrapper.style.display = 'flex'; }
    if (loader) { loader.style.display = 'none'; }
  }

  function run(root) {
    var id = root.getAttribute('data-ossi');
    var cfg = (window.OSSI && window.OSSI[id]) ? window.OSSI[id] : {};
    var indicators = (cfg.indicators && cfg.indicators.length) ? cfg.indicators : DEFAULT_INDICATORS;

    getData(indicators, cfg).then(function (rows) {
      if (rows && rows.length) {
        render(root, cfg, rows);
      } else {
        var loader = root.querySelector('.oss-ticker-loading');
        if (loader) { loader.textContent = cfg.noDataText || 'No data available'; }
      }
    });
  }

  function init() {
    var roots = document.querySelectorAll('.oss-ticker-root[data-ossi]');
    for (var i = 0; i < roots.length; i++) { run(roots[i]); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
