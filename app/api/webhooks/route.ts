import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env",
    );
  }

  const wh = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  const body = await req.text();
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, username, image_url } = evt.data;

    if (!id) {
      console.error("Error: Missing user ID in webhook payload");
      return new Response("Error: Missing user ID", { status: 400 });
    }

    const primaryEmail = email_addresses?.[0]?.email_address || "";

    const displayName = username || primaryEmail.split("@")[0];

    try {
      await convex.mutation(api.users.storeUser, {
        clerkId: id,
        email: primaryEmail,
        name: displayName,
        avatarUrl: image_url || "",
      });

      console.log(`User stored/updated successfully with ID: ${id}`);
    } catch (error) {
      console.error("Error storing user in Convex:", error);
      return new Response("Error storing user", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
