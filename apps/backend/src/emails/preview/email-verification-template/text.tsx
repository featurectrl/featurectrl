import { TextPreview } from "@/emails/shared/text-preview";
import { emailVerificationTemplate } from "@/emails/templates/email-verification-template";
import { props } from "./props";

export default function () {
  return <TextPreview>{emailVerificationTemplate.bodyText(props)}</TextPreview>;
}
