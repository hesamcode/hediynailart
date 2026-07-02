# 🎨 هنر ناخن هدیه (hediynailart)

> **وب‌اپلیکیشن تخصصی و کاملاً ریسپانسیو برای رزرو خدمات کاشت، ژلیش و طراحی ناخن در زعفرانیه تهران**

[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=flat&logo=pwa)](https://hediynailart.ir)
[![SEO](https://img.shields.io/badge/SEO-Optimized-brightgreen?style=flat&logo=google)](https://hediynailart.ir)
[![Responsive](https://img.shields.io/badge/Responsive-100%25-blue?style=flat&logo=tailwindcss)](https://hediynailart.ir)
[![Mobile First](https://img.shields.io/badge/Mobile-First-orange?style=flat&logo=mobile)](https://hediynailart.ir)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red?style=flat)](LICENSE)

---

## 📖 درباره پروژه

**هنر ناخن هدیه** یک وب‌اپلیکیشن پیشرفته، **کاملاً ریسپانسیو** و **موبایل‌فرندلی** برای رزرو خدمات تخصصی ناخن در زعفرانیه تهران است. این پروژه با معماری **PWA** (Progressive Web App) طراحی شده و امکان نصب بر روی تمامی دستگاه‌ها را فراهم می‌کند.

### 🎯 هدف پروژه

ارائه یک تجربه کاربری **سریع، زیبا و بدون نقص** در تمامی دستگاه‌ها از موبایل گرفته تا دسکتاپ، با قابلیت رزرو آسان و دسترسی آفلاین.

---

## ✨ ویژگی‌های اصلی

### 📱 **ریسپانسیو و موبایل‌فرندلی**

- ✅ **Mobile-First** طراحی شده از ابتدا برای موبایل
- ✅ کاملاً ریسپانسیو برای تمامی اندازه‌های صفحه (۳۲۰px تا ۱۴۰۰px+)
- ✅ بدون اسکرول افقی در هیچ دستگاهی
- ✅ استفاده از `clamp()` برای فونت‌ها و فاصله‌ها
- ✅ تاچ تارگت‌های ۴۴px برای تعامل آسان

### 🎯 **سیستم رزرو هوشمند**

- انتخاب حداکثر ۳ سرویس (ژلیش، لمینیت، کاشت، ترمیم، مانیکور، پدیکور)
- انتخاب تاریخ (امروز، فردا، یا دلخواه)
- انتخاب ساعت (نزدیک‌ترین زمان یا دلخواه)
- ارسال درخواست به واتساپ با پیام آماده

### 📱 **PWA کامل**

- نصب بر روی Android، iOS و Desktop
- آفلاین با Service Worker پیشرفته
- میانبرهای سریع (رزرو، گالری، وبلاگ، ارتباط)
- قابلیت اشتراک‌گذاری (Share Target)

### 🌙 **تم روشن/تاریک**

- ذخیره‌سازی خودکار در localStorage
- تشخیص تم سیستم
- انیمیشن نرم هنگام تغییر
- پشتیبانی از `color-scheme`

### 🌍 **دو زبانه (فارسی/انگلیسی)**

- پشتیبانی کامل RTL/LTR
- تغییر خودکار فونت (Vazirmatn/Inter)
- hreflang برای سئوی بین‌المللی

### 🖼️ **گالری تعاملی**

- ۱۶ تصویر نمونه کار با کیفیت بالا
- سوایپ لمسی (موبایل) و ماوس (دسکتاپ)
- نمایش دات‌های نشانگر با انیمیشن
- پخش خودکار با توقف در تعامل

### 📝 **وبلاگ تخصصی**

- ۸ مقاله تخصصی (۴ فارسی، ۴ انگلیسی)
- جدول محتوای هوشمند (TOC) با فینگلیش
- محاسبه زمان مطالعه
- اشتراک‌گذاری در شبکه‌های اجتماعی
- لینک‌های داخلی و ناوبری بین مقالات

### 📊 **سئوی کامل**

- Schema.org (BeautySalon, CollectionPage, Article)
- Open Graph کامل برای شبکه‌های اجتماعی
- Twitter Cards
- hreflang برای چندزبانگی
- Sitemap.xml و Robots.txt
- متاتگ‌های استاندارد

---

## 🗂️ ساختار پروژه

```
hediynailart/
├── assets/
│   ├── css/              # فایل‌های استایل (کاملاً ریسپانسیو)
│   │   ├── base.css       # متغیرها، ریست، انیمیشن‌ها
│   │   ├── layout.css     # چیدمان اصلی (responsive)
│   │   ├── components.css # کامپوننت‌ها (responsive)
│   │   ├── footer.css     # فوتر (responsive)
│   │   ├── blog.css       # وبلاگ (responsive)
│   │   ├── post.css       # مقالات (responsive)
│   │   ├── fontawesome/   # FontAwesome
│   │   └── webfonts/      # فونت‌های FontAwesome
│   ├── fonts/             # فونت‌های پروژه
│   │   ├── vazir/         # فونت فارسی (Vazirmatn)
│   │   └── inter/         # فونت انگلیسی (Inter)
│   ├── images/            # تصاویر پروژه (بهینه‌شده)
│   │   ├── gallery/       # گالری (16 تصویر WebP)
│   │   ├── blog/          # تصاویر وبلاگ
│   │   └── favicon-*.png  # آیکون‌های PWA
│   └── js/                # فایل‌های جاوااسکریپت (ماژولار)
│       ├── main.js        # نقطه ورود
│       ├── config.js      # تنظیمات مرکزی
│       ├── state.js       # مدیریت state
│       ├── dom.js         # ارجاع‌های DOM
│       ├── ui.js          # ابزارهای UI (Toast, Scroll)
│       ├── theme.js       # مدیریت تم
│       ├── pwa.js         # PWA و نصب
│       ├── date-utils.js  # توابع تاریخ (دو زبانه)
│       ├── gallery.js     # گالری با سوایپ
│       ├── booking.js     # سیستم رزرو هوشمند
│       ├── blog.js        # مدیریت وبلاگ
│       └── post.js        # امکانات مقالات (TOC, Share)
├── blog/                  # وبلاگ فارسی
│   ├── index.html
│   ├── rahnamaie-kamel-kaasht-e-nakhan/
│   ├── tafavat-gelish-va-kaasht-e-nakhan/
│   ├── moraghebat-haye-baad-az-kaasht-e-nakhan/
│   └── tarandehaye-jadid-tarahi-nakhan-2026/
├── en/                    # نسخه انگلیسی
│   ├── index.html
│   ├── manifest.webmanifest
│   └── blog/
│       ├── index.html
│       ├── complete-guide-to-nail-extension/
│       ├── difference-between-gelish-and-nail-extension/
│       ├── post-nail-extension-care/
│       └── new-nail-design-trends-2026/
├── index.html             # صفحه اصلی
├── manifest.webmanifest   # PWA Manifest
├── sw.js                  # Service Worker (کش ۹۱+ فایل)
├── robots.txt             # راهنمای موتورهای جستجو
├── sitemap.xml            # نقشه سایت (۱۲ URL)
└── README.md              # این فایل
```

---

## 🚀 تکنولوژی‌های استفاده شده

### **فرانت‌اند**

| تکنولوژی              | توضیح                                |
| --------------------- | ------------------------------------ |
| **HTML5**             | ساختار صفحات با Semantic Elements    |
| **CSS3**              | متغیرهای CSS، Grid، Flexbox، clamp() |
| **JavaScript (ES6+)** | معماری ماژولار، Import/Export        |
| **Font Awesome 6**    | آیکون‌های حرفه‌ای                    |
| **Vazirmatn**         | فونت فارسی (وزن‌های مختلف)           |
| **Inter**             | فونت انگلیسی (بهینه‌شده)             |

### **PWA & Performance**

| تکنولوژی             | توضیح                                           |
| -------------------- | ----------------------------------------------- |
| **Service Worker**   | ۴ استراتژی کش (Cache First, Network First, SWR) |
| **Web App Manifest** | نصب کامل با میانبرهای سریع                      |
| **Cache Strategies** | Static, Images, Fonts, Pages                    |
| **Offline Support**  | آفلاین کامل با fallback                         |

### **SEO & Optimization**

| تکنولوژی          | توضیح                                |
| ----------------- | ------------------------------------ |
| **Schema.org**    | BeautySalon, CollectionPage, Article |
| **Open Graph**    | og:title, og:description, og:image   |
| **Twitter Cards** | summary_large_image                  |
| **hreflang**      | پشتیبانی کامل از دو زبان             |
| **Sitemap.xml**   | ۱۲ URL با اولویت‌بندی                |
| **Robots.txt**    | راهنمای خزنده‌ها                     |

---

## 📱 ریسپانسیو و موبایل‌فرندلی

### **بریک‌پوینت‌ها**

| دستگاه          | اندازه          | طراحی               |
| --------------- | --------------- | ------------------- |
| **موبایل**      | ۳۲۰px - ۴۸۰px   | ستون‌های ۱ تایی     |
| **تبلت**        | ۴۸۱px - ۷۶۸px   | ستون‌های ۲ تایی     |
| **دسکتاپ کوچک** | ۷۶۹px - ۱۰۲۴px  | ستون‌های ۳ تایی     |
| **دسکتاپ**      | ۱۰۲۵px - ۱۴۰۰px | حداکثر عرض          |
| **دسکتاپ بزرگ** | ۱۴۰۱px+         | استفاده کامل از فضا |

### **ویژگی‌های ریسپانسیو**

- ✅ همه فونت‌ها با `clamp()` (مقیاس‌پذیر)
- ✅ همه فاصله‌ها با `clamp()`
- ✅ تصاویر با `max-width: 100%` و `aspect-ratio`
- ✅ Grid با `repeat(auto-fit, minmax(...))`
- ✅ تاچ تارگت‌های ۴۴px در موبایل
- ✅ انیمیشن‌های بهینه‌شده برای موبایل
- ✅ پشتیبانی از `prefers-reduced-motion`

---

## 🔧 نصب و راه‌اندازی

### **پیش‌نیازها**

- یک سرور وب (Apache, Nginx, Node.js, Python, etc.)
- مرورگر مدرن (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### **مراحل نصب**

```bash
# ۱. کلون کردن پروژه
git clone https://github.com/hesamcode/hediynailart.git
cd hediynailart

# ۲. اجرای پروژه (بدون وابستگی)

# روش ۱: Live Server (VSCode)
# کلیک راست روی index.html → Open with Live Server

# روش ۲: Python
python3 -m http.server 8000
# سپس مرورگر: http://localhost:8000

# روش ۳: Node.js (serve)
npx serve .
# سپس مرورگر: http://localhost:3000
```

### **ساختار فایل‌های محیطی**

```bash
# پروژه نیازی به فایل .env ندارد
# تمام تنظیمات در assets/js/config.js انجام می‌شود
```

---

## 🌐 مسیرهای سایت

| مسیر               | توضیح                 |
| ------------------ | --------------------- |
| `/`                | صفحه اصلی فارسی       |
| `/en/`             | صفحه اصلی انگلیسی     |
| `/blog/`           | وبلاگ فارسی           |
| `/en/blog/`        | وبلاگ انگلیسی         |
| `/blog/[slug]/`    | مقاله فارسی (فینگلیش) |
| `/en/blog/[slug]/` | مقاله انگلیسی         |

### **مثال URLها**

```
https://hediynailart.ir/
https://hediynailart.ir/en/
https://hediynailart.ir/blog/
https://hediynailart.ir/blog/rahnamaie-kamel-kaasht-e-nakhan/
https://hediynailart.ir/en/blog/complete-guide-to-nail-extension/
```

---

## 📊 سئو و بهینه‌سازی

### **امتیازات Lighthouse**

| معیار              | امتیاز | وضعیت   |
| ------------------ | ------ | ------- |
| **Performance**    | ۹۵+    | 🟢 عالی |
| **Accessibility**  | ۹۸+    | 🟢 عالی |
| **Best Practices** | ۱۰۰    | 🟢 عالی |
| **SEO**            | ۱۰۰    | 🟢 عالی |
| **PWA**            | ۱۰۰    | 🟢 عالی |

### **داده‌های ساختاریافته (Schema.org)**

```json
{
  "@type": "BeautySalon", // صفحه اصلی
  "@type": "CollectionPage", // وبلاگ
  "@type": "Article" // مقالات
}
```

---

## 🤝 مشارکت

با توجه به لایسنس پروژه، مشارکت عمومی پذیرفته نمی‌شود. اما اگر پیشنهادی دارید، می‌توانید از طریق ایمیل با توسعه‌دهنده تماس بگیرید.

---

## 📝 مجوز

```
Copyright (c) 2026 hediynailart (هنر ناخن هدیه)

All rights reserved.

This project and its contents may not be copied, modified, distributed,
or used in any form without explicit permission from the author.

For permission requests, please contact the developer.
```

**کپی‌برداری، توزیع، یا استفاده از این پروژه بدون اجازه کتبی توسعه‌دهنده ممنوع است.**

---

## 👨‍💻 توسعه‌دهنده

**حسام (Hesam)**

- 🌐 [وبسایت شخصی](https://hesamcode.ir/)
- 📧 [ایمیل](mailto:hesam@hesamcode.ir)
- 🐙 [گیت‌هاب](https://github.com/hesamcode)

---

## 🙏 تقدیر و تشکر

- **Font Awesome** - آیکون‌های زیبا و حرفه‌ای
- **Vazirmatn** - فونت فارسی باکیفیت
- **Inter** - فونت انگلیسی بهینه‌شده
- **Google** - ابزارهای سئو و تحلیل

---

## 📞 تماس

- **واتساپ**: [09150667527](https://wa.me/989150667527)
- **اینستاگرام**: [@hediynailart](https://www.instagram.com/hediynailart)
- **لوکیشن**: تهران، زعفرانیه، بلوار بهزادی

---

## 🎯 نقشه راه آینده

- [x] ریسپانسیو کامل (Mobile-First)
- [x] PWA کامل با نصب
- [x] سیستم رزرو هوشمند
- [x] وبلاگ تخصصی با TOC
- [x] دو زبانه (فارسی/انگلیسی)
- [x] تم روشن/تاریک
- [x] گالری تعاملی
- [x] سئوی کامل
- [ ] سیستم نظرات مقالات
- [ ] پنل مدیریت ساده
- [ ] اعلان‌های PWA (Push)
- [ ] گوگل آنالیتیکس
- [ ] فرم تماس پیشرفته

---

## ⭐ حمایت

اگر از این پروژه خوشتان آمد، به آن **⭐ ستاره** دهید و با دیگران به اشتراک بگذارید!

---

**ساخته شده با ❤️ توسط حسام**

**هنر ناخن هدیه** - جایی که زیبایی با هنر و تخصص ترکیب می‌شود.
