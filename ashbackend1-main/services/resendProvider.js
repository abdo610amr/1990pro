// Resend email provider.
// Talks to the Resend REST API directly via global fetch (Node 18+),
// so no extra npm package needs to be installed.
//
// Every provider in this folder exposes the same shape:
//   { name: string, send({ from, to, subject, html, text }) => Promise<{ id, provider }> }
// This is what makes the notification layer provider-agnostic and future-ready
// for Brevo / Mailgun / Amazon SES.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

async function send({ from, to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to your .env file before sending email."
    );
  }

  const recipients = Array.isArray(to) ? to : [to];

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: recipients, subject, html, text }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.message || data?.error?.message || `Resend API error (${response.status})`;
    throw new Error(message);
  }

  return { id: data?.id ?? null, provider: "resend" };
}

export default { name: "resend", send };
