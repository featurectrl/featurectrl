import { createFileRoute } from "@tanstack/react-router";
import {
  ApiKeyListSection,
  ApiKeyListSectionSkeleton,
} from "./_components/api-keys/api-key-list-section.tsx";
import {
  DeleteOrganizationSection,
  DeleteOrganizationSectionSkeleton,
} from "./_components/delete-organization/delete-organization-section.tsx";
import {
  EnvironmentListSection,
  EnvironmentListSectionSkeleton,
} from "./_components/environments/environment-list-section.tsx";
import { GeneralSection, GeneralSectionSkeleton } from "./_components/general/general-section.tsx";
import {
  MemberListSection,
  MemberListSectionSkeleton,
} from "./_components/members/member-list-section.tsx";

export const Route = createFileRoute("/_main/settings")({
  staticData: { crumb: "Settings" },
  loader: async ({ context }) => {
    const { queryClient, trpc, betterAuth } = context;

    await Promise.all([
      queryClient.ensureQueryData(betterAuth.organization.getFullOrganization.queryOptions()),
      queryClient.ensureQueryData(trpc.environments.list.queryOptions({ includeArchived: false })),
      queryClient.ensureQueryData(trpc.apiKeys.list.queryOptions()),
    ]);
  },
  pendingComponent: SettingsPageLoading,
  component: SettingsPage,
});

function PageHeader() {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your organization, environments and members.
      </p>
    </header>
  );
}

function SettingsPageLoading() {
  return (
    <div className="max-w-4xl px-6 py-8">
      <PageHeader />

      <div className="flex flex-col gap-6">
        <GeneralSectionSkeleton />
        <EnvironmentListSectionSkeleton />
        <ApiKeyListSectionSkeleton />
        <MemberListSectionSkeleton />
        <DeleteOrganizationSectionSkeleton />
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="max-w-4xl px-6 py-8">
      <PageHeader />

      <div className="flex flex-col gap-6">
        <GeneralSection />
        <EnvironmentListSection />
        <ApiKeyListSection />
        <MemberListSection />
        <DeleteOrganizationSection />
      </div>
    </div>
  );
}
