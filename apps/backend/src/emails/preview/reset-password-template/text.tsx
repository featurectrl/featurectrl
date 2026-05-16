import { TextPreview } from "@/emails/shared/TextPreview";
import { resetPasswordTemplate } from "@/emails/templates/reset-password-template";
import { props } from "./props";

export default function () {
  return <TextPreview>{resetPasswordTemplate.bodyText(props)}</TextPreview>;
}
