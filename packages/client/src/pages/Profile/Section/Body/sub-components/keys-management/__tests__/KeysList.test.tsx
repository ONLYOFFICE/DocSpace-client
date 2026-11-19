// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Heavy UI-kit components are replaced with lightweight stand-ins that expose
 * their label so the rendered variant can be asserted.
 */

import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@onlyoffice/apps-ui-kit/components/badge", () => ({
  Badge: ({
    label,
    backgroundColor,
    color,
  }: {
    label?: string;
    backgroundColor?: string;
    color?: string;
  }) =>
    React.createElement(
      "span",
      {
        "data-testid": "badge",
        "data-background": backgroundColor,
        "data-color": color,
      },
      label,
    ),
}));

vi.mock("@docspace/shared/services/encryption/identity", () => ({
  getPublicKeyFingerprint: vi.fn(async () => "0123456789ABCDEF".repeat(4)),
}));

import { KeysList } from "../KeysList";

// The mocked fingerprint: 64 hexadecimal characters, as a SHA-256 is.
const FINGERPRINT = "0123456789ABCDEF".repeat(4);
const GROUPED = FINGERPRINT.match(/.{8}/g)!.join(" ");
import { KEY_STATUS_BADGE_COLORS } from "../keyStatusBadgeColors";

const keyOld = {
  id: "old",
  publicKey: "pub-old",
  privateKeyEnc: "enc-old",
  date: "2026-01-01T00:00:00",
} as never;
const keyNew = {
  id: "new",
  publicKey: "pub-new",
  privateKeyEnc: "enc-new",
  date: "2026-10-01T00:00:00",
} as never;

type ListProps = React.ComponentProps<typeof KeysList>;

const renderList = (keys: never[], props: Partial<ListProps> = {}) => {
  const onDelete = vi.fn();
  const onExport = vi.fn();
  const onRotate = vi.fn();

  render(
    <KeysList
      keys={keys}
      onDelete={onDelete}
      onExport={onExport}
      onRotate={onRotate}
      isDeleting={false}
      deletingKeyId={null}
      {...props}
    />,
  );

  return { onDelete, onExport, onRotate };
};

const action = (name: string) => screen.getByRole("button", { name });

// WCAG 2.x relative luminance and contrast ratio of two "#rrggbb" colours.
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5]
    .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

