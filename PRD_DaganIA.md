# PRD — Dagan IA : Grande Sœur Numérique
> **Version** 1.0 · **Statut** : Prêt pour développement · **Date** : Juin 2025
> **Porteure** : Rahi, Fondatrice & CEO · Programme D-CLIC / CUBE / OIF, Lomé, Togo

---

## 🎯 Ce que tu vas construire

Un assistant conversationnel IA appelé **Dagan IA**, destiné aux femmes entrepreneures du Togo et du Bénin. L'utilisatrice pose une question en français sur la fiscalité togolaise ou la création d'entreprise OHADA, et reçoit une réponse fiable, sourcée, en moins de 10 secondes, depuis son smartphone.

**La technologie centrale est le RAG** (Retrieval-Augmented Generation) : avant de répondre, le système cherche les passages pertinents dans une base documentaire locale (textes OHADA, guides OTR, procédures CFE), puis génère une réponse contextualisée à partir de ces sources. Cela garantit des réponses précises sur des sujets très spécifiques qu'un LLM généraliste ne maîtrise pas.

---

## 📐 Stack technique — NON NÉGOCIABLE

```
Frontend    : Next.js 14 (App Router) + TypeScript
Styling     : Tailwind CSS
Backend     : Next.js API Routes (full-stack, un seul repo)
ORM         : Prisma ORM
Base de données : PostgreSQL + extension pgvector
Pipeline RAG : Python microservice — FastAPI + LangChain
Embeddings  : OpenAI API (text-embedding-3-small, 1 536 dimensions)
LLM         : Mistral Large via API (fallback : Claude Haiku)
Déploiement : Vercel (Next.js) + Railway (Python + PostgreSQL)
```

---

## 🏗️ Architecture globale

```
┌─────────────────────────────────────────────────────────┐
│                    UTILISATRICE                          │
│              (smartphone, PWA, 3G/4G)                   │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / SSE streaming
┌────────────────────────▼────────────────────────────────┐
│              NEXT.JS 14 — Vercel                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  /app                                           │    │
│  │    page.tsx          → Interface chat PWA       │    │
│  │    layout.tsx        → Shell, fonts, meta       │    │
│  │  /app/api                                       │    │
│  │    /chat/route.ts    → Proxy vers Python RAG    │    │
│  │    /health/route.ts  → Healthcheck              │    │
│  └─────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP REST (JSON)
┌────────────────────────▼────────────────────────────────┐
│         PYTHON MICROSERVICE — Railway                    │
│  FastAPI + LangChain                                     │
│  POST /query                                             │
│    1. Embed la question (OpenAI)                        │
│    2. Similarity search pgvector (top 5 chunks)         │
│    3. Build prompt (contexte + question)                 │
│    4. Call LLM Mistral (stream)                          │
│    5. Return streamed response + sources                 │
└────────────────────────┬────────────────────────────────┘
                         │ Prisma / psql
┌────────────────────────▼────────────────────────────────┐
│         POSTGRESQL + pgvector — Railway                  │
│  Tables : Document, Chunk, Conversation, Message,        │
│           MessageChunk                                   │
│  Index  : HNSW sur Chunk.embedding (cosine similarity)  │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Schéma base de données — Prisma complet

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

model Document {
  id          String   @id @default(cuid())
  titre       String
  domaine     String   // "OHADA" | "OTR" | "FINANCEMENT" | "ANPE"
  sousDomaine String?  // ex: "AUSC", "TVA", "CFE"
  source      String   // URL ou référence officielle
  version     String   @default("1.0")
  actif       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  chunks      Chunk[]

  @@index([domaine])
  @@index([actif])
}

model Chunk {
  id         String                      @id @default(cuid())
  contenu    String
  embedding  Unsupported("vector(1536)")
  position   Int
  tokenCount Int                         @default(0)
  documentId String
  document   Document                    @relation(fields: [documentId], references: [id], onDelete: Cascade)
  messages   MessageChunk[]
  createdAt  DateTime                    @default(now())

  @@index([documentId])
}

model Conversation {
  id        String    @id @default(uuid())
  langue    String    @default("fr")
  domaine   String?
  userAgent String?   // pour analytics device
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  messages  Message[]

  @@index([createdAt])
}

model Message {
  id             String         @id @default(cuid())
  question       String
  reponse        String
  scoreRAG       Float?         // score de pertinence moyen des chunks utilisés
  latenceMs      Int?           // temps de réponse mesuré
  conversationId String
  conversation   Conversation   @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  chunks         MessageChunk[]
  createdAt      DateTime       @default(now())

  @@index([conversationId])
  @@index([createdAt])
}

model MessageChunk {
  messageId   String
  chunkId     String
  scoreCosin  Float   // score de similarité cosinus
  message     Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  chunk       Chunk   @relation(fields: [chunkId], references: [id], onDelete: Cascade)

  @@id([messageId, chunkId])
}
```

