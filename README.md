# WORD INVADERS — Neural Vocabulary Strike

Mobil öncelikli, PWA uyumlu, neon bilim kurgu temalı arcade dil öğrenme oyunu.
7 dil (İngilizce, İspanyolca, İtalyanca, Rusça, Portekizce, Fransızca, Almanca),
A1–C1 seviyeleri, her dilde **7.500 kelime** (toplam **52.500**), TTS + konuşma
tanıma (ASR), seriler (7500 ÷ 150 = 50 seri, 0 artan), ısı haritası, mağaza,
günlük görevler, başarılar ve prosedürel sentezlenmiş arka plan müziği.

## Telefona kurulum (PWA)

- **Android / Chrome:** ana ekrandaki **⬇ YÜKLE** butonuna veya tarayıcı menüsünden
  *Ana ekrana ekle* seçeneğine dokun. Oyun tam ekran simge olarak kurulur.
- **iPhone / Safari:** Safari'de **Paylaş (⎙)** → **Ana Ekrana Ekle** → **Ekle**.
- Çevrimdışı çalışır; güncellemeler servis worker ile otomatik alınır.

## Vercel'de yayınlama (önerilen — veritabanı OLMADAN da çalışır)

Uygulama local-first çalışır: veritabanı bağlanmazsa profiller, ilerleme,
mağaza ve seriler cihazda (localStorage) tutulur, sözlük cihazda üretilir.

### GitHub + Vercel (en kolay)

1. Bu klasörü GitHub'a gönder:
   ```bash
   git init
   git add .
   git commit -m "Word Invaders"
   # GitHub'da boş bir depo oluştur, sonra:
   git remote add origin https://github.com/KULLANICI/word-invaders.git
   git branch -M main
   git push -u origin main
   ```
2. <https://vercel.com> → **Add New → Project** → GitHub deposunu içe aktar.
3. Framework otomatik **Next.js** algılanır; build komutu değişmez
   (`next build`).
4. **Deploy**'a bas. Ortam değişkeni zorunlu değildir; ek bir şey yapmadan
   mobilde çalışır.

### Cihazlar arası senkron için veritabanı (isteğe bağlı)

PostgreSQL sağlayıcısı (Neon ücretsiz uygundur) oluştur ve Vercel →
**Settings → Environment Variables** kısmına ekle:

```
DATABASE_URL=postgresql://kullanici:sifre@host/veritabani?sslmode=require
```

Sözlük ilk açılışta otomatik tohumlanır (her dil için 7.500 kayıt).
İstersen elle:

```bash
npm run db:push   # drizzle şemasını uygula
```

## Yerel geliştirme

```bash
npm install
npm run dev          # http://localhost:3000
npx drizzle-kit push # yerel PostgreSQL (opsiyonel)
```

## Komutlar

- `npm run dev` — geliştirme sunucusu
- `npm run build` — üretim derlemesi
- `npm run start` — üretim sunucusu
- `npm run lint` — ESLint
- `npm run db:push` — veritabanı şemasını uygula

## Sesli okuma

Tarayıcının Web Speech API sesleri kullanılır; her dil için en net doğal ses
(Google/Neural/Siri/Microsoft ya da yerel) otomatik seçilir. Mobil tarayıcılar
kullanıcı hareketi istediği için görev, bir dokunma kapısıyla başlar.
