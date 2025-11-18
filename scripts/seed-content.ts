#!/usr/bin/env tsx
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import {
  transformBlogPostForSeed,
  transformLandmarkForSeed,
  transformTestimonialForSeed,
  transformTourForSeed,
  transformVehicleForSeed,
} from "@/lib/dataSeedTransformers";
import {
  allTours,
  blogPosts,
  cebuLandmarks,
  mountainLandmarks,
  testimonials,
  vehicles,
} from "@/lib/seedData";
import { SeedTransformOptions, TimestampProvider } from "@/lib/dataSeedTransformers";

type CollectionName =
  | "tours"
  | "vehicles"
  | "blogPosts"
  | "landmarks"
  | "testimonials";

interface CliOptions {
  dryRun: boolean;
  collections: CollectionName[];
}

const AVAILABLE_COLLECTIONS: CollectionName[] = [
  "tours",
  "vehicles",
  "blogPosts",
  "landmarks",
  "testimonials",
];

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  let dryRun = true;
  let collections = [...AVAILABLE_COLLECTIONS];

  args.forEach((arg) => {
    if (arg === "--commit" || arg === "--no-dry-run") {
      dryRun = false;
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg.startsWith("--collections=")) {
      const value = arg.split("=")[1];
      if (value) {
        const requested = value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean) as CollectionName[];
        const invalid = requested.filter(
          (name) => !AVAILABLE_COLLECTIONS.includes(name)
        );
        if (invalid.length) {
          throw new Error(
            `Invalid collection(s): ${invalid.join(
              ", "
            )}. Valid options: ${AVAILABLE_COLLECTIONS.join(", ")}`
          );
        }
        collections = requested;
      }
    }
  });

  return { dryRun, collections };
}

function getTimestampProvider(): TimestampProvider {
  return {
    now: () => Timestamp.now(),
    fromDate: (date: Date) => Timestamp.fromDate(date),
  };
}

async function seedTours(dryRun: boolean, options: SeedTransformOptions) {
  const collectionRef = adminDb.collection("tours");
  for (const tour of allTours) {
    const payload = transformTourForSeed(tour, options);
    const docRef = collectionRef.doc(payload.id);
    if (dryRun) {
      console.log(`[DRY RUN] Would upsert tour ${payload.id}`);
      continue;
    }
    await docRef.set(payload, { merge: true });
    console.log(`Upserted tour ${payload.id}`);
  }
}

async function seedVehicles(dryRun: boolean, options: SeedTransformOptions) {
  const collectionRef = adminDb.collection("vehicles");
  for (const vehicle of vehicles) {
    const payload = transformVehicleForSeed(vehicle, options);
    const docRef = collectionRef.doc(payload.id);
    if (dryRun) {
      console.log(`[DRY RUN] Would upsert vehicle ${payload.id}`);
      continue;
    }
    await docRef.set(payload, { merge: true });
    console.log(`Upserted vehicle ${payload.id}`);
  }
}

async function seedBlogPosts(dryRun: boolean, options: SeedTransformOptions) {
  const collectionRef = adminDb.collection("blogPosts");
  for (const post of blogPosts) {
    const payload = transformBlogPostForSeed(post, options);
    const docRef = collectionRef.doc(payload.id);
    if (dryRun) {
      console.log(`[DRY RUN] Would upsert blog post ${payload.id}`);
      continue;
    }
    await docRef.set(payload, { merge: true });
    console.log(`Upserted blog post ${payload.id}`);
  }
}

async function seedLandmarks(dryRun: boolean, options: SeedTransformOptions) {
  const collectionRef = adminDb.collection("landmarks");
  const allLandmarks = [...cebuLandmarks, ...mountainLandmarks];
  for (const landmark of allLandmarks) {
    const payload = transformLandmarkForSeed(landmark, options);
    const docRef = collectionRef.doc(payload.id);
    if (dryRun) {
      console.log(`[DRY RUN] Would upsert landmark ${payload.id}`);
      continue;
    }
    await docRef.set(payload, { merge: true });
    console.log(`Upserted landmark ${payload.id}`);
  }
}

async function seedTestimonials(
  dryRun: boolean,
  options: SeedTransformOptions
) {
  const collectionRef = adminDb.collection("testimonials");
  for (const testimonial of testimonials) {
    const payload = transformTestimonialForSeed(testimonial, options);
    const docRef = collectionRef.doc(payload.id);
    if (dryRun) {
      console.log(`[DRY RUN] Would upsert testimonial ${payload.id}`);
      continue;
    }
    await docRef.set(payload, { merge: true });
    console.log(`Upserted testimonial ${payload.id}`);
  }
}

async function main() {
  const { dryRun, collections } = parseArgs();
  const timestampProvider = getTimestampProvider();
  const options: SeedTransformOptions = { timestampProvider };

  console.log(
    `\nStarting content seed (${dryRun ? "dry-run" : "commit"} mode) for collections: ${collections.join(
      ", "
    )}\n`
  );

  for (const collection of collections) {
    switch (collection) {
      case "tours":
        await seedTours(dryRun, options);
        break;
      case "vehicles":
        await seedVehicles(dryRun, options);
        break;
      case "blogPosts":
        await seedBlogPosts(dryRun, options);
        break;
      case "landmarks":
        await seedLandmarks(dryRun, options);
        break;
      case "testimonials":
        await seedTestimonials(dryRun, options);
        break;
      default:
        throw new Error(`Unhandled collection: ${collection}`);
    }
  }

  console.log("\nContent seeding completed.\n");
}

main().catch((error) => {
  console.error("Content seeding failed:", error);
  process.exit(1);
});

