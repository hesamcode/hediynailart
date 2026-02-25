export function createUiHelpers({ dom, state }) {
  function showToast(text) {
    if (!dom.toast || !dom.toastText) {
      return;
    }

    dom.toastText.textContent = String(text || "");
    dom.toast.classList.remove("app-hidden");

    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      dom.toast?.classList.add("app-hidden");
    }, 2600);
  }

  function hideToast() {
    dom.toast?.classList.add("app-hidden");
  }

  function scrollToElement(element, options = {}) {
    if (!element) {
      return;
    }

    const { behavior = "smooth", block = "start" } = options;
    element.scrollIntoView({ behavior, block });
  }

  function scrollAppTop() {
    dom.app?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return {
    showToast,
    hideToast,
    scrollToElement,
    scrollAppTop,
  };
}