---

## 📁 Structure du projet — arborescence complète

```
dagan-ia/
├── README.md
├── .env.local                    # Variables d'environnement (ne pas commiter)
├── .env.example                  # Template des variables
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                   # Script de peuplement initial de la base
│
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service Worker
│   ├── icons/                    # Icônes PWA (192x192, 512x512)
│   └── fonts/                    # (si fonts locales)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout — fonts, meta, PWA
│   │   ├── page.tsx              # Page principale — interface chat
│   │   ├── globals.css           # Design tokens + Tailwind base
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts      # POST /api/chat → proxy RAG + log DB
│   │       └── health/
│   │           └── route.ts      # GET /api/health
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx    # Conteneur principal du chat
│   │   │   ├── MessageList.tsx   # Liste des messages (scroll)
│   │   │   ├── MessageBubble.tsx # Bulle message utilisatrice / IA
│   │   │   ├── MessageSources.tsx# Affichage des sources RAG
│   │   │   ├── InputBar.tsx      # Barre de saisie + bouton envoyer
│   │   │   └── TypingIndicator.tsx # Animation "Dagan réfléchit..."
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Header avec logo Dagan IA
│   │   │   └── DomainBadge.tsx   # Badge domaine actif (OHADA / OTR)
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       └── Spinner.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts             # Singleton Prisma client
│   │   ├── rag-client.ts         # Client HTTP vers le microservice Python
│   │   └── utils.ts              # Helpers (cn, formatDate, etc.)
│   │
│   ├── hooks/
│   │   ├── useChat.ts            # Hook principal — état + envoi messages
│   │   └── useScrollToBottom.ts  # Auto-scroll chat
│   │
│   └── types/
│       └── index.ts              # Types TypeScript partagés
│
└── rag-service/                  # Microservice Python — dossier séparé
    ├── requirements.txt
    ├── Dockerfile
    ├── .env.example
    ├── main.py                   # FastAPI app entry point
    ├── routers/
    │   └── query.py              # POST /query
    ├── services/
    │   ├── embedder.py           # OpenAI embeddings
    │   ├── retriever.py          # pgvector similarity search
    │   ├── llm.py                # Mistral / Claude Haiku call
    │   └── prompt_builder.py     # Construction du prompt RAG
    ├── ingestion/
    │   ├── ingest.py             # Script CLI d'ingestion des documents
    │   ├── chunker.py            # Stratégies de chunking (article / sémantique)
    │   └── cleaner.py            # Nettoyage des PDFs / textes sources
    └── models/
        └── schemas.py            # Pydantic schemas (QueryRequest, QueryResponse)
```

---

## 🔑 Variables d'environnement

```bash
# .env.example

# Base de données
DATABASE_URL="postgresql://user:password@host:5432/dagan_ia"

# OpenAI (embeddings)
OPENAI_API_KEY="sk-..."

# LLM — Mistral
MISTRAL_API_KEY="..."

# LLM — Claude Haiku (fallback)
ANTHROPIC_API_KEY="sk-ant-..."

# URL du microservice RAG Python
RAG_SERVICE_URL="http://localhost:8000"

# Next.js
NEXT_PUBLIC_APP_NAME="Dagan IA"
NEXT_PUBLIC_APP_URL="https://dagan-ia.vercel.app"
```

---

## 🎨 Design system — identité visuelle OBLIGATOIRE

### Palette de couleurs

```css
/* src/app/globals.css */

:root {
  --color-terracotta:   #C1440E;  /* Couleur principale — CTA, accents forts */
  --color-gold:         #D4A017;  /* Accents secondaires — highlights */
  --color-forest:       #2D6A4F;  /* Success, confirmations, éléments positifs */
  --color-warm-white:   #FFF8F0;  /* Fond principal */
  --color-dark:         #1A1A1A;  /* Texte principal */
  --color-muted:        #6B6860;  /* Texte secondaire */
  --color-border:       #E8E0D8;  /* Bordures */
  --color-surface:      #F5F0EB;  /* Surfaces secondaires */
}
```

