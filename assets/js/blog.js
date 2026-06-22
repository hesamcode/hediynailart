// blog.js
// ============================================================
// وبلاگ دو زبانه - مدیریت و نمایش مقالات (فارسی/انگلیسی)
// ============================================================

import { LANG, getUIText } from "./config.js";

// ========== دیتابیس مقالات دو زبانه ==========
const POSTS_DB = [
  {
    ids: {
      fa: "راهنمای-کامل-کاشت-ناخن",
      en: "complete-guide-to-nail-extension",
    },
    dateGregorian: "2026-02-14",
    datePersian: "۱۴۰۴/۱۱/۲۵",
    image: "/assets/images/blog/post-1.jpg",
    order: 1,
    fa: {
      title: "راهنمای کامل کاشت ناخن: از صفر تا صد",
      excerpt:
        "همه چیز درباره کاشت ناخن، انواع روش‌ها، مزایا و معایب هر کدام. راهنمای جامع برای شروع کار حرفه‌ای.",
      category: "کاشت ناخن",
      readTime: "۵ دقیقه",
      tags: ["کاشت ناخن", "آموزش", "مبتدیان"],
      nextPost: "تفاوت-ژلیش-و-کاشت-ناخن",
    },
    en: {
      title: "Complete Guide to Nail Extension: From Zero to Hero",
      excerpt:
        "Everything about nail extension, different methods, pros and cons. A comprehensive guide for beginners and professionals.",
      category: "Nail Extension",
      readTime: "6 min",
      tags: ["Nail Extension", "Tutorial", "Beginners"],
      nextPost: "difference-between-gelish-and-nail-extension",
    },
  },
  {
    ids: {
      fa: "تفاوت-ژلیش-و-کاشت-ناخن",
      en: "difference-between-gelish-and-nail-extension",
    },
    dateGregorian: "2026-03-30",
    datePersian: "۱۴۰۵/۰۱/۱۰",
    image: "/assets/images/blog/post-2.jpg",
    order: 2,
    fa: {
      title: "تفاوت ژلیش و کاشت ناخن چیست؟",
      excerpt:
        "بررسی کامل تفاوت‌های ژلیش و کاشت، مزایا و معایب هر روش و راهنمای انتخاب روش مناسب برای شما.",
      category: "ژلیش",
      readTime: "۴ دقیقه",
      tags: ["ژلیش", "مقایسه", "انتخاب روش"],
      prevPost: "راهنمای-کامل-کاشت-ناخن",
      nextPost: "مراقبت-های-بعد-از-کاشت-ناخن",
    },
    en: {
      title: "Difference Between Gelish and Nail Extension",
      excerpt:
        "Complete comparison between gelish and nail extension, pros and cons, and how to choose the right method for you.",
      category: "Gelish",
      readTime: "4 min",
      tags: ["Gelish", "Comparison", "Method Choice"],
      prevPost: "complete-guide-to-nail-extension",
      nextPost: "post-nail-extension-care",
    },
  },
  {
    ids: {
      fa: "مراقبت-های-بعد-از-کاشت-ناخن",
      en: "post-nail-extension-care",
    },
    dateGregorian: "2026-05-05",
    datePersian: "۱۴۰۵/۰۲/۱۵",
    image: "/assets/images/blog/post-3.jpg",
    order: 3,
    fa: {
      title: "مراقبت‌های بعد از کاشت ناخن",
      excerpt:
        "نکات طلایی برای افزایش ماندگاری کاشت ناخن و حفظ سلامت ناخن‌های طبیعی. ۱۰ نکته مهم که باید بدانید.",
      category: "مراقبت",
      readTime: "۶ دقیقه",
      tags: ["مراقبت", "بهداشت", "ماندگاری"],
      prevPost: "تفاوت-ژلیش-و-کاشت-ناخن",
    },
    en: {
      title: "Post-Nail Extension Care",
      excerpt:
        "Golden tips for increasing nail extension longevity and maintaining natural nail health. 10 important tips you should know.",
      category: "Care",
      readTime: "5 min",
      tags: ["Care", "Hygiene", "Longevity"],
      prevPost: "difference-between-gelish-and-nail-extension",
    },
  },
  {
    ids: {
      fa: "ترندهای-جدید-طراحی-ناخن-۲۰۲۶",
      en: "new-nail-design-trends-2026",
    },
    dateGregorian: "2026-05-31",
    datePersian: "۱۴۰۵/۰۳/۱۰",
    image: "/assets/images/blog/post-4.jpg",
    order: 4,
    fa: {
      title: "ترندهای جدید طراحی ناخن در سال ۲۰۲۶",
      excerpt:
        "معرفی جدیدترین و محبوب‌ترین استایل‌های طراحی ناخن، رنگ‌های ترند و تکنیک‌های مدرن.",
      category: "طراحی",
      readTime: "۴ دقیقه",
      tags: ["طراحی", "ترند", "مد ۲۰۲۴"],
    },
    en: {
      title: "New Nail Design Trends in 2026",
      excerpt:
        "Introducing the latest and most popular nail design styles, trendy colors and modern techniques.",
      category: "Design",
      readTime: "4 min",
      tags: ["Design", "Trends", "2026 Fashion"],
    },
  },
];

