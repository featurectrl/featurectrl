import nodemailer from "nodemailer";
import { env } from "@/env";

const transport = env.EMAIL_BACKEND_URL.startsWith("console://")
  ? nodemailer.createTransport({
      streamTransport: true,
      from: env.EMAIL_FROM,
    })
  : nodemailer.createTransport(env.EMAIL_BACKEND_URL, {
      from: env.EMAIL_FROM,
    });

export type SendMailOptions = nodemailer.SendMailOptions;

export async function sendMail(opts: nodemailer.SendMailOptions): Promise<void> {
  await transport.sendMail(opts);
}
