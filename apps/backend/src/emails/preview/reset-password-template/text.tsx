import { TextPreview } from "@/emails/shared/text-preview";
import { resetPasswordTemplate } from "@/emails/templates/reset-password-template";
import { props } from "./props";

export default function () {
  return <TextPreview>{resetPasswordTemplate.bodyText(props)}</TextPreview>;
}
