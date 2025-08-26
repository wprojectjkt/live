# WProject Live Stream

Website streaming live untuk WProject dengan fitur:

## Fitur Website
- Video player dengan kontrol lengkap (play/pause, volume, fullscreen)
- Chat real-time untuk interaksi viewer
- Informasi stream dan statistik viewer
- Desain responsif untuk desktop dan mobile
- Tema dark dengan gradient purple yang menarik

## Teknologi
- React.js dengan Vite
- Tailwind CSS untuk styling
- Shadcn/UI untuk komponen UI
- Lucide React untuk ikon

## Deployment
Website ini di-deploy menggunakan GitHub Pages dengan custom domain `www.wproject.web.id`

## Integrasi
- Stream video dari server `stream.wproject.web.id`
- Bot Telegram untuk manajemen token di `bot.wproject.web.id`
- Sistem autentikasi berbasis token untuk akses terbatas

## Cara Penggunaan
1. Akses website melalui `www.wproject.web.id`
2. Masukkan token yang diberikan oleh admin melalui bot Telegram
3. Nikmati live stream dengan fitur chat interaktif

## Konfigurasi DNS
Pastikan DNS untuk `www.wproject.web.id` sudah mengarah ke GitHub Pages:
```
CNAME www.wproject.web.id -> username.github.io
```

## Pengembangan Lokal
```bash
npm install
npm run dev
```

## Build Production
```bash
npm run build
```