### Tailwind config

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        terracotta: '#C1440E',
        gold:       '#D4A017',
        forest:     '#2D6A4F',
        'warm-white':'#FFF8F0',
        surface:    '#F5F0EB',
        border:     '#E8E0D8',
        muted:      '#6B6860',
      },
      fontFamily: {
        sans:    ['var(--font-dm-sans)', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

### Fonts à importer (Google Fonts)

```tsx
// src/app/layout.tsx
import { Syne, DM_Sans } from 'next/font/google'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
})
```

### Règles de design

- **Titres** : font-display (Syne), font-bold ou font-extrabold
- **Corps** : font-sans (DM Sans), font-normal
- **Couleur principale** : `terracotta` pour les CTA, titres clés, accents
- **Fond** : `warm-white` (#FFF8F0) — jamais blanc pur
- **Bouton envoyer** : `bg-terracotta hover:bg-[#a33a0c] text-white`
- **Bulles IA** : fond `surface`, bordure `border`, texte `dark`
- **Bulles utilisatrice** : fond `terracotta`, texte blanc
- **Motifs Kente** : intégrer subtilement dans le header (pattern SVG ou background-image CSS)
- **Mobile-first** : tout doit être parfait sur écran 375px (iPhone SE)

---

## 💬 Interface chat — comportement détaillé

### État de l'application (`useChat.ts`)

```ts
// src/hooks/useChat.ts
interface ChatState {
  messages: Message[]
  isLoading: boolean
  conversationId: string | null
  error: string | null
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  createdAt: Date
}

interface Source {
  documentTitre: string
  domaine: string
  source: string
  extrait: string // premier 150 caractères du chunk
}
```

### Flux d'un message

```
1. Utilisatrice tape sa question → InputBar
2. onSubmit → useChat.sendMessage(question)
3. Ajout immédiat du message utilisatrice dans l'UI
4. Affichage de TypingIndicator ("Dagan réfléchit...")
5. POST /api/chat { question, conversationId }
6. /api/chat → POST rag-service/query
7. Réponse streamée (SSE) → affichage progressif lettre par lettre
8. En fin de stream : affichage des sources (MessageSources)
9. Log en base : Conversation + Message + MessageChunk
10. Scroll automatique vers le bas
```

### Exemple de message d'accueil (affiché au démarrage)

```
Bonjour ! Je suis Dagan IA, votre Grande Sœur Numérique.

Je peux vous aider sur :
• La création d'entreprise au Togo (droit OHADA)
• La fiscalité togolaise (OTR, TVA, patente, CFE)

Posez-moi votre question en français. Je vous répondrai
avec des informations sourcées et vérifiées.
```

### Questions suggérées (affichées avant le premier message)

```ts
const SUGGESTED_QUESTIONS = [
  "Comment créer une SARL au Togo ? Quel est le capital minimum ?",
  "Quand dois-je déclarer la TVA ? Comment calculer mon acompte ?",
  "C'est quoi les étapes pour s'enregistrer au CFE ?",
  "Quelle est la différence entre SARL et SA dans le droit OHADA ?",
  "Comment calculer ma patente en tant que petit commerce ?",
]
```

---

## 🐍 Microservice Python RAG — implémentation

### `main.py`

```python
# rag-service/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import query

app = FastAPI(title="Dagan IA — RAG Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restreindre en production
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(query.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "dagan-rag"}
```

### `models/schemas.py`

```python
# rag-service/models/schemas.py
from pydantic import BaseModel
from typing import Optional, List

class QueryRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None
    domaine: Optional[str] = None  # filtre optionnel : "OHADA" | "OTR"
    top_k: int = 5

class ChunkSource(BaseModel):
    document_titre: str
    domaine: str
    source: str
    extrait: str
    score: float

class QueryResponse(BaseModel):
    reponse: str
    sources: List[ChunkSource]
    latence_ms: int
```

### `services/prompt_builder.py`

```python
# rag-service/services/prompt_builder.py

SYSTEM_PROMPT = """Tu es Dagan IA, une assistante intelligente et bienveillante,
surnommée "Grande Sœur Numérique". Tu aides les femmes entrepreneures du Togo
et du Bénin avec leurs questions juridiques, fiscales et administratives.

RÈGLES STRICTES :
1. Réponds UNIQUEMENT en te basant sur les passages documentaires fournis dans le contexte.
2. Si l'information n'est pas dans le contexte, dis clairement : "Je n'ai pas cette information dans ma base de données. Je te recommande de contacter directement l'OTR ou le CFE."
3. Cite toujours tes sources (nom du document, article ou section).
4. Utilise un langage simple, chaleureux, direct. Tu parles à une femme entrepreneuse, pas à une juriste.
5. Structure tes réponses avec des étapes numérotées quand c'est une procédure.
6. N'invente JAMAIS de montants, de délais ou de procédures qui ne sont pas dans le contexte.

STYLE : Bienveillant, professionnel, concis. Tutoiement accepté si naturel."""

def build_prompt(question: str, chunks: list) -> list:
    context = "\n\n---\n\n".join([
        f"[Source : {c['document_titre']} — {c['domaine']}]\n{c['contenu']}"
        for c in chunks
    ])

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"""Contexte documentaire :

{context}

---

Question de l'entrepreneuse : {question}

Réponds en te basant uniquement sur le contexte ci-dessus."""}
    ]
```

### `ingestion/chunker.py`

```python
# rag-service/ingestion/chunker.py
"""
Deux stratégies de chunking selon le type de document :
- OHADA (textes juridiques) : chunking par article
- OTR / guides pratiques   : chunking sémantique 500 tokens, overlap 100
"""

from langchain.text_splitter import RecursiveCharacterTextSplitter
import re

def chunk_ohada(text: str) -> list[str]:
    """Découpe par article (Article X — ...)"""
    articles = re.split(r'(?=Article\s+\d+)', text)
    return [a.strip() for a in articles if len(a.strip()) > 50]

def chunk_guide(text: str) -> list[str]:
    """Chunking sémantique 500 tokens, overlap 100"""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", " "],
    )
    return splitter.split_text(text)

def chunk_document(text: str, domaine: str) -> list[str]:
    if domaine == "OHADA":
        return chunk_ohada(text)
    return chunk_guide(text)
```

---

## 📡 API Next.js — route principale

```ts
// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { question, conversationId } = await req.json()

  if (!question || question.trim().length === 0) {
    return NextResponse.json({ error: 'Question vide' }, { status: 400 })
  }

  const ragServiceUrl = process.env.RAG_SERVICE_URL!
  const start = Date.now()

  try {
    // 1. Appel au microservice Python RAG
    const ragResponse = await fetch(`${ragServiceUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, top_k: 5 }),
    })

    if (!ragResponse.ok) {
      throw new Error(`RAG service error: ${ragResponse.status}`)
    }

    const ragData = await ragResponse.json()
    const latenceMs = Date.now() - start

    // 2. Créer ou récupérer la conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      })
    }
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          langue: 'fr',
          userAgent: req.headers.get('user-agent') ?? undefined,
        }
      })
    }

    // 3. Sauvegarder le message en base
    const message = await prisma.message.create({
      data: {
        question,
        reponse: ragData.reponse,
        latenceMs,
        scoreRAG: ragData.sources?.length > 0
          ? ragData.sources.reduce((acc: number, s: { score: number }) => acc + s.score, 0) / ragData.sources.length
          : null,
        conversationId: conversation.id,
      }
    })

    return NextResponse.json({
      reponse: ragData.reponse,
      sources: ragData.sources,
      conversationId: conversation.id,
      messageId: message.id,
      latenceMs,
    })

  } catch (error) {
    console.error('[/api/chat] Error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
```

---

## 📱 PWA — configuration

### `public/manifest.json`

```json
{
  "name": "Dagan IA — Grande Sœur Numérique",
  "short_name": "Dagan IA",
  "description": "Assistant IA pour les femmes entrepreneures du Togo et du Bénin",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF8F0",
  "theme_color": "#C1440E",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### `next.config.ts`

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
}

export default nextConfig
```

---

## 🧪 Critères de validation du MVP

Le MVP est considéré **prêt à présenter** si et seulement si :

| Critère | Seuil | Comment mesurer |
|---|---|---|
| Pertinence RAG | ≥ 80 % (24/30 questions) | Jeu de 30 questions de référence, évaluation manuelle |
| Temps de réponse | ≤ 10 secondes | Mesure sur Android entrée de gamme, connexion 3G |
| Utilisabilité | Score SUS ≥ 70 | Test avec 5 utilisatrices cibles |
| Disponibilité | 0 crash sur 50 questions | Test de charge basique |
| Sources affichées | 100 % des réponses | Vérification automatique |

### Jeu de 30 questions de référence (à valider avec expert juridique)

```
OHADA — Création d'entreprise (10 questions)
1.  Quel est le capital minimum pour créer une SARL au Togo ?
2.  Quelles sont les étapes pour immatriculer une SARL ?
3.  Quelle est la différence entre SARL et SA ?
4.  Combien d'associés minimum pour une SARL OHADA ?
5.  Comment créer un GIE ? Quels documents fournir ?
6.  Quelle est la durée de vie légale d'une société OHADA ?
7.  Que contiennent obligatoirement les statuts d'une SARL ?
8.  Comment nommer un gérant dans une SARL OHADA ?
9.  Peut-on créer une SARL unipersonnelle au Togo ?
10. Comment dissoudre une entreprise selon le droit OHADA ?

OTR / Fiscalité (10 questions)
11. Comment calculer ma patente au Togo ?
12. Quand dois-je déclarer et payer la TVA ?
13. Quel est le taux de TVA au Togo ?
14. C'est quoi le régime simplifié d'imposition ?
15. Comment obtenir mon Numéro d'Identification Fiscale (NIF) ?
16. Quelles sont les obligations fiscales d'une nouvelle entreprise la première année ?
17. Comment calculer mon impôt sur les bénéfices (IS) ?
18. Qu'est-ce que l'acompte provisionnel OTR ?
19. Quelles sont les sanctions en cas de retard de déclaration TVA ?
20. Comment faire une demande de remboursement de crédit TVA ?

CFE / Formalités (5 questions)
21. Quels documents fournir au CFE pour créer une entreprise ?
22. Combien coûte l'immatriculation au registre de commerce ?
23. Quel est le délai d'obtention du registre de commerce ?
24. Comment modifier les statuts d'une société déjà immatriculée ?
25. Comment obtenir une attestation de régularité fiscale ?

Mixtes (5 questions)
26. Je veux vendre des pagnes en gros, quelle structure juridique choisir ?
27. J'ai un salon de coiffure informel, comment me formaliser étape par étape ?
28. Quelle est la différence entre patente et TVA ?
29. Mon entreprise est en SARL, suis-je obligée de tenir une comptabilité ?
30. Où s'adresser en premier pour créer mon entreprise à Lomé ?
```

---

## 📋 Documents sources à intégrer dans la base RAG

```
PRIORITÉ CRITIQUE (Sprint 1 — ingérer avant tout) :
├── OHADA_AUSC_ActeUniformeSocietes.pdf
├── OHADA_AUC_ActeUniformeCooperatives.pdf
├── OTR_Guide_TVA_Togo.pdf
├── OTR_Guide_IS_ImpotSocietes.pdf
└── CFE_Procedure_Creation_Entreprise_Togo.pdf

PRIORITÉ IMPORTANTE (Sprint 4) :
├── OTR_RegimeSimplifiedImposition_TPE.pdf
├── OTR_Patente_CalculEtDeclaration.pdf
└── OTR_NIF_ProcedureObtention.pdf

PHASE 2 (post-MVP) :
├── FUCEC_Togo_ProduitsFinanciers.pdf
├── WAGES_Togo_ConditionsCredit.pdf
├── FAIEJ_Togo_CritereEligibilite.pdf
└── FEFA_Togo_ProcedureDemande.pdf
```

---

## 🚀 Commandes de démarrage

```bash
# 1. Cloner et installer
git clone https://github.com/<org>/dagan-ia.git
cd dagan-ia
npm install

# 2. Variables d'environnement
cp .env.example .env.local
# Remplir DATABASE_URL, OPENAI_API_KEY, MISTRAL_API_KEY, RAG_SERVICE_URL

# 3. Base de données
npx prisma migrate dev --name init
npx prisma generate

# 4. Démarrer Next.js
npm run dev

# 5. Microservice Python (dans un autre terminal)
cd rag-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 6. Ingestion des documents (après avoir placé les PDFs dans rag-service/data/)
cd rag-service
python ingestion/ingest.py --file data/OHADA_AUSC.pdf --domaine OHADA
python ingestion/ingest.py --file data/OTR_TVA.pdf --domaine OTR
```

---

## ⚙️ `requirements.txt` Python

```
fastapi==0.111.0
uvicorn==0.30.0
pydantic==2.7.0
langchain==0.2.0
langchain-openai==0.1.0
langchain-mistralai==0.1.0
psycopg2-binary==2.9.9
pgvector==0.2.5
python-dotenv==1.0.1
pypdf==4.2.0
tiktoken==0.7.0
```

---

## `package.json` — dépendances clés

```json
{
  "dependencies": {
    "next": "14.2.0",
    "react": "^18",
    "react-dom": "^18",
    "@prisma/client": "^5.15.0",
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "prisma": "^5.15.0",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.0"
  }
}
```

---

## 🛡️ Règles absolues pour le développement

1. **Aucune modification de la base sans migration Prisma** — jamais de SQL direct en dehors des migrations.
2. **Le LLM ne répond que depuis le contexte RAG** — le system prompt interdit l'hallucination.
3. **Conversations anonymes au MVP** — UUID session uniquement, 0 donnée personnelle collectée.
4. **Streaming obligatoire** — la réponse doit s'afficher progressivement, jamais en bloc.
5. **Sources toujours affichées** — chaque réponse IA doit montrer les documents utilisés.
6. **Mobile-first absolu** — tester sur 375px avant tout, chaque composant.
7. **Zéro console.error en production** — tous les catch doivent logger proprement.
8. **TypeScript strict** — `strict: true` dans tsconfig.json, 0 `any` implicite.
9. **Variables d'environnement** — aucune clé API dans le code source, tout dans `.env.local`.
10. **Commits conventionnels** — `feat:`, `fix:`, `chore:`, `docs:` — un commit par fonctionnalité.

---

## 🎯 Définition de "terminé" pour chaque sprint

### Sprint 0 ✅ quand :
- [ ] `npm run dev` fonctionne sans erreur
- [ ] `prisma migrate dev` crée les 5 tables + extension pgvector
- [ ] `uvicorn main:app` démarre sans erreur
- [ ] 10 documents sources nettoyés et prêts dans `rag-service/data/`

### Sprint 1 ✅ quand :
- [ ] `python ingest.py` ingère OHADA AUSC en base sans erreur
- [ ] Une requête SQL `SELECT COUNT(*) FROM "Chunk"` retourne > 100 chunks
- [ ] Le retrieval vectoriel retourne des résultats pertinents pour "capital minimum SARL"

### Sprint 2 ✅ quand :
- [ ] `POST http://localhost:8000/query` avec `{"question": "capital SARL"}` retourne une réponse sourcée
- [ ] La réponse contient `sources` avec au moins 1 document
- [ ] `POST /api/chat` depuis Next.js retourne la même chose + `conversationId` en base

### Sprint 3 ✅ quand :
- [ ] L'interface chat s'affiche correctement sur iPhone SE (375px)
- [ ] Le streaming affiche les tokens progressivement
- [ ] Les bulles utilisatrice/IA sont visuellement distinctes
- [ ] Les sources s'affichent en dessous de chaque réponse IA
- [ ] Le manifest.json permet l'installation en PWA sur Android

### Sprint 4 ✅ quand :
- [ ] 30 questions de référence testées, ≥ 24 réponses pertinentes
- [ ] Temps de réponse moyen mesuré ≤ 10 secondes
- [ ] Déploiement Vercel + Railway fonctionnel sur URL publique
- [ ] 0 crash sur 50 questions consécutives

---

## 📊 Modèle B2B2C — contexte business pour le jury

| Partenaire | Valeur | Revenu |
|---|---|---|
| IMF (FUCEC, WAGES, Assilassimé) | Clientes mieux préparées, risque défaut réduit | Licence annuelle / bénéficiaires |
| ONG & incubateurs (CUBE, Djanta Tech Hub, GIZ) | Formation digitale scalable | Licence annuelle ou subvention |
| Banques & fintech | Éducation financière des futures clientes | API à l'usage |
| État / ANPE / OTR | Digitalisation des procédures | Partenariat public |

**Utilisatrice finale : toujours gratuite.**

---

*Dagan IA — « Grande Sœur Numérique »*
*Document confidentiel — Programme D-CLIC / CUBE / OIF · Lomé, Togo · Juin 2025*
