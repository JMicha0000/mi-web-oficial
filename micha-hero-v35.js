(function () {
  var loader = document.querySelector('#mdx-loader');
  var root = document.documentElement;
  var hero = document.querySelector('.mdx-hero');
  var heroProjectsLink = document.querySelector('.mdx-primary');
  var compactLayoutQuery = window.matchMedia('(max-width: 1024px)');
  var mobileProjectsQuery = window.matchMedia('(max-width: 600px)');
  var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  var wave = document.querySelector('.mdx-wave');
  var waveStartTimer;
  var waveInterval;

  function rememberIntro() {
    try {
      sessionStorage.setItem('michaIntroSeen', '1');
    } catch (error) {
      /* Storage may be disabled. */
    }
  }

  function removeLoader() {
    rememberIntro();
    root.classList.remove('mdx-intro-pending');
    root.classList.add('mdx-intro-seen');
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
  }

  function startLoader() {
    if (!loader || root.classList.contains('mdx-intro-seen') || motionPreference.matches) {
      removeLoader();
      return;
    }

    var portrait = document.querySelector('.mdx-person');
    var assetPromises = [];

    if (document.fonts && document.fonts.ready) {
      assetPromises.push(document.fonts.ready.catch(function () {}));
    }

    if (portrait && !portrait.complete) {
      assetPromises.push(new Promise(function (resolve) {
        portrait.addEventListener('load', resolve, { once: true });
        portrait.addEventListener('error', resolve, { once: true });
      }));
    }

    function delay(milliseconds) {
      return new Promise(function (resolve) {
        window.setTimeout(resolve, milliseconds);
      });
    }

    var resourcesReady = Promise.race([
      Promise.all(assetPromises),
      delay(500)
    ]);
    var minimumPaintTime = delay(590);
    var safetyTimer = window.setTimeout(removeLoader, 1500);

    requestAnimationFrame(function () {
      window.setTimeout(function () {
        loader.classList.add('is-painting');
      }, 55);
    });

    Promise.all([resourcesReady, minimumPaintTime]).then(function () {
      if (!loader || !loader.parentNode) return;
      loader.setAttribute('aria-hidden', 'true');
      loader.classList.add('is-opening');
      window.setTimeout(function () {
        window.clearTimeout(safetyTimer);
        removeLoader();
      }, 480);
    });
  }

  startLoader();

  function playWave() {
    if (!wave || motionPreference.matches || document.hidden) return;
    wave.classList.remove('is-waving');
    void wave.offsetWidth;
    wave.classList.add('is-waving');
  }

  function startWaveCycle() {
    window.clearTimeout(waveStartTimer);
    window.clearInterval(waveInterval);
    if (!wave || motionPreference.matches) {
      if (wave) wave.classList.remove('is-waving');
      return;
    }
    waveStartTimer = window.setTimeout(playWave, 900);
    waveInterval = window.setInterval(playWave, 5000);
  }

  if (wave) {
    wave.addEventListener('animationend', function () {
      wave.classList.remove('is-waving');
    });
    if (motionPreference.addEventListener) {
      motionPreference.addEventListener('change', startWaveCycle);
    } else {
      motionPreference.addListener(startWaveCycle);
    }
    startWaveCycle();
  }

  if (new URLSearchParams(window.location.search).get('qa') === '1') {
    document.body.classList.add('mdx-qa-capture');
  }

  if (hero) {
    document.body.classList.add('micha-hero-top');
    requestAnimationFrame(function () { hero.classList.add('mdx-ready'); });

    function updateHeader() {
      document.body.classList.toggle('micha-hero-top', window.scrollY < 105);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  var mobileScrollSequenceObserver;

  function setupMobileScrollSequence() {
    var sequence = document.querySelector('.us_custom_7b53cd8e');
    if (!sequence) return;

    var steps = Array.prototype.slice.call(
      sequence.querySelectorAll('.wpb_column.us_animate_this')
    ).slice(0, 4);

    if (!steps.length) return;

    if (mobileScrollSequenceObserver) {
      mobileScrollSequenceObserver.disconnect();
      mobileScrollSequenceObserver = null;
    }

    if (!mobileProjectsQuery.matches || motionPreference.matches) {
      document.body.classList.remove('mdx-mobile-scroll-enhanced');
      steps.forEach(function (step) {
        step.classList.remove('mdx-mobile-scroll-step', 'is-visible');
        step.style.removeProperty('--mdx-scroll-step');
      });
      return;
    }

    document.body.classList.add('mdx-mobile-scroll-enhanced');
    steps.forEach(function (step, index) {
      step.classList.add('mdx-mobile-scroll-step');
      step.classList.remove('is-visible');
      step.style.setProperty('--mdx-scroll-step', index);
    });

    if (!('IntersectionObserver' in window)) {
      steps.forEach(function (step) { step.classList.add('is-visible'); });
      return;
    }

    mobileScrollSequenceObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -8% 0px'
    });

    steps.forEach(function (step) { mobileScrollSequenceObserver.observe(step); });
  }

  setupMobileScrollSequence();

  if (mobileProjectsQuery.addEventListener) {
    mobileProjectsQuery.addEventListener('change', setupMobileScrollSequence);
  } else {
    mobileProjectsQuery.addListener(setupMobileScrollSequence);
  }

  if (motionPreference.addEventListener) {
    motionPreference.addEventListener('change', setupMobileScrollSequence);
  } else {
    motionPreference.addListener(setupMobileScrollSequence);
  }

  function updateProjectsLink() {
    if (!heroProjectsLink) return;
    heroProjectsLink.setAttribute('href', compactLayoutQuery.matches ? '#proyectos-movil' : '#proyectos');
  }

  if (heroProjectsLink) {
    updateProjectsLink();
    heroProjectsLink.addEventListener('click', function (event) {
      var targetSelector = compactLayoutQuery.matches ? '#proyectos-movil' : '#proyectos';
      var target = document.querySelector(targetSelector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: motionPreference.matches ? 'auto' : 'smooth', block: 'start' });
      if (window.history && window.history.replaceState) {
        try {
          window.history.replaceState(null, '', targetSelector);
        } catch (error) {
          /* Local file previews may not allow History API URL changes. */
        }
      }
    });

    if (compactLayoutQuery.addEventListener) {
      compactLayoutQuery.addEventListener('change', updateProjectsLink);
    } else {
      compactLayoutQuery.addListener(updateProjectsLink);
    }
  }

  function setupMobileProjects() {
    if (!mobileProjectsQuery.matches) return;

    var source = document.querySelector('#trabajo #us_post_list_qfbe');
    if (!source || document.querySelector('.mdx-mobile-projects')) return;

    var candidates = Array.prototype.slice.call(
      source.querySelectorAll('.w-grid-list > article, .owl-item:not(.cloned) article')
    );
    var projects = [];
    var seen = {};

    candidates.forEach(function (article) {
      var key = article.getAttribute('data-id') || article.textContent.trim();
      if (!seen[key] && projects.length < 3) {
        seen[key] = true;
        projects.push(article);
      }
    });

    if (projects.length < 2) return;

    var section = document.createElement('section');
    section.className = 'mdx-mobile-projects layout_34';
    section.setAttribute('aria-label', 'Carrusel de proyectos');

    var viewport = document.createElement('div');
    viewport.className = 'mdx-mobile-projects-viewport';
    viewport.tabIndex = 0;
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-roledescription', 'carrusel');
    viewport.setAttribute('aria-label', 'Tres proyectos. Desliza o utiliza las flechas para navegar.');

    var track = document.createElement('div');
    track.className = 'mdx-mobile-projects-track';

    projects.forEach(function (article, index) {
      var slide = article.cloneNode(true);
      slide.className += ' mdx-mobile-project-slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'diapositiva');
      slide.setAttribute('aria-label', 'Proyecto ' + (index + 1) + ' de ' + projects.length);
      slide.querySelectorAll('[id]').forEach(function (node) { node.removeAttribute('id'); });
      slide.querySelectorAll('img').forEach(function (image) {
        image.loading = index === 0 ? 'eager' : 'lazy';
        image.decoding = 'async';
        if (index > 0) image.removeAttribute('fetchpriority');
      });
      track.appendChild(slide);
    });

    viewport.appendChild(track);

    var controls = document.createElement('div');
    controls.className = 'mdx-mobile-projects-controls';

    var previous = document.createElement('button');
    previous.className = 'mdx-mobile-projects-arrow mdx-mobile-projects-prev';
    previous.type = 'button';
    previous.setAttribute('aria-label', 'Ver proyecto anterior');
    previous.innerHTML = '<i class="fal fa-long-arrow-left" aria-hidden="true"></i>';

    var dots = document.createElement('div');
    dots.className = 'mdx-mobile-projects-dots';
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', 'Seleccionar proyecto');

    projects.forEach(function (_, index) {
      var dot = document.createElement('button');
      dot.className = 'mdx-mobile-projects-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Ver proyecto ' + (index + 1));
      dot.setAttribute('aria-current', index === 0 ? 'true' : 'false');
      dot.addEventListener('click', function () { goTo(index); });
      dots.appendChild(dot);
    });

    var next = document.createElement('button');
    next.className = 'mdx-mobile-projects-arrow mdx-mobile-projects-next';
    next.type = 'button';
    next.setAttribute('aria-label', 'Ver proyecto siguiente');
    next.innerHTML = '<i class="fal fa-long-arrow-right" aria-hidden="true"></i>';

    controls.appendChild(previous);
    controls.appendChild(dots);
    controls.appendChild(next);

    var status = document.createElement('p');
    status.className = 'mdx-mobile-projects-status';
    status.setAttribute('aria-live', 'polite');
    status.textContent = '1 de ' + projects.length;

    var hint = document.createElement('p');
    hint.className = 'mdx-mobile-projects-hint';
    hint.textContent = 'Desliza para ver los otros ' + (projects.length - 1) + ' proyectos';

    section.appendChild(viewport);
    section.appendChild(controls);
    section.appendChild(status);
    section.appendChild(hint);
    source.parentNode.insertBefore(section, source.nextSibling);
    document.body.classList.add('mdx-mobile-projects-ready');

    var current = 0;
    var ticking = false;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setCurrent(index) {
      current = Math.max(0, Math.min(projects.length - 1, index));
      Array.prototype.forEach.call(dots.children, function (dot, dotIndex) {
        dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
      });
      Array.prototype.forEach.call(track.children, function (slide, slideIndex) {
        var isCurrent = slideIndex === current;
        slide.toggleAttribute('inert', !isCurrent);
        slide.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
      });
      previous.disabled = current === 0;
      next.disabled = current === projects.length - 1;
      status.textContent = (current + 1) + ' de ' + projects.length;
      hint.textContent = current === projects.length - 1
        ? 'Has visto los 3 proyectos'
        : 'Desliza para ver ' + (projects.length - current - 1) + (projects.length - current - 1 === 1 ? ' proyecto más' : ' proyectos más');
    }

    function goTo(index) {
      var slide = track.children[Math.max(0, Math.min(projects.length - 1, index))];
      if (!slide) return;
      viewport.scrollTo({ left: slide.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
      setCurrent(index);
    }

    previous.addEventListener('click', function () { goTo(current - 1); });
    next.addEventListener('click', function () { goTo(current + 1); });

    viewport.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(current - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(current + 1);
      }
    });

    viewport.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var closest = 0;
        var distance = Infinity;
        Array.prototype.forEach.call(track.children, function (slide, index) {
          var delta = Math.abs(slide.offsetLeft - viewport.scrollLeft);
          if (delta < distance) {
            distance = delta;
            closest = index;
          }
        });
        setCurrent(closest);
        ticking = false;
      });
    }, { passive: true });

    window.addEventListener('resize', function () { goTo(current); }, { passive: true });
    setCurrent(0);
  }

  function setupRealProjects() {
    var source = document.querySelector('#us_post_list_qfbe .w-grid-list');
    if (!source || source.dataset.realProjectsReady === 'true') return;

    var articles = Array.prototype.filter.call(source.children, function (node) {
      return node.matches && node.matches('article.w-grid-item');
    });
    if (articles.length < 3) return;

    var projects = [
      {
        title: 'Gompich',
        url: 'https://gompich.com/',
        image: 'wp-content/uploads/2026/portfolio/gompich-portfolio.webp',
        alt: 'Página principal del portafolio artístico de Gompich',
        tags: ['Diseño web', 'Animaciones'],
        label: 'Visitar el portafolio de Gompich'
      },
      {
        title: 'Cocinando con Itamae',
        url: 'https://cocinandoconitamae.com/',
        image: 'wp-content/uploads/2026/portfolio/cocinando-con-itamae.webp',
        alt: 'Página principal de Cocinando con Itamae',
        tags: ['Cursos online', 'Tienda web'],
        label: 'Visitar Cocinando con Itamae'
      },
      {
        title: 'Tu proyecto aquí',
        url: '#form-footer',
        image: 'wp-content/uploads/2024/07/funker-1024x510.webp',
        alt: 'Espacio reservado para un próximo proyecto',
        tags: ['Desarrollo web', 'Diseño'],
        label: 'Contactar para iniciar un proyecto'
      }
    ];

    function configureArticle(article, project, index) {
      article.classList.toggle('micha-live-project', index < 2);
      article.setAttribute('data-project-type', index < 2 ? 'publicado' : 'proximo');

      article.querySelectorAll('a').forEach(function (link) {
        link.setAttribute('href', project.url);
        link.setAttribute('aria-label', project.label);
        if (index < 2) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener');
        } else {
          link.removeAttribute('target');
          link.removeAttribute('rel');
        }
      });

      var title = article.querySelector('.usg_post_title_1 a');
      if (title) title.textContent = project.title;

      var image = article.querySelector('.usg_post_image_1 img');
      if (image) {
        image.setAttribute('src', project.image);
        image.setAttribute('alt', project.alt);
        image.setAttribute('width', '1024');
        image.setAttribute('height', '576');
        image.setAttribute('decoding', 'async');
        image.removeAttribute('srcset');
        image.removeAttribute('sizes');
        if (index === 0) {
          image.setAttribute('fetchpriority', 'high');
          image.removeAttribute('loading');
        } else {
          image.removeAttribute('fetchpriority');
          image.setAttribute('loading', 'lazy');
        }
      }

      article.querySelectorAll('.w-btn-label').forEach(function (label, labelIndex) {
        label.textContent = project.tags[labelIndex % project.tags.length];
      });
    }

    projects.forEach(function (project, index) {
      configureArticle(articles[index], project, index);
    });

    articles.slice(3).forEach(function (article) { article.remove(); });
    source.dataset.realProjectsReady = 'true';
  }

  function setupMichaImageTrail() {
    var section = document.querySelector('#micha-trail');
    if (!section || section.dataset.trailReady === 'true') return;

    var mobileTrailQuery = window.matchMedia('(max-width: 760px)');
    if (mobileTrailQuery.matches) {
      section.dataset.trailReady = 'true';
      return;
    }

    var stage = section.querySelector('.mdx-trail__stage');
    var svg = section.querySelector('.mdx-trail__word');
    var layer = section.querySelector('.mdx-trail__images');
    if (!stage || !svg || !layer) return;

    section.dataset.trailReady = 'true';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    var sources = [
      'wp-content/uploads/2026/portfolio/gompich-portfolio.webp',
      'wp-content/uploads/2026/portfolio/cocinando-con-itamae.webp',
      'wp-content/uploads/2024/07/funker-1024x510.webp'
    ];
    var sourceIndex = 0;
    var lastPoint = null;
    var svgNamespace = 'http://www.w3.org/2000/svg';

    sources.forEach(function (source) {
      var preload = new Image();
      preload.decoding = 'async';
      preload.src = source;
    });

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function spawnImage(x, y) {
      var image = document.createElementNS(svgNamespace, 'image');
      var width = 250;
      var height = 152;
      var centerX = clamp(x, width * .45, 1200 - width * .45);
      var centerY = clamp(y, height * .4, 300 - height * .4);
      var rotation = -10 + Math.random() * 20;
      var source = sources[sourceIndex % sources.length];
      sourceIndex += 1;

      image.setAttribute('href', source);
      image.setAttribute('x', String(centerX - width / 2));
      image.setAttribute('y', String(centerY - height / 2));
      image.setAttribute('width', String(width));
      image.setAttribute('height', String(height));
      image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      image.setAttribute('transform', 'rotate(' + rotation.toFixed(2) + ' ' + centerX + ' ' + centerY + ')');
      image.classList.add('mdx-trail__image');
      layer.appendChild(image);

      while (layer.children.length > 9) {
        layer.removeChild(layer.firstElementChild);
      }

      requestAnimationFrame(function () {
        image.classList.add('is-visible');
      });

      window.setTimeout(function () {
        image.classList.add('is-leaving');
      }, 820);

      window.setTimeout(function () {
        if (image.parentNode) image.parentNode.removeChild(image);
      }, 1400);
    }

    function pointerToSvg(event) {
      var rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      return {
        clientX: event.clientX,
        clientY: event.clientY,
        x: (event.clientX - rect.left) / rect.width * 1200,
        y: (event.clientY - rect.top) / rect.height * 300
      };
    }

    stage.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch') return;
      var point = pointerToSvg(event);
      if (!point || point.x < 0 || point.x > 1200 || point.y < 0 || point.y > 300) return;

      if (lastPoint) {
        var distance = Math.hypot(point.clientX - lastPoint.clientX, point.clientY - lastPoint.clientY);
        if (distance < 52) return;
      }

      lastPoint = point;
      spawnImage(point.x, point.y);
    }, { passive: true });

    stage.addEventListener('pointerleave', function () {
      lastPoint = null;
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupRealProjects, { once: true });
    document.addEventListener('DOMContentLoaded', setupMobileProjects, { once: true });
    document.addEventListener('DOMContentLoaded', setupMichaImageTrail, { once: true });
  } else {
    setupRealProjects();
    setupMobileProjects();
    setupMichaImageTrail();
  }

  if (mobileProjectsQuery.addEventListener) {
    mobileProjectsQuery.addEventListener('change', function (event) {
      if (event.matches) setupMobileProjects();
    });
  } else {
    mobileProjectsQuery.addListener(function (event) {
      if (event.matches) setupMobileProjects();
    });
  }
})();
