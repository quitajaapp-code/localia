import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

const isMobileViewport = () => window.matchMedia(MOBILE_MEDIA_QUERY).matches;

const forceScrollTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const ScrollToTop = () => {
  const { pathname, key } = useLocation();

  useEffect(() => {
    if (!("scrollRestoration" in window.history) || !isMobileViewport()) return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    forceScrollTop();

    if (!isMobileViewport()) return;

    const timeoutId = window.setTimeout(forceScrollTop, 120);
    requestAnimationFrame(() => {
      forceScrollTop();
      requestAnimationFrame(forceScrollTop);
    });

    return () => window.clearTimeout(timeoutId);
  }, [pathname, key]);

  return null;
};

export default ScrollToTop;
