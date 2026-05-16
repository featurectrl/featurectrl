import { TextPreview } from "@/emails/shared/TextPreview";
import { invitationTemplate } from "@/emails/templates/invitation-template";
import { props } from "./props";

export default function () {
  return <TextPreview>{invitationTemplate.bodyText(props)}</TextPreview>;
}
