/**
 * Cloudflare Pages Function: POST /api/contact
 *
 * Validates the contact form, checks Cloudflare Turnstile and a honeypot field,
 * then emails the message to Syd through Resend (free plan: 3,000 emails/month).
 *
 * Environment variables (Cloudflare Pages → Settings → Variables, all "Secret" except CONTACT_*):
 *   TURNSTILE_SECRET_KEY  Turnstile widget secret key
 *   RESEND_API_KEY        Resend API key
 *   CONTACT_TO            Inbox that receives messages, e.g. syd@…
 *   CONTACT_FROM          Verified sender on the Resend domain, e.g. "sydmoore.com <website@sydmoore.com>"
 */

interface Env {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
}

interface Context {
  request: Request;
  env: Env;
}

const REASONS: Record<string, string> = {
  event: "Event or talk booking",
  press: "Press or media",
  reader: "Reader message",
  other: "Other enquiry",
};

const redirect = (request: Request, path: string) =>
  Response.redirect(new URL(path, request.url).toString(), 303);

export const onRequestPost = async ({ request, env }: Context): Promise<Response> => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirect(request, "/contact?error=invalid");
  }

  const field = (name: string, max: number) => String(form.get(name) ?? "").trim().slice(0, max);
  const name = field("name", 200);
  const email = field("email", 320);
  const reason = REASONS[field("reason", 20)] ?? REASONS.other;
  const message = field("message", 5000);
  const honeypot = field("website", 200);
  const token = field("cf-turnstile-response", 2048);

  // Bots fill the hidden field: pretend it worked.
  if (honeypot) return redirect(request, "/contact/thanks");

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirect(request, "/contact?error=invalid");
  }

  // Turnstile check (server side).
  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: request.headers.get("CF-Connecting-IP") ?? "",
    }),
  });
  const outcome = (await verify.json().catch(() => ({ success: false }))) as { success: boolean };
  if (!outcome.success) return redirect(request, "/contact?error=verify");

  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: `sydmoore.com: ${reason} from ${name}`,
      text: `${reason}\n\nFrom: ${name} <${email}>\n\n${message}\n\n— Sent from the contact form on sydmoore.com`,
    }),
  });

  if (!sent.ok) return redirect(request, "/contact?error=send");
  return redirect(request, "/contact/thanks");
};

/** Anything other than POST goes back to the contact page. */
export const onRequestGet = async ({ request }: Context) => redirect(request, "/contact");
