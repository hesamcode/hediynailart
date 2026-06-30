// post.js
// ============================================================
// امکانات تعاملی مقالات (TOC, Share, Reading Time)
// ============================================================
import { LANG, getUIText } from "./config.js";
import { ui } from "./main.js";

(function () {
  "use strict";

  // ========== 0. تابع تبدیل فارسی به فینگلیش (بدون علائم) ==========
  function toFinglish(text) {
    const map = {
      // حروف فارسی
      آ: "a",
      ا: "a",
      ب: "b",
      پ: "p",
      ت: "t",
      ث: "s",
      ج: "j",
      چ: "ch",
      ح: "h",
      خ: "kh",
      د: "d",
      ذ: "z",
      ر: "r",
      ز: "z",
      ژ: "zh",
      س: "s",
      ش: "sh",
      ص: "s",
      ض: "z",
      ط: "t",
      ظ: "z",
      ع: "a",
      غ: "gh",
      ف: "f",
      ق: "gh",
      ک: "k",
      گ: "g",
      ل: "l",
      م: "m",
      ن: "n",
      و: "v",
      ه: "h",
      ی: "y",
      // حروف عربی
      أ: "a",
      إ: "a",
      ة: "h",
      // اعداد فارسی
      "۰": "0",
      "۱": "1",
      "۲": "2",
      "۳": "3",
      "۴": "4",
      "۵": "5",
      "۶": "6",
      "۷": "7",
      "۸": "8",
      "۹": "9",
    };

    return (
      text
        .trim()
        .toLowerCase()
        // حذف تمام علائم نگارشی (، . ; : ! ? " ' ( ) [ ] { } < > / \ | @ # $ % ^ & * + =)
        .replace(/[،؛:!؟\.\-"'()\[\]{}<>\/\\|@#$%^&*+=]/g, "")
        // حذف کاراکترهای غیرمجاز (فقط حروف، اعداد و فاصله مجاز است)
        .replace(/[^\w\s\u0600-\u06FF]/g, "")
        // تبدیل هر کاراکتر
        .split("")
        .map((char) => map[char] || char)
        .join("")
        // جایگزینی فاصله با خط تیره
        .replace(/\s+/g, "-")
        // حذف خط تیره‌های تکراری
        .replace(/-+/g, "-")
        // حذف خط تیره از ابتدا و انتها
        .replace(/^-|-$/g, "")
    );
  }

  // ========== 1. ساخت جدول محتوا (TOC) با اسکرول نرم ==========
  function generateTableOfContents() {
    const content = document.querySelector(".post-content");
    if (!content) return;

    const headings = content.querySelectorAll("h2");
    if (headings.length < 2) return;

    // ساخت id به صورت فینگلیش بر اساس متن عنوان
    headings.forEach((heading) => {
      if (!heading.id) {
        // استفاده از تابع toFinglish برای تبدیل عنوان به فینگلیش
        const slug = toFinglish(heading.textContent);
        heading.id = slug;
      }
    });

    // ایجاد ساختار TOC
    const tocContainer = document.createElement("div");
    tocContainer.className = "post-toc";

    const tocHeader = document.createElement("div");
    tocHeader.className = "post-toc-header";
    tocHeader.innerHTML = `
      <div class="post-toc-title">
        <i class="fa-solid fa-list-ul"></i>
        <span>${LANG === "fa" ? "آنچه در این مقاله می‌خوانید" : "What You'll Read"}</span>
      </div>
      <button class="post-toc-toggle" aria-expanded="false" type="button">
        <i class="fa-solid fa-chevron-down"></i>
      </button>
    `;

    const tocList = document.createElement("ul");
    tocList.className = "post-toc-list";
    tocList.style.display = "none";

    headings.forEach((heading) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${heading.id}`;
      a.textContent = heading.textContent;
      a.className = "toc-link";

      // اسکرول نرم هنگام کلیک روی لینک TOC
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById(heading.id);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          history.pushState(null, "", `#${heading.id}`);
        }
      });

      li.appendChild(a);
      tocList.appendChild(li);
    });

    tocContainer.appendChild(tocHeader);
    tocContainer.appendChild(tocList);

    // رویداد باز/بسته کردن TOC
    const toggleBtn = tocHeader.querySelector(".post-toc-toggle");
    toggleBtn.addEventListener("click", () => {
      const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
      const newState = !isExpanded;
      toggleBtn.setAttribute("aria-expanded", newState);
      tocList.style.display = newState ? "block" : "none";
    });

    const firstElement = content.firstChild;
    content.insertBefore(tocContainer, firstElement);
  }

  // ========== 2. اشتراک‌گذاری ==========
  function addShareButtons() {
    const container = document.querySelector(".post-share");
    if (!container) return;

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

    // رویداد کپی لینک
    const copyBtn = container.querySelector(
      '[data-share-type="copy link"], [data-share-type="کپی لینک"]',
    );
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          ui.showToast(getUIText("linkCopied"));
        });
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

  // ========== 5. صبر برای لود شدن محتوا ==========
  function waitForContent() {
    const content = document.querySelector(".post-content");
    if (content && content.innerHTML.trim() !== "") {
      init();
      return;
    }

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

    setTimeout(() => {
      observer.disconnect();
      const content = document.querySelector(".post-content");
      if (content && content.innerHTML.trim() !== "") {
        init();
      }
    }, 5000);
  }

  // ========== 6. شروع ==========
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForContent);
  } else {
    waitForContent();
  }
})();
