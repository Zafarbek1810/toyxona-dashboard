/** Hides the HTML boot loader after a short branded delay on every refresh. */
export function dismissBootLoader(minMs = 1100) {
  const el = document.getElementById("boot-loader");
  if (!el) return () => {};

  const started = performance.now();
  let hideTimer: number | undefined;
  let removeTimer: number | undefined;
  let cancelled = false;

  const hide = () => {
    if (cancelled || !document.getElementById("boot-loader")) return;
    el.classList.add("boot-loader--hide");
    el.setAttribute("aria-busy", "false");
    removeTimer = window.setTimeout(() => {
      el.remove();
      document.documentElement.classList.remove("is-booting");
    }, 420);
  };

  const schedule = () => {
    if (cancelled) return;
    const elapsed = performance.now() - started;
    const wait = Math.max(0, minMs - elapsed);
    hideTimer = window.setTimeout(hide, wait);
  };

  if (document.readyState === "complete") {
    schedule();
  } else {
    window.addEventListener("load", schedule);
  }

  return () => {
    cancelled = true;
    window.clearTimeout(hideTimer);
    window.clearTimeout(removeTimer);
    window.removeEventListener("load", schedule);
  };
}
