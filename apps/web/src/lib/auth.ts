import type { MutationKey } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/client";
import { organizationClient } from "better-auth/client/plugins";
import { createContext, useContext } from "react";
import { BETTER_AUTH_API_URL } from "@/lib/bff";
import { createReactQueryMethod } from "@/lib/react-query.utils";

export const betterAuthClient = createAuthClient({
  baseURL: BETTER_AUTH_API_URL,
  plugins: [organizationClient()],
});

export type Session = typeof betterAuthClient.$Infer.Session;
export type User = (typeof betterAuthClient.$Infer.Session)["user"];

export type Organization = typeof betterAuthClient.$Infer.Organization;
export type Invitation = typeof betterAuthClient.$Infer.Invitation;
export type Member = typeof betterAuthClient.$Infer.Member;

export type BetterAuth = typeof betterAuth;
export const betterAuth = {
  getSession: createReactQueryMethod({
    key: ["getSession"],
    query: () => betterAuthClient.getSession(),
  }),

  signIn: {
    email: createReactQueryMethod({
      key: ["signIn", "email"],
      mutate: (args: {
        email: string;
        password: string;
        rememberMe?: boolean;
        callbackURL?: string;
      }) => {
        return betterAuthClient.signIn.email(args);
      },
    }),

    social: Object.assign(
      (provider: "github" | "google") =>
        createReactQueryMethod({
          key: ["signIn", "social"],
          mutate: (args: {
            scopes?: string[];
            disableRedirect?: boolean;
            callbackURL?: string;
            newUserCallbackURL?: string;
            errorCallbackURL?: string;
            requestSignUp?: boolean;
            loginHint?: string;
            additionalData?: Record<string, unknown>;
          }) => {
            return betterAuthClient.signIn.social({ provider, ...args });
          },
        }),
      {
        mutationKey: (): MutationKey => ["signIn", "social"],
      },
    ),
  },

  signUp: {
    email: createReactQueryMethod({
      key: ["signUp", "email"],
      mutate: (args: {
        name: string;
        email: string;
        password: string;
        image?: string;
        callbackURL?: string;
      }) => {
        return betterAuthClient.signUp.email(args);
      },
    }),
  },

  signOut: createReactQueryMethod({
    key: ["signOut"],
    mutate: () => betterAuthClient.signOut(),
  }),

  requestPasswordReset: createReactQueryMethod({
    key: ["requestPasswordReset"],
    mutate: (args: { email: string; redirectTo?: string }) => {
      return betterAuthClient.requestPasswordReset(args);
    },
  }),

  resetPassword: createReactQueryMethod({
    key: ["resetPassword"],
    mutate: (args: { newPassword: string; token?: string }) => {
      return betterAuthClient.resetPassword(args);
    },
  }),

  updateUser: createReactQueryMethod({
    key: ["updateUser"],
    mutate: (args: { name?: string; image?: string | null }) => {
      return betterAuthClient.updateUser(args);
    },
  }),

  changeEmail: createReactQueryMethod({
    key: ["changeEmail"],
    mutate: (args: { newEmail: string; callbackURL?: string }) => {
      return betterAuthClient.changeEmail(args);
    },
  }),

  changePassword: createReactQueryMethod({
    key: ["changePassword"],
    mutate: (args: {
      currentPassword: string;
      newPassword: string;
      revokeOtherSessions?: boolean;
    }) => {
      return betterAuthClient.changePassword(args);
    },
  }),

  listSessions: createReactQueryMethod({
    key: ["listSessions"],
    query: () => betterAuthClient.listSessions(),
  }),

  revokeSession: createReactQueryMethod({
    key: ["revokeSession"],
    mutate: (args: { token: string }) => {
      return betterAuthClient.revokeSession(args);
    },
  }),

  revokeOtherSessions: createReactQueryMethod({
    key: ["revokeOtherSessions"],
    mutate: () => betterAuthClient.revokeOtherSessions(),
  }),

  listAccounts: createReactQueryMethod({
    key: ["listAccounts"],
    query: () => betterAuthClient.listAccounts(),
  }),

  linkSocial: Object.assign(
    (provider: "google" | "github") =>
      createReactQueryMethod({
        key: ["linkSocial", provider],
        mutate: (args: { callbackURL?: string }) => {
          return betterAuthClient.linkSocial({ provider, ...args });
        },
      }),
    {
      mutationKey: (): MutationKey => ["linkSocial"],
    },
  ),

  unlinkAccount: createReactQueryMethod({
    key: ["unlinkAccount"],
    mutate: (args: { providerId: string; accountId: string }) => {
      return betterAuthClient.unlinkAccount(args);
    },
  }),

  organization: {
    list: createReactQueryMethod({
      key: ["organization", "list"],
      query: () => {
        return betterAuthClient.organization.list();
      },
    }),

    getFullOrganization: createReactQueryMethod({
      key: ["organization", "getFullOrganization"],
      query: () => {
        return betterAuthClient.organization.getFullOrganization();
      },
    }),

    getActiveMember: createReactQueryMethod({
      key: ["organization", "getActiveMember"],
      query: () => {
        return betterAuthClient.organization.getActiveMember();
      },
    }),

    listUserInvitations: createReactQueryMethod({
      key: ["organization", "listUserInvitations"],
      query: () => {
        return betterAuthClient.organization.listUserInvitations();
      },
    }),

    setActive: createReactQueryMethod({
      key: ["organization", "setActive"],
      mutate: (args: { organizationId: string } | { organizationSlug: string }) => {
        return betterAuthClient.organization.setActive(args);
      },
    }),

    create: createReactQueryMethod({
      key: ["organization", "create"],
      mutate: (args: { name: string; slug: string }) => {
        return betterAuthClient.organization.create(args);
      },
    }),

    acceptInvitation: createReactQueryMethod({
      key: ["organization", "acceptInvitation"],
      mutate: (args: { invitationId: string }) => {
        return betterAuthClient.organization.acceptInvitation(args);
      },
    }),

    rejectInvitation: createReactQueryMethod({
      key: ["organization", "rejectInvitation"],
      mutate: (args: { invitationId: string }) => {
        return betterAuthClient.organization.rejectInvitation(args);
      },
    }),

    update: createReactQueryMethod({
      key: ["organization", "update"],
      mutate: (args: { data: { name?: string; slug?: string } }) => {
        return betterAuthClient.organization.update(args);
      },
    }),

    deleteOrganization: createReactQueryMethod({
      key: ["organization", "deleteOrganization"],
      mutate: (args: { organizationId: string }) => {
        return betterAuthClient.organization.delete(args);
      },
    }),

    inviteMember: createReactQueryMethod({
      key: ["organization", "inviteMember"],
      mutate: (args: { email: string; role: Member["role"] }) => {
        return betterAuthClient.organization.inviteMember(args);
      },
    }),

    removeMember: createReactQueryMethod({
      key: ["organization", "removeMember"],
      mutate: (args: { memberIdOrEmail: string }) => {
        return betterAuthClient.organization.removeMember(args);
      },
    }),

    cancelInvitation: createReactQueryMethod({
      key: ["organization", "cancelInvitation"],
      mutate: (args: { invitationId: string }) => {
        return betterAuthClient.organization.cancelInvitation(args);
      },
    }),
  },
};

const Context = createContext<typeof betterAuth | undefined>(undefined);

export const BetterAuthProvider = Context.Provider;

export function useBetterAuth() {
  const betterAuth = useContext(Context);
  if (!betterAuth) {
    throw new Error("Missing <BetterAuthProvider/>");
  }

  return betterAuth;
}
