import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// Vecteur zéro 1536 dimensions — placeholder pour les tests (sans appel API embedding)
const ZERO_VECTOR = `[${Array(1536).fill(0).join(",")}]`;

async function insertChunk(params: {
  documentId: string;
  contenu: string;
  position: number;
  tokenCount: number;
}) {
  await prisma.$executeRaw`
    INSERT INTO "Chunk" (id, contenu, embedding, position, "tokenCount", "documentId", "createdAt")
    VALUES (
      ${randomUUID()},
      ${params.contenu},
      ${ZERO_VECTOR}::vector,
      ${params.position},
      ${params.tokenCount},
      ${params.documentId},
      NOW()
    )
  `;
}

async function main() {
  console.log("🌱 Démarrage du seeding Dagan IA...\n");

  // ─── Document 1 : OHADA ────────────────────────────────────────────────────
  const doc1 = await prisma.document.create({
    data: {
      titre: "Acte Uniforme OHADA sur le Droit Commercial Général",
      domaine: "OHADA",
      sousDomaine: "Commerce général",
      source: "ohada.com",
      version: "2010",
      actif: true,
    },
  });

  await insertChunk({
    documentId: doc1.id,
    contenu:
      "L'Acte Uniforme OHADA sur le Droit Commercial Général régit les activités " +
      "commerciales dans les 17 États membres de l'OHADA, dont le Togo et le Bénin. " +
      "Il définit le statut de commerçant et les obligations qui en découlent.",
    position: 0,
    tokenCount: 48,
  });

  await insertChunk({
    documentId: doc1.id,
    contenu:
      "Pour immatriculer votre entreprise au Registre du Commerce et du Crédit Mobilier (RCCM), " +
      "vous devez fournir : une copie certifiée de la pièce d'identité, un acte de naissance, " +
      "un justificatif de domicile de moins de 3 mois, et un extrait de casier judiciaire.",
    position: 1,
    tokenCount: 58,
  });

  await insertChunk({
    documentId: doc1.id,
    contenu:
      "La SARL (Société à Responsabilité Limitée) est la forme juridique la plus adaptée aux PME " +
      "féminines au Togo : capital social minimum de 1 000 000 FCFA, responsabilité limitée " +
      "aux apports, possibilité d'être associée unique (SARLU).",
    position: 2,
    tokenCount: 52,
  });

  console.log(`Document 1 créé : "${doc1.titre}" (3 chunks)`);

  // ─── Document 2 : OTR ──────────────────────────────────────────────────────
  const doc2 = await prisma.document.create({
    data: {
      titre: "Guide fiscal OTR — Régime de la Taxe Professionnelle Unique (TPU)",
      domaine: "OTR",
      sousDomaine: "Fiscalité PME",
      source: "otr.tg",
      version: "2024",
      actif: true,
    },
  });

  await insertChunk({
    documentId: doc2.id,
    contenu:
      "La Taxe Professionnelle Unique (TPU) est un régime fiscal simplifié au Togo destiné " +
      "aux petites entreprises dont le chiffre d'affaires annuel est inférieur à 60 millions " +
      "de FCFA. Elle remplace la patente, l'impôt sur les BIC et la TVA.",
    position: 0,
    tokenCount: 55,
  });

  await insertChunk({
    documentId: doc2.id,
    contenu:
      "Le taux de la TPU varie selon le secteur d'activité : 2% pour le commerce et l'artisanat, " +
      "3% pour les prestations de services, 5% pour les professions libérales. " +
      "Les commerçantes et artisanes bénéficient donc du taux le plus avantageux.",
    position: 1,
    tokenCount: 57,
  });

  await insertChunk({
    documentId: doc2.id,
    contenu:
      "La déclaration TPU est annuelle et doit être déposée avant le 31 mars de chaque année " +
      "auprès du centre fiscal de votre localité. En cas de retard, des pénalités de 25% " +
      "majorées de 1% par mois de retard supplémentaire sont applicables.",
    position: 2,
    tokenCount: 54,
  });

  console.log(`Document 2 créé : "${doc2.titre}" (3 chunks)\n`);
  console.log("Seeding terminé avec succès !");
  console.log(" 2 documents | 6 chunks | vecteurs zéro ");
}

main()
  .catch((e) => {
    console.error("Erreur de seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
