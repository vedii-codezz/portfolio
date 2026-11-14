import { reducedMotionQuery } from "./motion-preference";

export function shouldPlayLotus() {
  return document.documentElement.dataset.lotusLoading === "pending";
}

export function lockPortfolio(content: HTMLElement) {
  const previous = { inert: content.inert, opacity: content.style.opacity, hidden: content.getAttribute("aria-hidden") };
  content.inert = true;
  content.setAttribute("aria-hidden", "true");
  return () => {
    content.inert = previous.inert;
    content.style.opacity = previous.opacity;
    if (previous.hidden === null) content.removeAttribute("aria-hidden");
    else content.setAttribute("aria-hidden", previous.hidden);
  };
}

export function completeLotus() {
  document.documentElement.dataset.lotusLoading = "complete";
  delete document.documentElement.dataset.lotusRecovery;
  window.dispatchEvent(new Event("portfolio:ready"));
}

// Runs before the first paint. Without JS the portfolio is visible by default.
// Recovery does not depend on React or the animation bundle hydrating successfully.
export const lotusBootstrap = `(function(){
  var root=document.documentElement;
  if(matchMedia('${reducedMotionQuery}').matches){root.dataset.lotusLoading='complete';return}
  root.dataset.lotusRecovery='armed';
  root.dataset.lotusLoading='pending';
  setTimeout(function(){
    if(root.dataset.lotusRecovery==='armed'&&(root.dataset.lotusLoading==='pending'||root.dataset.lotusLoading==='revealing')){
      delete root.dataset.lotusRecovery;
      root.dataset.lotusLoading='complete';
      var content=document.getElementById('portfolio-content');
      if(content){content.inert=false;content.removeAttribute('aria-hidden');content.style.opacity=''}
      window.dispatchEvent(new Event('portfolio:ready'));
    }
  },4800);
})()`;