describe("Key status badges are readable", () => {
  it.each(Object.entries(KEY_STATUS_BADGE_COLORS))(
    "%s badge has a contrast of at least 4.5:1",
    (_name, { background, text }) => {
      expect(contrast(background, text)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("Active key: the badge is drawn with its pair of colours", () => {
    renderList([keyNew]);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveAttribute(
      "data-background",
      KEY_STATUS_BADGE_COLORS.active.background,
    );
    // The kit forces white on a badge text without a colour of its own.
    expect(badge).toHaveAttribute("data-color", KEY_STATUS_BADGE_COLORS.active.text);
  });

  it("No key: the badge is drawn with its pair of colours", () => {
    renderList([]);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveAttribute(
      "data-background",
      KEY_STATUS_BADGE_COLORS.noKey.background,
    );
    // The kit forces white on a badge text without a colour of its own.
    expect(badge).toHaveAttribute("data-color", KEY_STATUS_BADGE_COLORS.noKey.text);
  });
});

describe("KeysList", () => {
  it("shows the no-key state when the user has no key", () => {
    renderList([]);
    expect(screen.getByText("Common:NoEncryptionKey")).toBeInTheDocument();
    expect(screen.queryByTestId("key_details")).not.toBeInTheDocument();
  });

  it("Own key with leftover envelopes: shows one card, for the key with the newer date", async () => {
    renderList([keyNew, keyOld]);

    const cards = screen.getAllByTestId("key_details");
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByText("new")).toBeInTheDocument();
    expect(screen.queryByText("Common:ThisDevice")).not.toBeInTheDocument();
  });

  it("Tab across the key card", async () => {
    const user = userEvent.setup();
    renderList([keyNew]);

    await user.tab();
    expect(action("Common:ChangePassphrase")).toHaveFocus();
    await user.tab();
    expect(action("Common:ExportKey")).toHaveFocus();
    await user.tab();
    expect(action("Common:Delete")).toHaveFocus();
  });

  it("Key card actions announced", () => {
    renderList([keyNew]);

    // title reaches the DOM only under NODE_ENV=test, so the name is read from
    // aria-label itself.
    expect(
      within(screen.getByTestId("key_actions"))
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Common:ChangePassphrase", "Common:ExportKey", "Common:Delete"]);
    // The Details disclosure is a button of the card, not one of its actions.
    expect(
      within(screen.getByTestId("key_details")).getAllByRole("button"),
    ).toHaveLength(4);
    expect(
      within(screen.getByTestId("key_actions")).queryByRole("button", {
        name: "Common:Details",
      }),
    ).toBeNull();
  });

  it("Action disabled during a deletion", async () => {
    const user = userEvent.setup();
    renderList([keyNew], { isDeleting: true, deletingKeyId: "new" });

    await user.tab();

    expect(document.body).toHaveFocus();
  });

  it("Delete from the keyboard", async () => {
    const user = userEvent.setup();
    const { onDelete, onExport, onRotate } = renderList([keyNew]);

    action("Common:Delete").focus();
    await user.keyboard(" ");
    action("Common:ExportKey").focus();
    await user.keyboard("{Enter}");

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(keyNew);
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onRotate).not.toHaveBeenCalled();
  });
});

describe("The fingerprint says what it is for", () => {
  it("Hint shown", async () => {
    renderList([keyNew]);

    const fingerprint = await screen.findByTestId("key_fingerprint");
    expect(fingerprint).toHaveTextContent(GROUPED);
    expect(screen.getByText("Common:KeyFingerprintHint")).toBeVisible();
    expect(fingerprint).toHaveAccessibleDescription("Common:KeyFingerprintHint");
  });
});

describe("Technical key details are folded", () => {
  const toggle = () =>
    screen.getByRole("button", { name: "Common:Details" });

  it("Page opens", async () => {
    renderList([keyNew]);

    expect(await screen.findByTestId("key_fingerprint")).toHaveTextContent(
      GROUPED,
    );
    expect(screen.getByTestId("key_fingerprint")).toBeVisible();
    expect(screen.getByText("Common:KeyCreatedOn")).toBeVisible();
    expect(screen.getByTestId("badge")).toBeVisible();
    expect(screen.getByText("new")).not.toBeVisible();
    expect(screen.getByText("X25519")).not.toBeVisible();
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(toggle()).toHaveAttribute(
      "aria-controls",
      screen.getByTestId("key_details_more").id,
    );
  });

  it("Details opened", async () => {
    const user = userEvent.setup();
    renderList([keyNew]);

    await user.click(toggle());
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("new")).toBeVisible();
    expect(screen.getByText("X25519")).toBeVisible();

    toggle().focus();
    await user.keyboard("{Enter}");
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("X25519")).not.toBeVisible();

    await user.keyboard(" ");
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("X25519")).toBeVisible();
  });
});

describe("Key fingerprint is shown in groups", () => {
  it("Grouped fingerprint", async () => {
    renderList([keyNew]);

    const fingerprint = await screen.findByTestId("key_fingerprint");
    await waitFor(() => expect(fingerprint).toHaveTextContent(GROUPED));
    const groups = within(fingerprint)
      .getAllByTestId("key_fingerprint_group")
      .map((group) => group.textContent);
    expect(groups).toHaveLength(8);
    expect(groups.join("")).toBe(FINGERPRINT);
    for (const group of groups) expect(group).toHaveLength(8);
  });
});

describe("Keys management shows whether the key is locked", () => {
  it("Locked key: the heading names the state and says what unlocking gives", () => {
    renderList([keyNew], { keyState: "locked" });

    expect(screen.getByTestId("key_lock_state")).toHaveTextContent(
      "Common:KeyLocked",
    );
    expect(screen.getByTestId("key_locked_note")).toHaveTextContent(
      "Common:PrivateRoomLockedBarText",
    );
  });

  it("Unlocked key: the state is named and nothing is asked", () => {
    renderList([keyNew], { keyState: "unlocked" });

    expect(screen.getByTestId("key_lock_state")).toHaveTextContent(
      "Common:KeyUnlocked",
    );
    expect(screen.queryByTestId("key_locked_note")).toBeNull();
  });

  it("User without a key: no state beside the heading", () => {
    renderList([], { keyState: undefined });

    expect(screen.queryByTestId("key_lock_state")).toBeNull();
  });
});
