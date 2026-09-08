import {
  Component,
  ElementRef,
  afterNextRender,
  inject,
  DestroyRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/**
 * "Sobre Nosotros" como landing scroll-driven (estilo GTA VI): un solo acto
 * fijo donde una bolsa Franco's (CSS 3D) se revela, se abre y suelta las papas,
 * seguido de escenas con los valores, cifras y equipo. GSAP + ScrollTrigger para
 * el timeline y Lenis para el scroll con inercia. Con `prefers-reduced-motion`
 * o sin JS, todo el contenido queda visible y legible (fallback `.no-motion`).
 */
@Component({
  selector: 'app-nosotros',
  imports: [RouterLink],
  host: { class: 'block', '[class.no-motion]': 'reduceMotion' },
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css',
})
export class Nosotros {
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly reduceMotion =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** 14 papas del "estallido" — trayectoria de dispersión determinista. */
  protected readonly chips = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2 + (i % 2 ? 0.5 : 0);
    const r = 160 + (i % 5) * 90;
    return {
      x: Math.cos(a) * r * 1.35,
      y: Math.sin(a) * r * 0.8 - 40,
      rot: (i * 57) % 360,
      scale: 0.7 + ((i * 7) % 10) / 14,
    };
  });

  /** ~26 papas que llenan la bolsa (posiciones en el viewBox 300x430). */
  protected readonly chipsInside = Array.from({ length: 26 }, (_, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    return {
      x: 42 + col * 46 + ((row % 2) * 20) + ((i * 13) % 11) - 5,
      y: 60 + row * 52 + ((i * 7) % 14) - 6,
      r: (i * 47) % 360,
      s: 0.62 + ((i * 5) % 9) / 20,
    };
  });

  protected readonly historia = [
    'Franco’s nació en 2010 con una misión clara: llevar los sabores auténticos',
    'del Perú a cada rincón del país. Elaboramos snacks 100% naturales con',
    'ingredientes seleccionados directamente de agricultores locales.',
  ];

  protected readonly valores = [
    { title: '100% Natural', desc: 'Sin conservantes ni colorantes artificiales. Solo ingredientes de la tierra peruana.' },
    { title: 'Comercio justo', desc: 'Trabajamos directamente con agricultores de Piura, Lambayeque y Lima.' },
    { title: 'Calidad artesanal', desc: 'Cada lote se elabora con técnicas tradicionales y control de calidad riguroso.' },
  ];

  protected readonly stats = [
    { count: 14, suffix: '+', label: 'Años de experiencia' },
    { count: 50, suffix: '+', label: 'Agricultores aliados' },
    { count: 20, suffix: '+', label: 'Variedades de snacks' },
    { count: 10, suffix: 'K+', label: 'Clientes satisfechos' },
  ];

  protected readonly equipo = [
    { ini: 'FF', name: 'Franco Flores', role: 'Fundador & CEO', bg: '#fdecea', fg: '#c0392b' },
    { ini: 'MR', name: 'María Ramos', role: 'Directora de Calidad', bg: '#fdf0dd', fg: '#b45309' },
    { ini: 'CP', name: 'Carlos Paz', role: 'Jefe de Producción', bg: '#e6f4ea', fg: '#15803d' },
    { ini: 'LT', name: 'Lucía Torres', role: 'Gerente Comercial', bg: '#e8e9fb', fg: '#4f46e5' },
  ];

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (this.reduceMotion) return;

      gsap.registerPlugin(ScrollTrigger);

      // La landing siempre arranca desde arriba (evita restauraciones de scroll
      // a mitad del acto, que dejarían el timeline desincronizado).
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);

      const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
      lenis.scrollTo(0, { immediate: true });
      const tick = (t: number) => lenis.raf(t * 1000);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const ctx = gsap.context(() => {
        // --- ACTO 1: bolsa (timeline fijado y scrubbeado) ---
        const tl = gsap.timeline({
          scrollTrigger: { trigger: '.act', start: 'top top', end: 'bottom bottom', scrub: 1 },
        });

        tl.to('.wordmark', { yPercent: -130, opacity: 0, ease: 'power2.in', duration: 1 }, 0)
          .to('.scroll-hint', { opacity: 0, duration: 0.25 }, 0)
          .from('.bag-scene', { scale: 0.5, yPercent: 10, opacity: 0.4, duration: 1.1, ease: 'power2.out' }, 0)
          .to('.bag', { rotateY: -18, rotateX: 6, duration: 1.2, ease: 'sine.inOut' }, 0.35)
          // La bolsa sube y encoge para dejar sitio al texto de la historia.
          .to('.bag-scene', { scale: 0.7, yPercent: -24, duration: 1, ease: 'power2.inOut' }, 0.7)
          .from('.story .rise', { yPercent: 130, opacity: 0, stagger: 0.14, duration: 0.8, ease: 'power3.out' }, 1)
          .to('.story', { opacity: 0, yPercent: -12, duration: 0.5, ease: 'power1.in' }, 2.2)
          // La bolsa vuelve al centro y se abre.
          .to('.bag-scene', { scale: 1, yPercent: 0, duration: 0.7, ease: 'power2.inOut' }, 2.3)
          .to('.bag', { rotateY: 0, rotateX: 8, scale: 1.08, duration: 0.8, ease: 'power2.inOut' }, 2.4)
          .to('.bag', { rotateX: -4, y: -30, duration: 0.6, ease: 'power2.in' }, 3.0)
          .to('.chip', {
            opacity: 1,
            x: (i: number) => this.chips[i].x,
            y: (i: number) => this.chips[i].y,
            rotation: (i: number) => this.chips[i].rot,
            scale: (i: number) => this.chips[i].scale,
            stagger: 0.03,
            duration: 1,
            ease: 'power3.out',
          }, 3.0)
          .to('.bag-scene', { scale: 0.92, opacity: 0.9, duration: 0.7 }, 3.2)
          .from('.act-title', { opacity: 0, yPercent: 40, duration: 0.5, ease: 'power2.out' }, 3.55);

        // Flotación sutil de la bolsa (antes de que el scroll tome el control).
        gsap.to('.bag-scene', { y: -14, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });

        // --- Escena: valores ---
        gsap.from('.valor', {
          scrollTrigger: { trigger: '.scene-valores', start: 'top 78%' },
          yPercent: 45, opacity: 0, rotateX: 16, transformOrigin: 'top center',
          stagger: 0.12, duration: 0.7, ease: 'power3.out',
        });

        // --- Escena: cifras (cuenta ascendente) ---
        gsap.utils.toArray<HTMLElement>('.stat .v').forEach((el) => {
          const target = Number(el.dataset['count'] ?? 0);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target, duration: 1.6, ease: 'power2.out', snap: { v: 1 },
            scrollTrigger: { trigger: el, start: 'top 88%' },
            onUpdate: () => { el.textContent = String(Math.round(obj.v)); },
          });
        });

        // --- Escena: equipo ---
        gsap.from('.miembro', {
          scrollTrigger: { trigger: '.scene-equipo', start: 'top 80%' },
          yPercent: 35, opacity: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out',
        });
        gsap.to('.miembro', {
          scrollTrigger: { trigger: '.scene-equipo', start: 'top bottom', end: 'bottom top', scrub: true },
          yPercent: (i: number) => -4 - i * 3, ease: 'none',
        });

        // --- Escena: cierre ---
        gsap.from('.scene-cierre .lockup', {
          scrollTrigger: { trigger: '.scene-cierre', start: 'top 68%' },
          scale: 0.82, opacity: 0, duration: 0.9, ease: 'power3.out',
        });
      }, this.host.nativeElement);

      // Recalcular posiciones cuando ya cargaron fuentes/imágenes.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      const rid = window.setTimeout(refresh, 400);
      requestAnimationFrame(refresh);

      destroyRef.onDestroy(() => {
        window.clearTimeout(rid);
        window.removeEventListener('load', refresh);
        gsap.ticker.remove(tick);
        ctx.revert();
        lenis.destroy();
        if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
      });
    });
  }
}
