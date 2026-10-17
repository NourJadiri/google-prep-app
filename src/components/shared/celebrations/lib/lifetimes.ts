/* Toast.css fades a toast out at 2.5 s; this is when it leaves the DOM. Under reduced motion the CSS animates nothing, so this timer alone hides it. */
export const TOAST_MS = 3000;

/* Outlasts the longest fall: a 0.9 + 1.2 s duration after a 0.3 s delay. */
export const CONFETTI_MS = 2800;
