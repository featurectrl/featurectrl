import { resetPasswordTemplate } from "@/emails/templates/reset-password-template";
import { props } from "./props";

export default function () {
  return <resetPasswordTemplate.bodyHtml {...props} />;
}
