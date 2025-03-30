import { config } from "dotenv";
config(); // Load .env variables

import { v4 as uuidv4 } from "uuid";
import { createClient } from "@sanity/client";

// ✅ DEBUG ENV CHECK
console.log("🧪 RAW ENV VALUES:");
console.log("NEXT_PUBLIC_SANITY_PROJECT_ID:", JSON.stringify(process.env.SANITY_PROJECT_ID));
console.log("NEXT_PUBLIC_SANITY_DATASET:", JSON.stringify(process.env.SANITY_DATASET));
console.log("SANITY_API_TOKEN:", JSON.stringify(process.env.SANITY_API_TOKEN));


// ✅ Create Sanity Client
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: "2024-03-01",
  useCdn: false,
});

// ✅ Patch function
async function fixChatMemoryKeys() {
  console.log("🔍 Fetching all chatMemory documents...");
  const docs = await sanity.fetch(`*[_type == "chatMemory"]`);

  for (const doc of docs) {
    let needsFix = false;

    const updatedMessages = doc.messages?.map((msg: any) => {
      if (!msg._key) {
        needsFix = true;
        return { ...msg, _key: uuidv4() };
      }
      return msg;
    }) ?? [];

    if (needsFix) {
      console.log(`🔧 Fixing chatMemory doc: ${doc._id}`);
      await sanity
        .patch(doc._id)
        .set({ messages: updatedMessages })
        .commit();
    }
  }

  console.log("✅ All chatMemory docs have been patched.");
}

// ✅ Run
fixChatMemoryKeys().catch((err) => {
  console.error("❌ Error patching chatMemory docs:", err);
});