// ========== ابزارهای کمکی (استفاده از LANG از config) ==========

// دریافت مسیر پایه بر اساس زبان
function getBasePath(lang) {
  return lang === "fa" ? "/fa/blog/" : "/en/blog/";
}

// دریافت مقاله با استفاده از id و زبان
function getPostById(postId, lang) {
  return POSTS_DB.find((post) => post.ids[lang] === postId);
}

// دریافت همه مقالات مرتب شده (جدیدترین اول)
function getAllPostsSorted(lang) {
  return [...POSTS_DB].sort((a, b) => a.order - b.order);
}

// دریافت متن محلی‌شده از مقاله
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

// فرمت تاریخ بر اساس زبان
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

// دریافت URL مقاله
function getPostUrl(post, lang) {
  return `${getBasePath(lang)}${post.ids[lang]}/`;
}

// ========== رندر صفحه اصلی وبلاگ (لیست مقالات) ==========

function renderBlogPosts() {
  const grid = document.getElementById("blog-grid");
  if (!grid) return;

  const lang = LANG;
  const postsCount = document.getElementById("posts-count");
  const sortedPosts = getAllPostsSorted(lang);

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
          post.image
            ? `
          <div class="blog-card-image">
            <img src="${post.image}" alt="${title}" loading="lazy">
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

// ========== بارگذاری محتوای مقاله ==========

async function loadArticleContent(postId, lang) {
  try {
    const response = await fetch(`/${lang}/blog/${postId}/content.html`);
    if (response.ok) {
      return await response.text();
    }
  } catch (e) {
    // فایل محتوا وجود ندارد
  }
  return null;
}

// ========== تنظیم متاتگ‌های صفحه مقاله ==========

function setupArticleMeta(post, lang) {
  const title = getLocalizedText(post, "title", lang);
  const excerpt = getLocalizedText(post, "excerpt", lang);

  document.title = `${title} | hediynailart`;

  // متاتگ description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", excerpt);
  } else {
    metaDesc = document.createElement("meta");
    metaDesc.name = "description";
    metaDesc.content = excerpt;
    document.head.appendChild(metaDesc);
  }

  // Open Graph
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute("content", title);
  } else {
    ogTitle = document.createElement("meta");
    ogTitle.setAttribute("property", "og:title");
    ogTitle.content = title;
    document.head.appendChild(ogTitle);
  }

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    ogDesc.setAttribute("content", excerpt);
  } else {
    ogDesc = document.createElement("meta");
    ogDesc.setAttribute("property", "og:description");
    ogDesc.content = excerpt;
    document.head.appendChild(ogDesc);
  }

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.setAttribute(
      "content",
      `https://hediynailart.ir/${lang}/blog/${post.ids[lang]}/`,
    );
  }

  // Canonical link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute(
      "href",
      `https://hediynailart.ir/${lang}/blog/${post.ids[lang]}/`,
    );
  } else {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = `https://hediynailart.ir/${lang}/blog/${post.ids[lang]}/`;
    document.head.appendChild(canonical);
  }

  // hreflang links
  updateHreflangLinks(post, lang);
}

