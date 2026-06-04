# Commandes de configuration base de données

## 1. Installer pgvector sur PostgreSQL local

### Linux / macOS (Homebrew)
```bash
# Ubuntu / Debian
sudo apt install postgresql-16-pgvector

# macOS (Homebrew)
brew install pgvector
```

### Windows
```powershell
# Via pgvector release GitHub ou via Docker (recommandé)
docker pull pgvector/pgvector:pg16
```

---

## 2. Créer la base de données dagan_ia

```bash
# Se connecter à PostgreSQL en tant que superutilisateur
psql -U postgres

# Dans le shell psql :
CREATE DATABASE dagan_ia;
\c dagan_ia
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

### Ou en one-liner :
```bash
psql -U postgres -c "CREATE DATABASE dagan_ia;"
psql -U postgres -d dagan_ia -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

---

## 3. Configurer .env.local

```bash
cp .env.example .env.local
# Éditer .env.local et renseigner :
# DATABASE_URL="postgresql://postgres:motdepasse@localhost:5432/dagan_ia"
```

---

## 4. Générer le client Prisma

```bash
npx prisma generate
```

---

## 5. Exécuter la migration initiale

```bash
npx prisma migrate dev --name init
```

---

## 6. Vérifier le schéma (optionnel)

```bash
npx prisma db push --preview-feature
# ou ouvrir Prisma Studio :
npx prisma studio
```

---

## 7. Lancer le seed de données de test

Ajouter dans `package.json` :
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Puis :
```bash
npm install -D ts-node
npx prisma db seed
```

---

## Vérification finale

```bash
psql -U postgres -d dagan_ia -c "SELECT COUNT(*) FROM \"Document\";"
psql -U postgres -d dagan_ia -c "SELECT COUNT(*) FROM \"Chunk\";"
```

Résultat attendu : 2 documents | 6 chunks
