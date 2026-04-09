# DocFlow Tests

## Test turlari

| Tur | Joy | Maqsad | Misol |
|---|---|---|---|
| **Unit** | `src/**/*.spec.ts` | Bitta funksiya/class | `document-number-generator.spec.ts` |
| **Integration** | `test/integration/*.spec.ts` | Bir necha modul birga | `document-create.spec.ts` |
| **API** | `test/api/*.api.spec.ts` | Real HTTP — production server | `auth.api.spec.ts` |
| **E2E** | `test/e2e/*.e2e-spec.ts` | To'liq foydalanuvchi flow | `document-workflow.e2e-spec.ts` |
| **Smoke** | `test/smoke/*.spec.ts` | Tezkor — barcha asosiy endpointlar 200 qaytarayaptimi | `smoke.spec.ts` |

## Run

```bash
npm test                  # Hammasi
npm run test:unit         # Faqat unit (tez)
npm run test:api          # API testlari (real server kerak)
npm run test:e2e          # E2E (real server kerak)
npm run test:cov          # Coverage report
```

## Konfiguratsiya

Test config: `jest.config.js`
Helper'lar: `test/helpers/*.ts`

## Environment

API/E2E testlar uchun:
```bash
export TEST_API_URL=https://api.docverse.uz/api/v1
export TEST_USERNAME=superadmin
export TEST_PASSWORD=12345678
```

Aks holda default qiymatlar ishlatiladi.
