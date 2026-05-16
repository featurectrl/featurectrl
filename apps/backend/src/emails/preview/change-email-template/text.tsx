import { TextPreview } from "@/emails/shared/text-preview";
import { changeEmailTemplate } from "@/emails/templates/change-email-template";
import { props } from "./props";

export default function () {
  return <TextPreview>{changeEmailTemplate.bodyText(props)}</TextPreview>;
}
