import { invitationTemplate } from "@/emails/templates/invitation-template";
import { props } from "./props";

export default function () {
  return <invitationTemplate.bodyHtml {...props} />;
}
