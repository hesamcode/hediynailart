// blog.js
// ============================================================
// وبلاگ دو زبانه - مدیریت لیست مقالات و بنر
// ============================================================
import { LANG } from "./config.js";
import { escapeHtml } from "./ui.js";

// ========== دیتابیس مقالات دو زبانه ==========
const POSTS_DB = [
  {
    ids: {
      fa: "rahnamaie-kamel-kaasht-e-nakhan", // راهنمای کامل کاشت ناخن
      en: "complete-guide-to-nail-extension",
    },
    dateGregorian: "2026-06-01",
    datePersian: "۱۴۰۵/۰۳/۱۱",
    image: {
      fa: "/assets/images/blog/gallery/rahnamaie-kamel-kaasht-e-nakhan.jpg",
      en: "/assets/images/blog/gallery/complete-guide-to-nail-extension.jpg",
    },
    order: 1,
    fa: {
      title: "راهنمای کامل کاشت ناخن",
      excerpt:
        "همه چیز درباره کاشت ناخن، انواع روش‌ها، مزایا و معایب هر کدام. راهنمای جامع برای شروع کار حرفه‌ای.",
      category: "کاشت ناخن",
      readTime: "۵ دقیقه",
      tags: ["کاشت ناخن", "آموزش", "مبتدیان"],
    },
    en: {
      title: "Complete Guide to Nail Extension",
      excerpt:
        "Everything about nail extension, different methods, pros and cons. A comprehensive guide for beginners and professionals.",
      category: "Nail Extension",
      readTime: "6 min",
      tags: ["Nail Extension", "Tutorial", "Beginners"],
    },
  },
  {
    ids: {
      fa: "tafavat-gelish-va-kaasht-e-nakhan", // تفاوت ژلیش و کاشت ناخن
      en: "difference-between-gelish-and-nail-extension",
    },
    dateGregorian: "2026-06-08",
    datePersian: "۱۴۰۵/۰۳/۱۸",
    image: {
      fa: "/assets/images/blog/gallery/tafavat-gelish-va-kaasht-e-nakhan.jpg",
      en: "/assets/images/blog/gallery/difference-between-gelish-and-nail-extension.jpg",
    },
    order: 2,
    fa: {
      title: "تفاوت ژلیش و کاشت ناخن",
      excerpt:
        "بررسی کامل تفاوت‌های ژلیش و کاشت، مزایا و معایب هر روش و راهنمای انتخاب روش مناسب برای شما.",
      category: "ژلیش",
      readTime: "۴ دقیقه",
      tags: ["ژلیش", "مقایسه", "انتخاب روش"],
    },
    en: {
      title: "Difference Between Gelish and Nail Extension",
      excerpt:
        "Complete comparison between gelish and nail extension, pros and cons, and how to choose the right method for you.",
      category: "Gelish",
      readTime: "4 min",
      tags: ["Gelish", "Comparison", "Method Choice"],
    },
  },
  {
    ids: {
      fa: "moraghebat-haye-baad-az-kaasht-e-nakhan", // مراقبت های بعد از کاشت ناخن
      en: "post-nail-extension-care",
    },
    dateGregorian: "2026-06-17",
    datePersian: "۱۴۰۵/۰۳/۲۷",
    image: {
      fa: "/assets/images/blog/gallery/moraghebat-haye-baad-az-kaasht-e-nakhan.jpg",
      en: "/assets/images/blog/gallery/post-nail-extension-care.jpg",
    },
    order: 3,
    fa: {
      title: "مراقبت های بعد از کاشت ناخن",
      excerpt:
        "نکات طلایی برای افزایش ماندگاری کاشت ناخن و حفظ سلامت ناخن‌های طبیعی. ۱۰ نکته مهم که باید بدانید.",
      category: "مراقبت",
      readTime: "۶ دقیقه",
      tags: ["مراقبت", "بهداشت", "ماندگاری"],
    },
    en: {
      title: "Post-Nail Extension Care",
      excerpt:
        "Golden tips for increasing nail extension longevity and maintaining natural nail health. 10 important tips you should know.",
      category: "Care",
      readTime: "5 min",
      tags: ["Care", "Hygiene", "Longevity"],
    },
  },
  {
    ids: {
      fa: "tarandehaye-jadid-tarahi-nakhan-2026", // ترندهای جدید طراحی ناخن ۲۰۲۶
      en: "new-nail-design-trends-2026",
    },
    dateGregorian: "2026-06-25",
    datePersian: "۱۴۰۵/۰۴/۰۴",
    image: {
      fa: "/assets/images/blog/gallery/tarandehaye-jadid-tarahi-nakhan-2026.jpg",
      en: "/assets/images/blog/gallery/new-nail-design-trends-2026.jpg",
    },
    order: 4,
    fa: {
      title: "ترندهای جدید طراحی ناخن ۲۰۲۶",
      excerpt:
        "معرفی جدیدترین و محبوب‌ترین استایل‌های طراحی ناخن، رنگ‌های ترند و تکنیک‌های مدرن.",
      category: "طراحی",
      readTime: "۴ دقیقه",
      tags: ["طراحی", "ترند", "مد ۲۰۲۶"],
    },
    en: {
      title: "New Nail Design Trends 2026",
      excerpt:
        "Introducing the latest and most popular nail design styles, trendy colors and modern techniques.",
      category: "Design",
      readTime: "4 min",
      tags: ["Design", "Trends", "2026 Fashion"],
    },
  },
];

