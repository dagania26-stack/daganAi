# Dagan IA — Grande Sœur Numérique

> Assistant IA spécialisé en droit des affaires, fiscalité et financement pour les femmes entrepreneures du Togo et du Bénin.

---

## Présentation

**Dagan IA** est une application web d'intelligence artificielle conçue pour accompagner les femmes entrepreneures d'Afrique de l'Ouest francophone dans leurs démarches administratives, juridiques et financières.

Le nom **Dagan** s'inspire de la figure de la femme forte et protectrice dans la tradition ouest-africaine — celle qui guide, soutient et ouvre les portes. Dagan IA joue ce rôle à l'ère numérique : une grande sœur disponible 24h/24, gratuite, sans rendez-vous.

---

## Mission

Démocratiser l'accès à l'information juridique, fiscale et financière pour les femmes qui créent et développent leur activité au Togo et au Bénin.

Dagan IA répond aux questions des entrepreneures en français courant, avec des informations vérifiées et adaptées au contexte local (droit OHADA, OTR, UEMOA), sans jargon inaccessible et sans frais.

---

## Objectifs

- **Simplifier la création d'entreprise** — guider pas à pas dans les procédures RCCM, les formes juridiques (SARL, SA, SAS, GIE) et les obligations légales OHADA
- **Clarifier la fiscalité** — expliquer la TPU, la TVA, la patente, les délais de déclaration et les obligations auprès de l'OTR
- **Ouvrir l'accès au financement** — informer sur les fonds disponibles (FAIEJ, microfinance, subventions PME féminines, crédits bancaires)
- **Être disponible à tout moment** — une conseillère virtuelle accessible depuis un smartphone, sans inscription requise
- **Réduire les inégalités d'information** — mettre à égalité les femmes entrepreneures face aux ressources habituellement réservées aux grandes entreprises

---

## Domaines couverts

| Domaine | Contenu |
|---|---|
| **Droit des affaires OHADA** | Création d'entreprise, RCCM, formes juridiques, obligations légales, dissolution |
| **Fiscalité OTR / DGI** | TPU, TVA, impôts sur les bénéfices, déclarations, patente, NIF |
| **Accès au financement** | Microfinance, fonds d'investissement, subventions, garanties bancaires |

---

## Fonctionnalités

- Chat IA conversationnel en français
- Réponses basées sur une base documentaire vérifiée (système RAG)
- Sources citées à chaque réponse
- Fallback intelligent entre plusieurs fournisseurs IA (Claude / GPT-4o-mini)
- Interface responsive — smartphone, tablette, ordinateur
- Application web progressive (PWA) installable sur mobile
- Disponible 24h/24, 7j/7, gratuitement

---

## Stack technique

- **Frontend** — Next.js 14, React 18, TypeScript, Tailwind CSS
- **IA** — Anthropic Claude (primaire), OpenAI GPT-4o-mini (fallback)
- **RAG** — Service Python FastAPI + embeddings vectoriels (pgvector)
- **Base de données** — PostgreSQL via Supabase + Prisma ORM
- **Sécurité** — Rate limiting, CSP, HSTS, validation des entrées

---

## Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/dagania26-stack/daganAi.git
cd daganAi

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Renseigner ANTHROPIC_API_KEY, DATABASE_URL, etc.

# Lancer en développement
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

---

## Variables d'environnement

```env
DATABASE_URL=          # URL PostgreSQL (pooler)
DIRECT_URL=            # URL PostgreSQL (migrations)
ANTHROPIC_API_KEY=     # Clé API Anthropic (Claude)
OPENAI_API_KEY=        # Clé API OpenAI (fallback)
RAG_SERVICE_URL=       # URL du service RAG Python
NEXT_PUBLIC_APP_NAME=  # Dagan IA
```

---

## Promotrice du projet

**Mme Rahimat ALBARKA**

Porteuse du projet Dagan IA, Mme Rahimat ALBARKA est à l'initiative de cette solution numérique conçue pour lever les barrières d'accès à l'information pour les femmes entrepreneures d'Afrique de l'Ouest francophone.

---

## Appui institutionnel

Ce projet a été développé avec l'appui du programme **D-CLIC** de l'**Organisation Internationale de la Francophonie (OIF)**.

D-CLIC (Développement, Compétences, Leadership, Innovation, Créativité) est un programme de l'OIF qui accompagne les jeunes francophones dans le développement de projets numériques à impact social.

---

## Valeurs

- **Fiabilité** — Informations vérifiées, sources citées, recommandation de professionnels pour les cas complexes
- **Inclusion** — Langage accessible, adapté à toutes les niveaux d'études
- **Confidentialité** — Aucune donnée personnelle revendue ni partagée
- **Ancrage local** — Droit togolais et béninois, vocabulaire FCFA / UEMOA / OHADA

---

## Licence

Projet propriétaire — tous droits réservés.  
&copy; 2026 Dagan IA / Rahimat ALBARKA

---

*Dagan IA — Parce que chaque femme mérite une grande sœur numérique.*
