// Provider registry / factory.
// Add a new email provider by dropping a file here and registering it below —
// no business logic anywhere else needs to change.
import resendProvider from "../resendProvider.js";
import brevoProvider from "./brevoProvider.js";
import mailgunProvider from "./mailgunProvider.js";
import sesProvider from "./sesProvider.js";

const providers = {
  resend: resendProvider,
  brevo: brevoProvider,
  mailgun: mailgunProvider,
  ses: sesProvider,
};

export const SUPPORTED_PROVIDERS = Object.keys(providers);

export function getProvider(name = "resend") {
  const provider = providers[String(name).toLowerCase()];
  if (!provider) {
    throw new Error(
      `Unknown email provider "${name}". Supported: ${SUPPORTED_PROVIDERS.join(", ")}`
    );
  }
  return provider;
}
