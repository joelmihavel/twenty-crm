"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  Copy01,
  Eye,
  EyeOff,
  Check,
  User01,
  Palette,
  Key01,
  Users01,
  Camera01,
  Mail01,
  Trash02,
  RefreshCw01,
  AlertCircle,
  Send01,
} from "@untitledui/icons";
import { useWorkspaceMember, updateMember, uploadProfilePicture } from "@/lib/hooks/use-workspace-member";
import {
  useWorkspaceMembers,
  useWorkspaceInvitations,
  sendInvitation,
  deleteInvitation,
  removeMember,
} from "@/lib/hooks/use-workspace-members";
import { useToast } from "@/lib/hooks/use-toast";
import { useClipboard } from "@/hooks/use-clipboard";
import { getEffectiveApiKey } from "@/lib/auth";
import { Tabs, TabList, Tab, TabPanel } from "@/components/application/tabs/tabs";
import { Input } from "@/components/base/input/input";
import { Avatar } from "@/components/base/avatar/avatar";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { Toggle } from "@/components/base/toggle/toggle";
import { Button } from "@/components/base/buttons/button";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { DialogTrigger, ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { Breadcrumbs } from "@/components/views/breadcrumbs";

// ─── Profile Section (Editable) ──────────────────────────────────────

function ProfileSection() {
  const { member, setMember, loading, error } = useWorkspaceMember();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state when member loads
  useEffect(() => {
    if (member) {
      setFirstName(member.name.firstName);
      setLastName(member.name.lastName);
    }
  }, [member]);

  const hasChanges = useMemo(() => {
    if (!member) return false;
    return (
      firstName !== member.name.firstName ||
      lastName !== member.name.lastName
    );
  }, [member, firstName, lastName]);

  const handleSave = useCallback(async () => {
    if (!member || !hasChanges) return;
    setSaving(true);
    try {
      const updated = await updateMember(member.id, {
        name: { firstName, lastName },
      });
      setMember(updated);
      toast("Profile updated successfully", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Failed to update profile",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }, [member, firstName, lastName, hasChanges, setMember, toast]);

  const handleAvatarUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !member) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast("Please select an image file", "error");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast("Image must be under 5MB", "error");
        return;
      }

      setUploading(true);
      try {
        const result = await uploadProfilePicture(file);
        // Update member with new avatar URL
        const updated = await updateMember(member.id, {
          avatarUrl: result.url,
        });
        setMember(updated);
        toast("Profile photo updated", "success");
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Failed to upload photo",
          "error",
        );
      } finally {
        setUploading(false);
        // Reset input so the same file can be re-selected
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [member, setMember, toast],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingIndicator size="md" label="Loading profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-error bg-error-primary/5 p-4">
        <p className="text-sm text-error-primary">
          Failed to load profile: {error.message}
        </p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-lg border border-secondary bg-secondary p-4">
        <p className="text-sm text-tertiary">
          No workspace member found. You may be using an API key without user context.
        </p>
      </div>
    );
  }

  const fullName = [member.name.firstName, member.name.lastName]
    .filter(Boolean)
    .join(" ");

  const initials = [member.name.firstName?.[0], member.name.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar with upload */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="group relative">
          <Avatar
            size="2xl"
            src={member.avatarUrl}
            alt={fullName}
            initials={initials}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-overlay/50 opacity-0 transition duration-100 ease-linear group-hover:opacity-100 disabled:cursor-not-allowed"
            aria-label="Change profile photo"
          >
            {uploading ? (
              <LoadingIndicator size="sm" />
            ) : (
              <Camera01 className="size-5 text-white" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            aria-label="Upload profile photo"
          />
        </div>
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <h3 className="text-lg font-semibold text-primary">
            {fullName || "Unnamed"}
          </h3>
          <p className="text-sm text-tertiary">{member.userEmail}</p>
          <p className="text-xs text-quaternary">
            Locale: {member.locale || "en"}
          </p>
        </div>
      </div>

      {/* Editable profile fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="First Name"
          value={firstName}
          onChange={setFirstName}
          placeholder="First name"
          size="sm"
        />
        <Input
          label="Last Name"
          value={lastName}
          onChange={setLastName}
          placeholder="Last name"
          size="sm"
        />
        <Input
          label="Email"
          value={member.userEmail}
          isDisabled
          size="sm"
          type="email"
        />
        <Input
          label="Locale"
          value={member.locale || "en"}
          isDisabled
          size="sm"
        />
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          size="sm"
          color="primary"
          iconLeading={Check}
          isDisabled={!hasChanges}
          isLoading={saving}
          showTextWhileLoading
          onClick={handleSave}
        >
          Save Profile
        </Button>
      </div>
    </div>
  );
}

// ─── Theme Section ───────────────────────────────────────────────────

function ThemeSection() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingIndicator size="sm" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-secondary p-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-medium text-secondary">Dark mode</h4>
            <p className="text-sm text-tertiary">
              Toggle between light and dark color schemes.
            </p>
          </div>
          <Toggle
            isSelected={isDark}
            onChange={() => setTheme(isDark ? "light" : "dark")}
            size="md"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-secondary p-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-medium text-secondary">System preference</h4>
            <p className="text-sm text-tertiary">
              Follow your operating system theme setting.
            </p>
          </div>
          <Toggle
            isSelected={theme === "system"}
            onChange={() => setTheme(theme === "system" ? (isDark ? "dark" : "light") : "system")}
            size="md"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div
          className={`flex-1 cursor-pointer rounded-lg border-2 p-4 transition duration-100 ease-linear ${
            !isDark ? "border-brand" : "border-secondary hover:border-tertiary"
          }`}
          onClick={() => setTheme("light")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setTheme("light");
          }}
        >
          <div className="mb-3 rounded-md bg-white p-3 shadow-sm ring-1 ring-gray-200">
            <div className="h-2 w-12 rounded bg-gray-300" />
            <div className="mt-2 h-2 w-8 rounded bg-gray-200" />
          </div>
          <p className="text-sm font-medium text-secondary">Light</p>
        </div>
        <div
          className={`flex-1 cursor-pointer rounded-lg border-2 p-4 transition duration-100 ease-linear ${
            isDark ? "border-brand" : "border-secondary hover:border-tertiary"
          }`}
          onClick={() => setTheme("dark")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setTheme("dark");
          }}
        >
          <div className="mb-3 rounded-md bg-gray-800 p-3 shadow-sm ring-1 ring-gray-700">
            <div className="h-2 w-12 rounded bg-gray-600" />
            <div className="mt-2 h-2 w-8 rounded bg-gray-700" />
          </div>
          <p className="text-sm font-medium text-secondary">Dark</p>
        </div>
      </div>
    </div>
  );
}

// ─── API Key Section ─────────────────────────────────────────────────

function ApiKeySection() {
  const [isVisible, setIsVisible] = useState(false);
  const { copy, copied } = useClipboard();
  const { toast } = useToast();

  const apiKey = getEffectiveApiKey();

  const maskedKey = useMemo(() => {
    if (!apiKey) return "No API key configured";
    if (apiKey.length <= 8) return "****";
    return apiKey.slice(0, 4) + "..." + apiKey.slice(-4);
  }, [apiKey]);

  const handleCopy = useCallback(async () => {
    if (!apiKey) return;
    const result = await copy(apiKey, "api-key");
    if (result.success) {
      toast("API key copied to clipboard", "success");
    } else {
      toast("Failed to copy API key", "error");
    }
  }, [apiKey, copy, toast]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-secondary p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-medium text-secondary">Current API Key</h4>
            <p className="text-sm text-tertiary">
              This key is used to authenticate requests to your Twenty workspace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg bg-secondary px-3 py-2 font-mono text-sm text-secondary">
              {isVisible ? apiKey || "Not set" : maskedKey}
            </div>
            <Button
              size="sm"
              color="secondary"
              iconLeading={isVisible ? EyeOff : Eye}
              onClick={() => setIsVisible(!isVisible)}
              aria-label={isVisible ? "Hide API key" : "Show API key"}
            />
            <Button
              size="sm"
              color={copied === "api-key" ? "primary" : "secondary"}
              iconLeading={copied === "api-key" ? Check : Copy01}
              onClick={handleCopy}
              isDisabled={!apiKey}
              aria-label="Copy API key"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-secondary bg-secondary/50 p-4">
        <h4 className="text-sm font-medium text-secondary">API Endpoint</h4>
        <p className="mt-1 font-mono text-xs text-tertiary">
          {process.env.NEXT_PUBLIC_TWENTY_GRAPHQL_URL || "https://hawkeye.flent.in/graphql"}
        </p>
      </div>

      <p className="text-xs text-quaternary">
        API keys can be managed in your Twenty workspace settings. Navigate to Settings &gt; API Keys in your Twenty instance.
      </p>
    </div>
  );
}

// ─── Members Section ─────────────────────────────────────────────────

function MembersSection() {
  const { members, loading: membersLoading, error: membersError, refetch: refetchMembers } = useWorkspaceMembers();
  const { invitations, loading: invitationsLoading, error: invitationsError, refetch: refetchInvitations } = useWorkspaceInvitations();
  const { toast } = useToast();

  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const handleSendInvite = useCallback(async () => {
    if (!inviteEmail.trim()) return;

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) {
      toast("Please enter a valid email address", "error");
      return;
    }

    setSendingInvite(true);
    try {
      await sendInvitation(inviteEmail.trim());
      toast(`Invitation sent to ${inviteEmail.trim()}`, "success");
      setInviteEmail("");
      refetchInvitations();
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Failed to send invitation",
        "error",
      );
    } finally {
      setSendingInvite(false);
    }
  }, [inviteEmail, toast, refetchInvitations]);

  const handleRevokeInvitation = useCallback(
    async (id: string) => {
      setRevokingId(id);
      try {
        await deleteInvitation(id);
        toast("Invitation revoked", "success");
        refetchInvitations();
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Failed to revoke invitation",
          "error",
        );
      } finally {
        setRevokingId(null);
      }
    },
    [toast, refetchInvitations],
  );

  const handleResendInvitation = useCallback(
    async (email: string, id: string) => {
      // Revoke old, then resend
      setRevokingId(id);
      try {
        await deleteInvitation(id);
        await sendInvitation(email);
        toast(`Invitation resent to ${email}`, "success");
        refetchInvitations();
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Failed to resend invitation",
          "error",
        );
      } finally {
        setRevokingId(null);
      }
    },
    [toast, refetchInvitations],
  );

  const handleRemoveMember = useCallback(
    async (id: string) => {
      setRemovingId(id);
      try {
        await removeMember(id);
        toast("Member removed from workspace", "success");
        setConfirmRemoveId(null);
        refetchMembers();
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Failed to remove member",
          "error",
        );
      } finally {
        setRemovingId(null);
      }
    },
    [toast, refetchMembers],
  );

  const loading = membersLoading || invitationsLoading;
  const error = membersError || invitationsError;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingIndicator size="md" label="Loading members..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-error bg-error-primary/5 p-4">
        <p className="text-sm text-error-primary">
          Failed to load members: {error.message}
        </p>
      </div>
    );
  }

  const memberToRemove = members.find((m) => m.id === confirmRemoveId);

  return (
    <div className="flex flex-col gap-6">
      {/* Invite new member */}
      <div className="rounded-lg border border-secondary p-4">
        <h4 className="mb-3 text-sm font-medium text-secondary">
          Invite a new member
        </h4>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              icon={Mail01}
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={setInviteEmail}
              size="sm"
              type="email"
              aria-label="Email address to invite"
            />
          </div>
          <Button
            size="sm"
            color="primary"
            iconLeading={Send01}
            isLoading={sendingInvite}
            showTextWhileLoading
            isDisabled={!inviteEmail.trim()}
            onClick={handleSendInvite}
          >
            Send Invite
          </Button>
        </div>
      </div>

      {/* Active members */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-secondary">
          Active members ({members.length})
        </h4>
        <div className="divide-y divide-secondary rounded-lg border border-secondary">
          {members.length === 0 ? (
            <div className="p-4 text-center text-sm text-tertiary">
              No members found.
            </div>
          ) : (
            members.map((m) => {
              const memberName = [m.name.firstName, m.name.lastName]
                .filter(Boolean)
                .join(" ");
              const memberInitials = [m.name.firstName?.[0], m.name.lastName?.[0]]
                .filter(Boolean)
                .join("")
                .toUpperCase();

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3"
                >
                  <AvatarLabelGroup
                    size="sm"
                    src={m.avatarUrl ?? undefined}
                    alt={memberName}
                    initials={memberInitials}
                    title={memberName || "Unnamed"}
                    subtitle={m.userEmail}
                  />
                  <div className="flex items-center gap-2">
                    <BadgeWithDot color="success" size="sm">
                      Active
                    </BadgeWithDot>
                    <Button
                      size="xs"
                      color="tertiary-destructive"
                      iconLeading={Trash02}
                      onClick={() => setConfirmRemoveId(m.id)}
                      aria-label={`Remove ${memberName}`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pending invitations */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-secondary">
          Pending invitations ({invitations.length})
        </h4>
        <div className="divide-y divide-secondary rounded-lg border border-secondary">
          {invitations.length === 0 ? (
            <div className="p-4 text-center text-sm text-tertiary">
              No pending invitations.
            </div>
          ) : (
            invitations.map((inv) => {
              const isExpired = new Date(inv.expiresAt) < new Date();
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar
                      size="sm"
                      placeholderIcon={Mail01}
                      alt={inv.email}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-primary">
                        {inv.email}
                      </p>
                      <p className="text-xs text-quaternary">
                        {isExpired
                          ? "Expired"
                          : `Expires ${new Date(inv.expiresAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeWithDot
                      color={isExpired ? "error" : "warning"}
                      size="sm"
                    >
                      {isExpired ? "Expired" : "Pending"}
                    </BadgeWithDot>
                    <Button
                      size="xs"
                      color="secondary"
                      iconLeading={RefreshCw01}
                      isLoading={revokingId === inv.id}
                      onClick={() => handleResendInvitation(inv.email, inv.id)}
                      aria-label={`Resend invitation to ${inv.email}`}
                    >
                      Resend
                    </Button>
                    <Button
                      size="xs"
                      color="tertiary-destructive"
                      iconLeading={Trash02}
                      isLoading={revokingId === inv.id}
                      onClick={() => handleRevokeInvitation(inv.id)}
                      aria-label={`Revoke invitation for ${inv.email}`}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Remove member confirmation dialog */}
      {confirmRemoveId && memberToRemove && (
        <DialogTrigger isOpen onOpenChange={(open) => { if (!open) setConfirmRemoveId(null); }}>
          <ModalOverlay isDismissable>
            <Modal className="max-w-md">
              <Dialog>
                <div className="flex w-full flex-col gap-5 rounded-xl bg-primary p-6 shadow-xl">
                  <div className="flex flex-col gap-2">
                    <div className="flex size-12 items-center justify-center rounded-full bg-error-secondary">
                      <AlertCircle className="size-6 text-fg-error-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary">
                      Remove member
                    </h3>
                    <p className="text-sm text-tertiary">
                      Are you sure you want to remove{" "}
                      <span className="font-medium text-secondary">
                        {[memberToRemove.name.firstName, memberToRemove.name.lastName]
                          .filter(Boolean)
                          .join(" ") || memberToRemove.userEmail}
                      </span>{" "}
                      from this workspace? This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      size="sm"
                      color="secondary"
                      onClick={() => setConfirmRemoveId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      color="primary-destructive"
                      iconLeading={Trash02}
                      isLoading={removingId === confirmRemoveId}
                      showTextWhileLoading
                      onClick={() => handleRemoveMember(confirmRemoveId)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Dialog>
            </Modal>
          </ModalOverlay>
        </DialogTrigger>
      )}
    </div>
  );
}

// ─── Settings Page ───────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col">
      <Breadcrumbs
        segments={[{ label: "Settings" }]}
        className="border-b border-secondary"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-primary sm:text-2xl">Settings</h1>
            <p className="mt-1 text-sm text-tertiary">
              Manage your profile, appearance, team members, and API configuration.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultSelectedKey="profile">
            <TabList type="underline" size="sm">
              <Tab id="profile" icon={User01}>
                Profile
              </Tab>
              <Tab id="theme" icon={Palette}>
                Appearance
              </Tab>
              <Tab id="members" icon={Users01}>
                Members
              </Tab>
              <Tab id="api" icon={Key01}>
                API
              </Tab>
            </TabList>

            <TabPanel id="profile" className="pt-6">
              <ProfileSection />
            </TabPanel>

            <TabPanel id="theme" className="pt-6">
              <ThemeSection />
            </TabPanel>

            <TabPanel id="members" className="pt-6">
              <MembersSection />
            </TabPanel>

            <TabPanel id="api" className="pt-6">
              <ApiKeySection />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
