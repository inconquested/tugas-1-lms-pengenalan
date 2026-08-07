import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import {
  syncClerkUser,
  deleteUserByClerkId,
} from "@/lib/services/user.service";

// Clerk -> Supabase sync. Configure a webhook in the Clerk dashboard pointing at
// /api/webhooks/clerk (events: user.created, user.updated, user.deleted) and set
// CLERK_WEBHOOK_SIGNING_SECRET in the environment. `verifyWebhook` validates the
// Svix signature using that secret.
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  switch (evt.type) {
    case "user.created":
    case "user.updated": {
      const data = evt.data;
      const email =
        data.email_addresses.find(
          (e) => e.id === data.primary_email_address_id,
        )?.email_address ?? data.email_addresses[0]?.email_address;
      if (!email) break;
      const name =
        [data.first_name, data.last_name].filter(Boolean).join(" ") || email;
      await syncClerkUser({ clerkId: data.id, email, name });
      break;
    }
    case "user.deleted": {
      if (evt.data.id) await deleteUserByClerkId(evt.data.id);
      break;
    }
  }

  return new Response("ok", { status: 200 });
}
