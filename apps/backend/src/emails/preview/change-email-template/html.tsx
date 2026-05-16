import { changeEmailTemplate } from "@/emails/templates/change-email-template";
import { props } from "./props";

export default function () {
  return <changeEmailTemplate.bodyHtml {...props} />;
}
