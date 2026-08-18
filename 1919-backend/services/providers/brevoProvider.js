// Brevo (formerly Sendinblue) provider — scaffolded for the future.
// Implement `send` against https://api.brevo.com/v3/smtp/email when needed,
// reading the key from process.env.BREVO_API_KEY.

async function send() {
  throw new Error(
    "Brevo provider is not implemented yet. Set provider to 'resend' in Notification settings."
  );
}

export default { name: "brevo", send };
