import { faker } from "@faker-js/faker";
import { v7 as uuidv7 } from "uuid";
import type { Tx } from "@/db";
import { organization } from "@/db/schema";

type CreateTestOrganizationInput = {
  slug?: string;
  name?: string;
};

export async function createTestOrganization(
  tx: Tx,
  { name, slug }: CreateTestOrganizationInput = {},
) {
  const organizationId = uuidv7();
  name = name ?? faker.company.name();
  slug = slug ?? faker.helpers.slugify(name).toLowerCase();

  const [instance] = await tx
    .insert(organization)
    .values({ id: organizationId, name, slug })
    .returning();

  return instance;
}
