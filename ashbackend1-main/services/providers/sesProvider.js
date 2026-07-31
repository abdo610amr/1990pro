// Amazon SES provider — scaffolded for the future.
// Implement `send` using the SES v2 API / AWS SDK when needed, reading credentials
// from process.env.AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION.

async function send() {
  throw new Error(
    "Amazon SES provider is not implemented yet. Set provider to 'resend' in Notification settings."
  );
}

export default { name: "ses", send };
