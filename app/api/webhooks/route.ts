import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Initialize Convex HTTP client (for server-side)
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error("Error: Please add SIGNING_SECRET from Clerk Dashboard to .env");
  }

  // Create new Svix instance with your signing secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If any headers are missing, reject the request
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  // Get request body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify the webhook signature
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

  // Process the webhook event
  const { id } = evt.data;
  const eventType = evt.type;
  
  console.log(`Received webhook with ID ${id} and event type: ${eventType}`);

  // Handle user.created event
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    // Extract primary email
    const primaryEmail = email_addresses?.[0]?.email_address || "";
    
    // Construct full name (handle cases where first/last might be missing)
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || primaryEmail.split("@")[0];
    
    try {
      // Call your existing storeUser mutation using Convex HTTP client
      const result = await convex.mutation(api.users.storeUser, {
        clerkId: id,
        email: primaryEmail,
        name: fullName,
        avatarUrl: image_url || "",
      });
      
      console.log(`User stored successfully with ID: ${result}`);
    } catch (error) {
      console.error("Error storing user in Convex:", error);
      return new Response("Error storing user", { status: 500 });
    }
  }

  // Optional: Handle user.updated event
  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address || "";
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || primaryEmail.split("@")[0];
    
    try {
      await convex.mutation(api.users.storeUser, {
        clerkId: id,
        email: primaryEmail,
        name: fullName,
        avatarUrl: image_url || "",
      });
      console.log(`User updated successfully`);
    } catch (error) {
      console.error("Error updating user in Convex:", error);
    }
  }

  return new Response("Webhook received", { status: 200 });
}