// ========== ابزارهای کمکی ==========
function getBasePath(lang) {
  return lang === "fa" ? "/blog/" : "/en/blog/";
}

function getAllPostsSorted() {
  return [...POSTS_DB].sort((a, b) => a.order - b.order);
}

function getLocalizedText(post, field, lang) {
  if (post[lang] && post[lang][field] !== undefined) {
    return post[lang][field];
  }
  const otherLang = lang === "fa" ? "en" : "fa";
  if (post[otherLang] && post[otherLang][field] !== undefined) {
    return post[otherLang][field];
  }
  return "";
}

function formatDate(post, lang) {
  if (lang === "fa") {
    return post.datePersian;
  }
  const date = new Date(post.dateGregorian);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPostUrl(post, lang) {
  return `${getBasePath(lang)}${post.ids[lang]}/`;
}

// ========== رندر لیست مقالات ==========
function renderBlogPosts() {
  const grid = document.getElementById("blog-grid");
  if (!grid) return;

  const lang = LANG;
  const postsCount = document.getElementById("posts-count");
  const sortedPosts = getAllPostsSorted();

  if (postsCount) {
    const countText =
      lang === "fa"
        ? `${sortedPosts.length} مقاله`
        : `${sortedPosts.length} Articles`;
    postsCount.textContent = countText;
  }

  if (sortedPosts.length === 0) {
    const emptyText =
      lang === "fa" ? "هیچ مقاله‌ای یافت نشد." : "No articles found.";
    grid.innerHTML = `<div class="loading-spinner">${emptyText}</div>`;
    return;
  }

  grid.innerHTML = sortedPosts
    .map((post) => {
      const title = getLocalizedText(post, "title", lang);
      const excerpt = getLocalizedText(post, "excerpt", lang);
      const category = getLocalizedText(post, "category", lang);
      const readTime = getLocalizedText(post, "readTime", lang);
      const date = formatDate(post, lang);
      const postUrl = getPostUrl(post, lang);

      return `
        <article class="blog-card">
          ${
            post.image.fa && post.image.en
              ? `
            <div class="blog-card-image">
              <img src="${lang === "fa" ? post.image.fa : post.image.en}" alt="${escapeHtml(title)}" loading="lazy">
            </div>
          `
              : ""
          }
          <div class="blog-card-content">
            <h3 class="blog-card-title">
              <a href="${postUrl}">${title}</a>
            </h3>
            <div class="blog-card-meta">
              <span><i class="fa-regular fa-calendar"></i> ${date}</span>
              <span><i class="fa-regular fa-clock"></i> ${readTime}</span>
              <span><i class="fa-regular fa-folder"></i> ${category}</span>
            </div>
            <p class="blog-card-excerpt">${excerpt}</p>
            <a href="${postUrl}" class="blog-card-link">
              ${lang === "fa" ? 'مطالعه بیشتر <i class="fa-solid fa-arrow-left"></i>' : 'Read More <i class="fa-solid fa-arrow-right"></i>'}
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

// ========== تشخیص نوع صفحه ==========
function isBlogListingPage() {
  const path = window.location.pathname;
  if (path.match(/\/blog\/?$/)) return true;
  if (path.match(/\/[a-z]{2}\/blog\/?$/)) return true;
  return false;
}

// ========== تنظیم بنر وبلاگ در صفحه اصلی ==========
function setupBlogBanner() {
  const bannerTitle = document.getElementById("blog-banner-title");
  const bannerDesc = document.getElementById("blog-banner-desc");
  const bannerLink = document.getElementById("blog-banner-link");
  const bannerBtnText = document.getElementById("blog-banner-btn-text");
  const bannerIcon = document.getElementById("blog-banner-icon");

  if (!bannerTitle) return;

  const lang = LANG;

  if (lang === "en") {
    bannerTitle.textContent = "Professional Nail Art Blog";
    bannerDesc.textContent =
      "Latest tips, techniques and professional tutorials";
    if (bannerLink) bannerLink.href = "/en/blog/";
    if (bannerBtnText) bannerBtnText.textContent = "Visit Blog";
    if (bannerIcon) bannerIcon.className = "fa-solid fa-arrow-right";
  } else {
    bannerTitle.textContent = "مجله تخصصی کاشت و ژلیش ناخن";
    bannerDesc.textContent = "جدیدترین نکات، تکنیک‌ها و آموزش‌های حرفه‌ای";
    if (bannerLink) bannerLink.href = "/blog/";
    if (bannerBtnText) bannerBtnText.textContent = "ورود به وبلاگ";
    if (bannerIcon) bannerIcon.className = "fa-solid fa-arrow-left";
  }
}

// ========== مقداردهی اولیه ==========
function init() {
  setupBlogBanner();
  if (isBlogListingPage()) {
    renderBlogPosts();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
