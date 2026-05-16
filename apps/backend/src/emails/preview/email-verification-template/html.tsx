import { InlineAssetProvider } from "@/emails/shared/assets-provider";
import { emailVerificationTemplate } from "@/emails/templates/email-verification-template";
import { props } from "./props";

export default function () {
  return (
    <InlineAssetProvider>
      <emailVerificationTemplate.bodyHtml {...props} />
    </InlineAssetProvider>
  );
}
