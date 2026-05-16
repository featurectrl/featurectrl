import { InlineAssetProvider } from "@/emails/shared/assets-provider";
import { resetPasswordTemplate } from "@/emails/templates/reset-password-template";
import { props } from "./props";

export default function () {
  return (
    <InlineAssetProvider>
      <resetPasswordTemplate.bodyHtml {...props} />
    </InlineAssetProvider>
  );
}
