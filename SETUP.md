# Commande de création du projet Next.js 14

```bash
npx create-next-app@14.2.0 . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

Puis installer les dépendances supplémentaires :

```bash
npm install @prisma/client@^5.15.0 clsx@^2.1.0 tailwind-merge@^2.3.0
npm install -D prisma@^5.15.0
npx prisma init
```
