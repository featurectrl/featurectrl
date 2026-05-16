import { InlineAssetProvider } from "@/emails/shared/assets-provider";
import { changeEmailTemplate } from "@/emails/templates/change-email-template";
import { props } from "./props";

export default function () {
  return (
    <InlineAssetProvider>
      <changeEmailTemplate.bodyHtml {...props} />
    </InlineAssetProvider>
  );
}
