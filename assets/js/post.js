// post.js
// ============================================================
// امکانات تعاملی مقالات (اشتراک‌گذاری، TOC و...)
// ============================================================

import { LANG, getUIText } from "./config.js";
import { getDomRefs } from "./dom.js";
import { createAppState } from "./state.js";
import { createUiHelpers } from "./ui.js";

(function () {
  "use strict";

  // ========== استفاده از toast استاندارد ==========
  let uiHelpers = null;

  function getToast() {
    if (!uiHelpers) {
      const dom = getDomRefs();
      const state = createAppState();
      uiHelpers = createUiHelpers({ dom, state });
    }
    return uiHelpers;
  }

  function showToastMessage(message) {
    const { showToast } = getToast();
    showToast(message);
  }

  // ========== 1. ساخت جدول محتوا ==========
  function generateTableOfContents() {
    const content = document.querySelector(".post-content");
    if (!content) return;

    const headings = content.querySelectorAll("h2");
    if (headings.length < 2) return;

    const tocContainer = document.createElement("div");
    tocContainer.className = "post-toc";
    tocContainer.innerHTML = `
      <div class="post-toc-title">
        <i class="fa-solid fa-list-ul"></i>
        <span>${LANG === "fa" ? "آنچه در این مقاله می‌خوانید" : "What You'll Read"}</span>
      </div>
      <ul class="post-toc-list"></ul>
    `;

    const tocList = tocContainer.querySelector(".post-toc-list");

    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }

      const li = document.createElement("li");
      li.innerHTML = `<a href="#${heading.id}">${heading.textContent}</a>`;
      tocList.appendChild(li);
    });

    const firstElement = content.firstChild;
    content.insertBefore(tocContainer, firstElement);
  }

  // ========== 2. اشتراک‌گذاری ==========
  function addShareButtons() {
    const container = document.querySelector(".post-share");
    if (!container) return;

    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    const buttons = [
      {
        name: "WhatsApp",
        icon: "fab fa-whatsapp",
        url: `https://wa.me/?text=${title}%20${window.location.href}`,
      },
      {
        name: "Telegram",
        icon: "fab fa-telegram",
        url: `https://t.me/share/url?url=${window.location.href}&text=${title}`,
      },
      {
        name: "Twitter",
        icon: "fab fa-twitter",
        url: `https://twitter.com/intent/tweet?text=${title}&url=${window.location.href}`,
      },
      {
        name: LANG === "fa" ? "کپی لینک" : "Copy Link",
        icon: "fa-regular fa-copy",
        url: "copy",
      },
    ];

    const buttonsHtml = buttons
      .map(
        (btn) => `
      <button class="share-btn" data-share-type="${btn.name.toLowerCase()}" data-share-url="${btn.url !== "copy" ? btn.url : ""}">
        <i class="${btn.icon}"></i>
        <span>${btn.name}</span>
      </button>
    `,
      )
      .join("");

    container.innerHTML = `
      <div class="post-share-title">
        <i class="fa-regular fa-share-from-square"></i>
        <span>${LANG === "fa" ? "اشتراک‌گذاری این مقاله" : "Share this article"}</span>
      </div>
      <div class="post-share-buttons">
        ${buttonsHtml}
      </div>
    `;

    // رویداد کپی لینک - استفاده از toast استاندارد
    const copyBtn = container.querySelector(
      '[data-share-type="copy link"], [data-share-type="کپی لینک"]',
    );
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href);
        showToastMessage(LANG === "fa" ? "لینک کپی شد!" : "Link copied!");
      });
    }

    // رویدادهای سایر دکمه‌ها
    container.querySelectorAll(".share-btn").forEach((btn) => {
      const shareUrl = btn.dataset.shareUrl;
      if (shareUrl && shareUrl !== "copy") {
        btn.addEventListener("click", () => {
          window.open(shareUrl, "_blank", "width=600,height=400");
        });
      }
    });
  }

  // ========== 3. تخمین زمان مطالعه ==========
  function updateReadingTime() {
    const content = document.querySelector(".post-content");
    if (!content) return;

    const text = content.innerText;
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));

    const readingTimeElement = document.querySelector(
      ".post-meta-item.reading-time",
    );
    if (readingTimeElement) {
      const timeText =
        LANG === "fa" ? `${minutes} دقیقه مطالعه` : `${minutes} min read`;
      readingTimeElement.innerHTML = `<i class="fa-regular fa-clock"></i> ${timeText}`;
    }
  }

  // ========== 4. اجرای همه امکانات ==========
  function init() {
    generateTableOfContents();
    addShareButtons();
    updateReadingTime();
  }

  // ========== صبر برای لود شدن محتوای داینامیک ==========
  function waitForContent() {
    // اگر محتوا از قبل وجود داره
    const content = document.querySelector(".post-content");
    if (content && content.innerHTML.trim() !== "") {
      init();
      return;
    }

    // منتظر لود شدن محتوا باش
    const observer = new MutationObserver(() => {
      const content = document.querySelector(".post-content");
      if (content && content.innerHTML.trim() !== "") {
        observer.disconnect();
        init();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // تایم‌اوت برای جلوگیری از حلقه بی‌نهایت
    setTimeout(() => {
      observer.disconnect();
      const content = document.querySelector(".post-content");
      if (content && content.innerHTML.trim() !== "") {
        init();
      }
    }, 5000);
  }

  // ========== شروع ==========
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForContent);
  } else {
    waitForContent();
  }
})();
