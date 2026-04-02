import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────
// LENIS + GSAP TICKER INTEGRATION
// ─────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);

// ─────────────────────────────────────────────
// CUSTOM CURSOR
// ─────────────────────────────────────────────
const cursor = document.getElementById('cursor');
if (cursor) {
  document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' });
    cursor.classList.add('visible');
  });
  document.querySelectorAll('[data-cursor-cta]').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('on-cta'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('on-cta'));
  });
}

// ─────────────────────────────────────────────
// HERO — Einblende-Animation
// ─────────────────────────────────────────────
const heroLogo     = document.querySelector<HTMLElement>('.hero-logo');
const heroHeadline = document.querySelector<HTMLElement>('.hero-headline');
const heroSubline  = document.querySelector<HTMLElement>('.hero-subline');
const heroCta      = document.querySelector<HTMLElement>('.hero-cta');

const heroTl = gsap.timeline({ delay: 0.15 });
if (heroLogo)     heroTl.fromTo(heroLogo,     { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' });
if (heroHeadline) heroTl.fromTo(heroHeadline, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '-=0.7');
if (heroSubline)  heroTl.fromTo(heroSubline,  { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.65');
if (heroCta)      heroTl.fromTo(heroCta,      { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.55');

// ─────────────────────────────────────────────
// MANIFESTO — Teal → Weiß Word Reveal (langsamer)
// ─────────────────────────────────────────────
const manifestoWords = document.querySelectorAll<HTMLElement>('.manifesto-word');

if (manifestoWords.length) {
  gsap.fromTo(
    manifestoWords,
    { opacity: 0, color: '#10b2ad', y: 12 },
    {
      opacity: 1,
      color: '#ffffff',
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.05,
      scrollTrigger: {
        trigger: '.manifesto-section',
        start: 'top 75%',
        end: 'bottom 15%',
        scrub: 1.5,
      },
    }
  );
}

// ─────────────────────────────────────────────
// LEISTUNGEN — 3D Card Einblende
// ─────────────────────────────────────────────
const leistungCards = document.querySelectorAll<HTMLElement>('.leistung-card');

if (leistungCards.length) {
  gsap.fromTo(
    leistungCards,
    { opacity: 0, y: 80, rotateX: 10 },
    {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.14,
      scrollTrigger: {
        trigger: '.leistungen-section',
        start: 'top 65%',
      },
    }
  );
}

// ─────────────────────────────────────────────
// PROZESS — Ink Splash Reveal
// ─────────────────────────────────────────────

const prozessDataEl    = document.getElementById('prozess-data');
const prozessSection   = document.querySelector<HTMLElement>('.prozess-section');
const prozessTitle     = document.querySelector<HTMLElement>('.prozess-step-title');
const prozessDesc      = document.querySelector<HTMLElement>('.prozess-step-desc');
const prozessBgNum     = document.querySelector<HTMLElement>('.prozess-bg-num');
const prozessIndicator = document.querySelector<HTMLElement>('.prozess-step-indicator');
const prozessDots      = document.querySelectorAll<HTMLElement>('.prozess-dot');
const prozessTealDot   = document.querySelector<HTMLElement>('.prozess-teal-dot');
const inkDisp          = document.querySelector('#ink-disp');
const inkBlur          = document.querySelector('#ink-blur');

if (prozessDataEl && prozessSection && prozessTitle && prozessDesc && inkDisp && inkBlur) {
  type StepData = { nummer: string; titel: string; beschreibung: string };
  const stepsData: StepData[] = JSON.parse(prozessDataEl.dataset.steps || '[]');

  let currentStep  = -1;
  let currentTl: gsap.core.Timeline | null = null;
  let bgNumVersion = 0;

  function updateUi(step: StepData, idx: number) {
    if (prozessIndicator) prozessIndicator.textContent = `${step.nummer} / 04`;

    if (prozessBgNum) {
      const v = ++bgNumVersion;
      gsap.to(prozessBgNum, {
        opacity: 0, duration: 0.2,
        onComplete: () => {
          if (bgNumVersion !== v) return;
          prozessBgNum!.textContent = step.nummer;
          gsap.to(prozessBgNum, { opacity: 1, duration: 0.3 });
        },
      });
    }

    prozessDots.forEach((dot, i) => {
      dot.style.width      = i === idx ? '2rem' : '0.5rem';
      dot.style.background = i === idx ? '#10b2ad' : 'rgba(255,255,255,0.2)';
    });
  }

  // Ink Reveal: distorted ink → scharfer weißer Text
  function inkReveal(title: string): gsap.core.Timeline {
    prozessTitle!.textContent = title;
    prozessTitle!.style.color  = '#10b2ad';
    prozessTitle!.style.filter = 'url(#ink-filter)';
    gsap.set(inkDisp, { attr: { scale: 180 } });
    gsap.set(inkBlur, { attr: { stdDeviation: 12 } });
    gsap.set(prozessTitle, { opacity: 0 });

    let colorSwitched = false;

    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        prozessTitle!.style.filter = 'none';
      },
    });

    tl.to(prozessTitle, { opacity: 1, duration: 0.3, ease: 'none' }, 0.1);
    tl.to(inkBlur, { attr: { stdDeviation: 0 }, duration: 1.2, ease: 'power2.out' }, 0);
    tl.to(inkDisp, {
      attr: { scale: 0 },
      duration: 1.4,
      ease: 'power3.out',
      onUpdate() {
        if (!colorSwitched) {
          const s = parseFloat(inkDisp!.getAttribute('scale') ?? '180');
          if (s < 60) {
            colorSwitched = true;
            gsap.to(prozessTitle, { color: '#ffffff', duration: 0.4 });
          }
        }
      },
    }, 0);

    tl.play();
    return tl;
  }

  // Ink Dissolve: klarer Text → explodiert in Tinte
  function inkDissolve(onComplete: () => void): gsap.core.Timeline {
    prozessTitle!.style.filter = 'url(#ink-filter)';
    gsap.set(inkDisp, { attr: { scale: 0 } });
    gsap.set(inkBlur, { attr: { stdDeviation: 0 } });

    const tl = gsap.timeline({ paused: true, onComplete });

    tl.to(inkDisp,     { attr: { scale: 200 },     duration: 0.7, ease: 'power3.in' }, 0);
    tl.to(inkBlur,     { attr: { stdDeviation: 20 }, duration: 0.7, ease: 'power2.in' }, 0);
    // opacity erreicht 0 bei 35% der Dissolve-Dauer
    tl.to(prozessTitle, { opacity: 0, duration: 0.245, ease: 'none' }, 0);
    // Farb-Flash zu Teal wenn opacity < 0.5
    tl.to(prozessTitle, { color: '#10b2ad', duration: 0.05 }, 0.12);

    tl.play();
    return tl;
  }

  // Teal Dot: minimale Geste zwischen den Steps
  function tealDotPulse(onComplete: () => void) {
    if (!prozessTealDot) { onComplete(); return; }
    gsap.set(prozessTealDot, { opacity: 1, scale: 1 });
    gsap.timeline({ onComplete })
      .to(prozessTealDot, { scale: 1.5, duration: 0.15, ease: 'power1.out' })
      .to(prozessTealDot, { scale: 1,   duration: 0.15, ease: 'power1.in'  })
      .to(prozessTealDot, { opacity: 0, duration: 0.1  }, '>');
  }

  function killCurrent() {
    if (!currentTl) return;
    currentTl.kill();
    currentTl = null;
    gsap.killTweensOf([prozessTitle, inkDisp, inkBlur, prozessTealDot].filter(Boolean));
    prozessTitle!.style.filter = 'none';
    gsap.set(prozessTitle, { opacity: 1, color: '#ffffff' });
    gsap.set(inkDisp, { attr: { scale: 0 } });
    gsap.set(inkBlur, { attr: { stdDeviation: 0 } });
    if (prozessTealDot) gsap.set(prozessTealDot, { opacity: 0 });
  }

  const revealStep = (idx: number) => {
    if (idx === currentStep) return;
    const step = stepsData[idx];
    if (!step) return;

    const isFirst = currentStep === -1;
    currentStep = idx;

    killCurrent();
    updateUi(step, idx);

    if (isFirst) {
      if (prozessDesc) {
        gsap.set(prozessDesc, { opacity: 0, y: 12 });
        prozessDesc.textContent = step.beschreibung;
        gsap.to(prozessDesc, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.9 });
      }
      currentTl = inkReveal(step.titel);
    } else {
      if (prozessDesc) gsap.to(prozessDesc, { opacity: 0, duration: 0.2 });

      currentTl = inkDissolve(() => {
        tealDotPulse(() => {
          if (prozessDesc) {
            gsap.set(prozessDesc, { opacity: 0, y: 12 });
            prozessDesc.textContent = step.beschreibung;
            gsap.to(prozessDesc, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.5 });
          }
          currentTl = inkReveal(step.titel);
        });
      });
    }
  };

  // Erster Reveal beim Einblenden der Section
  ScrollTrigger.create({
    trigger: prozessSection,
    start: 'top 75%',
    once: true,
    onEnter: () => revealStep(0),
  });

  // Step-Progression per Scroll
  setTimeout(() => {
    ScrollTrigger.create({
      trigger: prozessSection,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const newStep = Math.min(Math.floor(self.progress * 4), 3);
        if (newStep !== currentStep) revealStep(newStep);
      },
    });
  }, 100);
}

