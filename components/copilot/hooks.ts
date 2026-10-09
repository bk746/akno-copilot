"use client";

import { useEffect, useState } from "react";

const fr = new Intl.NumberFormat("fr-FR");

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

export function useParallaxTiles(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      el.style.setProperty("--py", `${window.scrollY * 0.25}px`);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref]);
}

export function useCountUp(
  target: number,
  options?: { decimals?: number; duration?: number; active?: boolean },
) {
  const { decimals = 0, duration = 1500, active = true } = options ?? {};
  const [display, setDisplay] = useState(decimals ? "0" : "0");

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - p, 4);
      const v = target * e;
      setDisplay(
        decimals
          ? v.toFixed(decimals).replace(".", ",")
          : fr.format(Math.round(v)).replace(/\s/g, "\u00a0"),
      );
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target, decimals, duration]);

  return display;
}

function animateRevealContent(el: HTMLElement) {
  el.querySelectorAll<HTMLElement>("[data-animate-width]").forEach((b) => {
    b.style.width = `${b.dataset.animateWidth}%`;
  });
  el.querySelectorAll<HTMLElement>("[data-w]").forEach((b) => {
    b.style.width = `${b.dataset.w}%`;
  });
  el.querySelectorAll<SVGCircleElement>(".fg[data-score], .fg[data-v]").forEach(
    (c) => {
      const v = Number(c.dataset.score ?? c.dataset.v);
      if (!Number.isFinite(v)) return;
      c.style.strokeDashoffset = String(226.2 * (1 - v / 100));
    },
  );
  el.dispatchEvent(new CustomEvent("copilot-reveal"));
}

export function useScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const nodes = document.querySelectorAll<HTMLElement>(".rv");
    if (reduced) {
      nodes.forEach((el) => {
        el.classList.add("in");
        animateRevealContent(el);
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.classList.add("in");
          animateRevealContent(el);
          io.unobserve(el);
        });
      },
      { threshold: 0.15 },
    );

    nodes.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
