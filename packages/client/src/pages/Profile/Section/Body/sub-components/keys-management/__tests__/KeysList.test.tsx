// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Bug 82819: the "This device" badge marked a key on every device of the
 * profile, not on the device that actually holds it. Adoption is recorded per
 * device in localStorage (active-key-preference), so the badge has to follow
 * that record — and any key this device has not adopted must offer
 * "Use on this device", including when the profile has a single key.
 *
 * Heavy UI-kit components are replaced with lightweight stand-ins that expose
 * their label so the rendered variant can be asserted.
 */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@docspace/ui-kit/components/badge", () => ({
  Badge: ({ label }: { label?: string }) =>
    React.createElement("span", { "data-testid": "badge" }, label),
}));

vi.mock("@docspace/ui-kit/components/button", () => ({
  Button: ({ label, onClick }: { label?: string; onClick?: () => void }) =>
    React.createElement("button", { "data-testid": "button", onClick }, label),
  ButtonSize: { extraSmall: "extraSmall" },
}));

vi.mock("@docspace/ui-kit/components/icon-button", () => ({
  IconButton: ({ title }: { title?: string }) =>
    React.createElement("span", { "data-testid": "icon-button" }, title),
}));

vi.mock("@docspace/shared/services/encryption/identity", () => ({
  getPublicKeyFingerprint: vi.fn(async () => "FINGERPRINT"),
}));

// The provider adopts the only key on any device, which is what produced the
// wrong badge; keep that state so the test fails for the reported reason.
vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({ publicKey: "pub-a" }),
}));

import { KeysList } from "../KeysList";

const keyA = {
  id: "a",
  publicKey: "pub-a",
  privateKeyEnc: "enc-a",
  date: "",
} as never;
const keyB = {
  id: "b",
  publicKey: "pub-b",
  privateKeyEnc: "enc-b",
  date: "",
} as never;

const renderList = (keys: never[], activeKeyId: string | null) =>
  render(
    <KeysList
      keys={keys}
      activeKeyId={activeKeyId}
      onDelete={vi.fn()}
      onExport={vi.fn()}
      onRotate={vi.fn()}
      onSelectActive={vi.fn()}
      isDeleting={false}
      deletingKeyId={null}
    />,
  );

const rows = () => screen.getAllByTestId("key_details");

describe("KeysList — the 'This device' marker", () => {
  it("marks only the key this device adopted", () => {
    renderList([keyA, keyB], "a");

    expect(within(rows()[0]).getByText("Common:ThisDevice")).toBeInTheDocument();
    expect(within(rows()[0]).queryByTestId("button")).not.toBeInTheDocument();

    expect(within(rows()[1]).getByTestId("button")).toHaveTextContent(
      "Common:UseOnThisDevice",
    );
  });

  it("offers adoption for a single key the device has not adopted", () => {
    renderList([keyA], null);

    expect(within(rows()[0]).getByTestId("button")).toHaveTextContent(
      "Common:UseOnThisDevice",
    );
    expect(
      within(rows()[0]).queryByText("Common:ThisDevice"),
    ).not.toBeInTheDocument();
  });

  it("marks a single key that this device did adopt", () => {
    renderList([keyA], "a");

    expect(within(rows()[0]).getByText("Common:ThisDevice")).toBeInTheDocument();
    expect(within(rows()[0]).queryByTestId("button")).not.toBeInTheDocument();
  });

  it("offers adoption for every key when the device adopted none", () => {
    renderList([keyA, keyB], null);

    for (const row of rows()) {
      expect(within(row).getByTestId("button")).toHaveTextContent(
        "Common:UseOnThisDevice",
      );
      expect(within(row).queryByText("Common:ThisDevice")).not.toBeInTheDocument();
    }
  });
});
