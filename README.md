# Word Invaders 🛸

Neon bilim kurgu temalı, mobil öncelikli PWA dil öğrenme oyunu.
7 dil × 7.500 kelime = 52.500 sözlük kaydı · A1–C1 · TTS + konuşma tanıma.

## Vercel'de Yayınlama (adım adım)

1. **GitHub'a it:**
   ```bash
   git init && git add -A && git commit -m "Word Invaders"
   git remote add origin https://github.com/KULLANICI/word-invaders.git
   git push -u origin main
   ```

2. **Postgres oluştur** (ücretsiz): [Neon](https://neon.tech) veya Vercel Marketplace → Neon.
   Bağlantı adresini kopyala — `?sslmode=require` ile bitmeli.

3. **Şemayı buluta bas** (bir kere, yerelden):
   ```bash
   DATABASE_URL="postgresql://...sslmode=require" npx drizzle-kit push --config=drizzle-cloud.config.ts
   ```

4. **Vercel'e içe aktar:** vercel.com → Add New → Project → GitHub reposunu seç.
   - Environment Variables: `DATABASE_URL` = Neon bağlantı adresi
   - Deploy'a bas. Başka ayar gerekmez (Next.js otomatik algılanır).

5. **İlk açılış:** İlk istek 52.500 kelimeyi otomatik tohumlar (idempotent,
   yarıda kesilirse sonraki istekte devam eder; rotalarda `maxDuration = 60`).

## Telefona Yükleme (PWA)

- **Android / Chrome:** Ana ekrandaki **TELEFONA YÜKLE** düğmesine bas → Yükle.
- **iPhone / Safari:** Düğme sana 3 adımlı yönergeyi gösterir
  (Paylaş → Ana Ekrana Ekle → Ekle).
- Uygulama tam ekran açılır, çevrimdışı önbelleğe sahiptir ve kendi simgesiyle kurulur.

## Yerel Geliştirme

```bash
npm install
# .env içine: DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
npx drizzle-kit push
npm run dev
```

## Teknik Notlar

- **DB bağlantısı tembel:** `DATABASE_URL` olmadan build çökmez (Vercel build'i
  route modüllerini içe aktarır; havuz yalnızca ilk sorguda kurulur).
- **SSL otomatik:** Neon/Supabase/Vercel Postgres adresleri algılanır ve TLS açılır.
- **Service worker:** sayfalar + `/_next` her zaman ağ öncelikli; eski önbellek
  her açılışta temizlenir — bayat CSS/JS imkânsız.
- **Ses:** Web Speech API — her dil için en net yerel ses otomatik seçilir
  (natural/neural/enhanced öncelikli).
