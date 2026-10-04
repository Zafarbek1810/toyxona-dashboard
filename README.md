# To'yxona dashboard

Sotuvchi va admin kabineti. Sayt va backenddan alohida loyiha: keyinroq o'z GitHub reposiga yuklab, `admin.sitename.uz` kabi subdomainga qo'yiladi.

## Ishga tushirish

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Lokal manzil: http://localhost:5174

Backend `http://127.0.0.1:5050` da turishi kerak. `VITE_API_URL` bo'sh bo'lsa, `/api` shu yerga proksi qilinadi.

## Server

- `pnpm build` natijasi `dist/`
- Subdomainni o'zingiz serverda shu papkaga yo'naltirasiz
- `.env` da `VITE_STORE_URL` ni sayt manziliga qo'ying (`https://sitename.uz`)
- API boshqa hostda bo'lsa `VITE_API_URL=https://api.sitename.uz/api`
- Backend `CORS_ORIGIN` ga dashboard manzilini qo'shing
