import { createFileRoute } from "@tanstack/react-router";
import {
  PersonalInformationSection,
  PersonalInformationSectionSkeleton,
} from "./_components/personal-information/personal-information-section.tsx";
import {
  ProfileHeaderSection,
  ProfileHeaderSectionSkeleton,
} from "./_components/profile-header/profile-header-section.tsx";
import {
  ProfileLogoutSection,
  ProfileLogoutSectionSkeleton,
} from "./_components/profile-logout/profile-logout-section.tsx";
import {
  SecuritySection,
  SecuritySectionSkeleton,
} from "./_components/security/security-section.tsx";
import {
  SessionListSection,
  SessionListSectionSkeleton,
} from "./_components/sessions/session-list-section.tsx";

export const Route = createFileRoute("/_main/profile")({
  staticData: { crumb: "Profile" },
  loader: async ({ context }) => {
    const { queryClient, betterAuth, trpc } = context;
    await Promise.all([
      queryClient.ensureQueryData(trpc.settings.get.queryOptions()),
      queryClient.ensureQueryData(betterAuth.getSession.queryOptions()),
      queryClient.ensureQueryData(betterAuth.organization.getFullOrganization.queryOptions()),
      queryClient.ensureQueryData(betterAuth.listSessions.queryOptions()),
      queryClient.ensureQueryData(betterAuth.listAccounts.queryOptions()),
    ]);
  },
  pendingComponent: ProfilePageLoading,
  component: ProfilePage,
});

function PageHeader() {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your personal information, sessions and security.
      </p>
    </header>
  );
}

function ProfilePageLoading() {
  return (
    <div className="max-w-4xl px-6 py-8">
      <PageHeader />

      <div className="flex flex-col gap-6">
        <ProfileHeaderSectionSkeleton />
        <PersonalInformationSectionSkeleton />
        <SessionListSectionSkeleton />
        <SecuritySectionSkeleton />
        <ProfileLogoutSectionSkeleton />
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="max-w-4xl px-6 py-8">
      <PageHeader />

      <div className="flex flex-col gap-6">
        <ProfileHeaderSection />
        <PersonalInformationSection />
        <SessionListSection />
        <SecuritySection />
        <ProfileLogoutSection />
      </div>
    </div>
  );
}
