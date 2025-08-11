# Infinite Runner Arcade Game

Modern web teknolojileriyle geliştirilmiş bir sonsuz koşu (infinite runner) oyunu.

## Proje Bilgisi

- Canlı adres: https://hopla-puce.vercel.app/

## Nasıl düzenleyebilirim?

Uygulamayı düzenlemenin birden fazla yolu var.

### Yerel ortamda geliştirme (Önerilen)

Ön koşullar: Node.js ve npm yüklü olmalı — nvm ile kurulum: https://github.com/nvm-sh/nvm#installing-and-updating

Adımlar:

```sh
# 1) Depoyu klonlayın (kendi Git URL'inizi kullanın)
git clone <YOUR_GIT_URL>

# 2) Proje klasörüne girin
cd <YOUR_PROJECT_NAME>

# 3) Bağımlılıkları yükleyin
npm i

# 4) Geliştirme sunucusunu başlatın (hot-reload ile)
npm run dev
```

### GitHub üzerinden dosya düzenleme

- İlgili dosyaya gidin.
- Sağ üstteki "Edit" (kalem) butonuna tıklayın.
- Değişikliklerinizi yapıp commit edin.

### GitHub Codespaces

- Depo ana sayfasında "Code" butonuna tıklayın.
- "Codespaces" sekmesini seçin ve yeni bir Codespace oluşturun.
- Codespace içinde düzenleyip commit/push yapın.

## Kullanılan Teknolojiler

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Komutlar

```sh
# Geliştirme
npm run dev

# Üretim için derleme
npm run build

# Derlenen çıktıyı yerelde ön izleme
npm run preview
```

## Dağıtım (Vercel)

Proje, Vercel üzerinde barındırılabilir.

1) Vercel hesabınızla giriş yapın ve "New Project" deyin.
2) Bu GitHub reposunu içe aktarın.
3) Framework: Vite | Build Command: `npm run build` | Output: `dist`
4) Deploy butonuna tıklayın.

Canlı adres: https://hopla-puce.vercel.app/

## Notlar

- Proje React + Vite + Tailwind CSS yapısı kullanır.
- shadcn-ui bileşenleriyle arayüz oluşturulmuştur.
