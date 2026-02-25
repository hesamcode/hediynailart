import { GALLERY } from "./config.js";

function swipeDirFromDx(dx) {
  return dx < 0 ? -1 : 1;
}

export function initGallery({ dom, state }) {
  function renderDots(total, active) {
    if (!dom.galleryDots) {
      return;
    }

    dom.galleryDots.innerHTML = "";

    for (let index = 0; index < total; index += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `gallery-dot${index === active ? " active" : ""}`;

      dot.addEventListener("click", () => {
        state.galleryIndex = index;
        renderGallery();
        restartAuto();
      });

      dom.galleryDots.appendChild(dot);
    }
  }

  function renderGallery() {
    if (!dom.galleryImage || !GALLERY.length) {
      return;
    }

    const total = GALLERY.length;
    state.galleryIndex = ((state.galleryIndex % total) + total) % total;

    dom.galleryImage.setAttribute("src", encodeURI(GALLERY[state.galleryIndex]));
    renderDots(total, state.galleryIndex);
  }

  function restartAuto() {
    clearInterval(state.autoTimer);

    if (GALLERY.length <= 1) {
      return;
    }

    state.autoTimer = setInterval(() => {
      state.galleryIndex += 1;
      renderGallery();
    }, 4500);
  }

  function swipeToNext(direction) {
    if (GALLERY.length <= 1) {
      return;
    }

    state.galleryIndex += direction;
    renderGallery();
    restartAuto();
  }

  function onPointerDown(event) {
    clearInterval(state.autoTimer);

    state.swipe.active = true;
    state.swipe.locked = false;
    state.swipe.startX = event.clientX;
    state.swipe.startY = event.clientY;

    try {
      dom.galleryCard?.setPointerCapture(event.pointerId);
    } catch {}
  }

  function onPointerMove(event) {
    if (!state.swipe.active) {
      return;
    }

    const dx = event.clientX - state.swipe.startX;
    const dy = event.clientY - state.swipe.startY;

    if (!state.swipe.locked) {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
        state.swipe.locked = true;
      } else if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
        state.swipe.active = false;
        state.swipe.locked = false;
        return;
      }
    }

    if (state.swipe.locked) {
      event.preventDefault();
    }
  }

  function onPointerUp(event) {
    if (!state.swipe.active) {
      return;
    }

    const dx = event.clientX - state.swipe.startX;
    state.swipe.active = false;

    if (!state.swipe.locked) {
      restartAuto();
      return;
    }

    if (Math.abs(dx) >= 45) {
      swipeToNext(swipeDirFromDx(dx));
    } else {
      restartAuto();
    }
  }

  function onPointerCancel() {
    state.swipe.active = false;
    state.swipe.locked = false;
    restartAuto();
  }

  if (dom.galleryCard) {
    dom.galleryCard.addEventListener("pointerdown", onPointerDown, {
      passive: true,
    });
    dom.galleryCard.addEventListener("pointermove", onPointerMove, {
      passive: false,
    });
    dom.galleryCard.addEventListener("pointerup", onPointerUp, {
      passive: true,
    });
    dom.galleryCard.addEventListener("pointercancel", onPointerCancel, {
      passive: true,
    });
    dom.galleryCard.addEventListener("lostpointercapture", onPointerCancel);
  }

  renderGallery();
  restartAuto();
}