// ─────────────────────────────────────────────
// REFERENZEN — Editorial Layout
// ─────────────────────────────────────────────

// Section Header
const refLabel    = document.querySelector<HTMLElement>('.ref-label');
const refHeadline = document.querySelector<HTMLElement>('.ref-headline');
if (refLabel && refHeadline) {
  gsap.fromTo(
    [refLabel, refHeadline],
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15,
      scrollTrigger: { trigger: '.referenzen-section', start: 'top 70%', once: true },
    }
  );
}

// Case-Items: Bild clip-path reveal + Content fade in
document.querySelectorAll<HTMLElement>('.case-item').forEach((item) => {
  const imageWrap = item.querySelector<HTMLElement>('.case-image-wrap');
  const cat       = item.querySelector<HTMLElement>('.case-cat');
  const name      = item.querySelector<HTMLElement>('.case-name');
  const desc      = item.querySelector<HTMLElement>('.case-desc');
  const metrics   = item.querySelector<HTMLElement>('.case-metrics');

  // Bild: clip-path von unten enthüllen, scrub: 1.5
  if (imageWrap) {
    gsap.fromTo(
      imageWrap,
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 1.5,
        },
      }
    );
  }

  // Content: Stagger fade in
  const contentEls = [cat, name, desc, metrics].filter((el): el is HTMLElement => el !== null);
  if (contentEls.length) {
    gsap.fromTo(
      contentEls,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: item, start: 'top 72%', once: true },
      }
    );
  }
});

// Counter Animation für Metriken
document.querySelectorAll<HTMLElement>('.referenz-metrik').forEach((el) => {
  const target = parseInt(el.dataset.count || '0', 10);
  const suffix = el.dataset.suffix || '';
  const obj = { val: 0 };

  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; },
      });
    },
  });
});

// ─────────────────────────────────────────────
// CTA — Fade In
// ─────────────────────────────────────────────
const ctaTextCol = document.querySelector<HTMLElement>('.cta-text-col');
const ctaFormCol = document.querySelector<HTMLElement>('.cta-form-col');

const ctaCols = [ctaTextCol, ctaFormCol].filter((el): el is HTMLElement => el !== null);
if (ctaCols.length) {
  gsap.fromTo(
    ctaCols,
    { opacity: 0, y: 50 },
    {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.2,
      scrollTrigger: { trigger: '.cta-section', start: 'top 70%', once: true },
    }
  );
}
