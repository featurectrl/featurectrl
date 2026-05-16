import { emailVerificationTemplate } from "@/emails/templates/email-verification-template";
import { props } from "./props";

export default function () {
  return <emailVerificationTemplate.bodyHtml {...props} />;
}
