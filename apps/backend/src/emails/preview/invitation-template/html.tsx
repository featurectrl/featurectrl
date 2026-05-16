import { InlineAssetProvider } from "@/emails/assets-provider";
import { invitationTemplate } from "@/emails/templates/invitation-template";
import { props } from "./props";

export default function () {
  return (
    <InlineAssetProvider>
      <invitationTemplate.bodyHtml {...props} />
    </InlineAssetProvider>
  );
}
