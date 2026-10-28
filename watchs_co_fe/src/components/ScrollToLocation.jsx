import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToLocation() {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    let frame;
    const scroll = () => {
      const target = document.getElementById(id);
      if (!target) return false;
      frame = requestAnimationFrame(() => target.scrollIntoView({
        block: "start",
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth",
      }));
      return true;
    };
    if (scroll()) return () => cancelAnimationFrame(frame);
    const observer = new MutationObserver(() => { if (scroll()) observer.disconnect(); });
    observer.observe(document.body, { childList: true, subtree: true });
    const timeout = setTimeout(() => observer.disconnect(), 10000);
    return () => { observer.disconnect(); clearTimeout(timeout); if (frame) cancelAnimationFrame(frame); };
  }, [pathname, search, hash]);
  return null;
}