// به‌روزرسانی لینک‌های hreflang برای سئو
function updateHreflangLinks(post, currentLang) {
  const oldLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
  oldLinks.forEach((link) => link.remove());

  const languages = ["fa", "en"];
  languages.forEach((lang) => {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = lang;
    link.href = `https://hediynailart.ir/${lang}/blog/${post.ids[lang]}/`;
    document.head.appendChild(link);
  });

  const xDefault = document.createElement("link");
  xDefault.rel = "alternate";
  xDefault.hreflang = "x-default";
  xDefault.href = `https://hediynailart.ir/${currentLang}/blog/${post.ids[currentLang]}/`;
  document.head.appendChild(xDefault);
}

// ========== رندر صفحه مقاله ==========

async function renderArticlePage(postId) {
  const lang = LANG;
  const post = getPostById(postId, lang);

  if (!post) {
    window.location.href = getBasePath(lang);
    return;
  }

  const title = getLocalizedText(post, "title", lang);
  const excerpt = getLocalizedText(post, "excerpt", lang);
  const category = getLocalizedText(post, "category", lang);
  const readTime = getLocalizedText(post, "readTime", lang);
  const date = formatDate(post, lang);
  const tags = post[lang]?.tags || [];

  setupArticleMeta(post, lang);

  const allPosts = getAllPostsSorted(lang);
  const currentIndex = allPosts.findIndex((p) => p.ids[lang] === postId);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const mainContent = document.querySelector(".page-main .stack");
  if (mainContent && !document.querySelector(".post-article")) {
    mainContent.innerHTML = `
      <a href="${getBasePath(lang)}" class="article-back-link">
        <i class="fa-solid ${lang === "fa" ? "fa-arrow-right" : "fa-arrow-left"}"></i> 
        ${lang === "fa" ? "بازگشت به لیست مقالات" : "Back to Blog"}
      </a>
      
      <article class="panel post-article">
        <header class="post-header">
          <h1 class="post-title">${escapeHtml(title)}</h1>
          <div class="post-meta">
            <span class="post-meta-item"><i class="fa-regular fa-calendar"></i> ${date}</span>
            <span class="post-meta-item reading-time"><i class="fa-regular fa-clock"></i> ${readTime}</span>
            <span class="post-meta-item"><i class="fa-regular fa-folder"></i> ${category}</span>
          </div>
        </header>
        
        ${
          post.image
            ? `
          <div class="post-featured-image">
            <img src="${post.image}" alt="${escapeHtml(title)}" loading="lazy">
          </div>
        `
            : ""
        }
        
        <div class="post-content" id="post-content">
          <div class="loading-spinner">
            <i class="fa-solid fa-spinner fa-spin"></i> 
            ${lang === "fa" ? "در حال بارگذاری..." : "Loading..."}
          </div>
        </div>
        
        <div class="post-tags">
          ${tags.map((tag) => `<span class="post-tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
        
        <div class="post-author">
          <img src="/assets/images/nail-logo.png" alt="hediynailart" class="post-author-avatar">
          <div class="post-author-info">
            <h4>hediynailart</h4>
            <p>${
              lang === "fa"
                ? "تخصص در کاشت، ژلیش و طراحی ناخن در زعفرانیه تهران | ۵ سال سابقه حرفه‌ای"
                : "Expert in nail extension, gelish, and nail design | 5 years of professional experience"
            }</p>
          </div>
        </div>
        
        <div class="post-share"></div>
        
        <div class="post-navigation">
          ${
            prevPost
              ? `
            <a href="${getPostUrl(prevPost, lang)}" class="post-nav-prev">
              <div class="post-nav-label">${lang === "fa" ? "قبلی" : "Previous"}</div>
              <div class="post-nav-title">${escapeHtml(getLocalizedText(prevPost, "title", lang))}</div>
            </a>
          `
              : '<div class="post-nav-prev" style="visibility: hidden;"></div>'
          }
          
          ${
            nextPost
              ? `
            <a href="${getPostUrl(nextPost, lang)}" class="post-nav-next">
              <div class="post-nav-label">${lang === "fa" ? "بعدی" : "Next"}</div>
              <div class="post-nav-title">${escapeHtml(getLocalizedText(nextPost, "title", lang))}</div>
            </a>
          `
              : ""
          }
        </div>
      </article>
    `;

    const content = await loadArticleContent(post.ids[lang], lang);
    const contentDiv = document.getElementById("post-content");

    if (contentDiv) {
      if (content) {
        contentDiv.innerHTML = content;
      } else {
        contentDiv.innerHTML = getDefaultContent(post, lang);
      }
    }
  }
}

// محتوای پیش‌فرض برای دمو
function getDefaultContent(post, lang) {
  const title = getLocalizedText(post, "title", lang);

  if (lang === "fa") {
    return `
      <h2>معرفی ${title}</h2>
      <p>این مقاله به صورت کامل به موضوع ${title} می‌پردازد.</p>
      <p>برای مطالعه نسخه کامل این مقاله، لطفاً با ما در تماس باشید یا به‌زودی مراجعه کنید.</p>
      <h3>نکات کلیدی:</h3>
      <ul>
        <li>نکته اول مهم درباره این موضوع</li>
        <li>نکته دوم که باید بدانید</li>
        <li>نکته سوم برای نتیجه بهتر</li>
      </ul>
      <div class="info-box">
        <div class="info-box-title">
          <i class="fa-solid fa-circle-info"></i>
          اطلاعات بیشتر
        </div>
        <p>برای رزرو وقت و مشاوره رایگان، از طریق واتساپ با ما در ارتباط باشید.</p>
      </div>
      <blockquote>
        <p>هدی‌نیل‌آرت - بهترین کیفیت و آرامش در زعفرانیه تهران</p>
      </blockquote>
    `;
  }

  return `
    <h2>Introduction to ${title}</h2>
    <p>This article fully covers ${title}.</p>
    <p>For the complete version of this article, please contact us or check back soon.</p>
    <h3>Key Points:</h3>
    <ul>
      <li>First important point about this topic</li>
      <li>Second thing you should know</li>
      <li>Third tip for better results</li>
    </ul>
    <div class="info-box">
      <div class="info-box-title">
        <i class="fa-solid fa-circle-info"></i>
        More Information
      </div>
      <p>For booking and free consultation, contact us via WhatsApp.</p>
    </div>
    <blockquote>
      <p>hediynailart - Best quality and tranquility in Zafaraniyeh, Tehran</p>
    </blockquote>
  `;
}

// ========== ابزار امنیت (escape HTML) ==========

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ========== تشخیص نوع صفحه ==========

function isBlogListingPage() {
  const path = window.location.pathname;
  if (path.match(/\/blog\/?$/)) return true;
  if (path.match(/\/[a-z]{2}\/blog\/?$/)) return true;
  return false;
}

function getPostIdFromPath() {
  const path = window.location.pathname;
  const match = path.match(/\/(fa|en)\/blog\/([^\/]+)\/?$/);
  if (match && match[2]) {
    return match[2];
  }
  return null;
}

// تنظیم بنر وبلاگ در صفحه اصلی سایت
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
    if (bannerLink) bannerLink.href = "/fa/blog/";
    if (bannerBtnText) bannerBtnText.textContent = "ورود به وبلاگ";
    if (bannerIcon) bannerIcon.className = "fa-solid fa-arrow-left";
  }
}

// ========== مقداردهی اولیه ==========

async function init() {
  setupBlogBanner();

  if (isBlogListingPage()) {
    renderBlogPosts();
  } else {
    const postId = getPostIdFromPath();
    if (postId) {
      await renderArticlePage(postId);
    } else {
      const lang = LANG;
      window.location.href = getBasePath(lang);
    }
  }
}

// شروع
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
