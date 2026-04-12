# Archived manual SQL migrations

**Status:** ⚠️ ARCHIVED — do not apply these files directly anymore.

Bu fayllar ilgari schema drift sababli yaratilgan manual SQL migration'lar
edi. Hozir ular **Prisma migration**'iga konsolidatsiya qilindi:

- `prisma/migrations/20260412120000_consolidate_manual_migrations/migration.sql`

Yangi deployment'larga `prisma migrate deploy` avtomatik qo'llaydi — qo'lda
`psql -f` ishga tushirish kerak emas.

## Mavjud serverlar uchun

Agar siz allaqachon bu SQL'larni qo'lda qo'llagan bo'lsangiz (prod, sandbox),
yangi consolidated migration'ni **qayta qo'llash kerak emas** —
`IF NOT EXISTS` bilan idempotent bo'lsa ham, drift detection'ni oldini olish
uchun mavjud serverlarda quyidagi buyruqni ishga tushiring:

```bash
npx prisma migrate resolve --config prisma/prisma.config.ts \
  --applied 20260412120000_consolidate_manual_migrations
```

Bu `_prisma_migrations` jadvaliga yozuv qo'shadi va qayta ishlash'ni to'xtatadi.

## Saqlanayotgan fayllar

- `chat.sql` — chat system (tables + enums)
- `chat-phase3.sql` — group visibility, forward attribution, user_block
- `document-sequence.sql` — atomic counter for document numbers
- `performance-indexes.sql` — performance indexes

Ularning kontenti `consolidate_manual_migrations/migration.sql` ga ko'chirildi.
Bu yerda tarixiy ma'lumot sifatida saqlanadi — o'chirilishi mumkin.
