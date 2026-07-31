// Mailgun provider — scaffolded for the future.
// Implement `send` against https://api.mailgun.net/v3/<domain>/messages when needed,
// reading credentials from process.env.MAILGUN_API_KEY and process.env.MAILGUN_DOMAIN.

async function send() {
  throw new Error(
    "Mailgun provider is not implemented yet. Set provider to 'resend' in Notification settings."
  );
}

export default { name: "mailgun", send };
