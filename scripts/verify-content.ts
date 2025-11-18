#!/usr/bin/env tsx
import { adminDb } from "@/lib/firebase-admin";

const COLLECTIONS = ["tours", "vehicles", "blogPosts", "landmarks", "testimonials"] as const;
type CollectionName = (typeof COLLECTIONS)[number];

interface CliOptions {
  collections: CollectionName[];
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  let collections = [...COLLECTIONS];

  args.forEach((arg) => {
    if (arg.startsWith("--collections=")) {
      const value = arg.split("=")[1];
      if (value) {
        const requested = value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean) as CollectionName[];
        const invalid = requested.filter(
          (name) => !COLLECTIONS.includes(name)
        );
        if (invalid.length) {
          throw new Error(
            `Invalid collection(s): ${invalid.join(
              ", "
            )}. Valid options: ${COLLECTIONS.join(", ")}`
          );
        }
        collections = requested;
      }
    }
  });

  return { collections };
}

async function verifyCollection(collection: CollectionName) {
  const snapshot = await adminDb.collection(collection).get();
  const count = snapshot.size;
  const sampleDoc = snapshot.docs[0]?.data() ?? null;

  console.log(`\nCollection: ${collection}`);
  console.log(`Documents: ${count}`);
  if (sampleDoc) {
    const previewEntries = Object.entries(sampleDoc)
      .slice(0, 5)
      .map(([key, value]) => `  • ${key}: ${JSON.stringify(value).slice(0, 120)}`);
    console.log("Sample document:");
    previewEntries.forEach((entry) => console.log(entry));
  } else {
    console.log("Sample document: <empty>");
  }
}

async function main() {
  const { collections } = parseArgs();
  console.log("Verifying Firestore content collections...\n");

  for (const collection of collections) {
    await verifyCollection(collection);
  }

  console.log("\nVerification complete.");
}

main().catch((error) => {
  console.error("Verification failed:", error);
  process.exit(1);
});

