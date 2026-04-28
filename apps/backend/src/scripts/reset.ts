import { db } from "@/db";
import { organization, user, verification } from "@/db/schema";

async function main() {
  await db.delete(organization);
  await db.delete(user);
  await db.delete(verification);
  console.log("✓ database wiped");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
