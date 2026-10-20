// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Heavy UI-kit components are replaced with lightweight stand-ins that expose
 * their label so the rendered variant can be asserted.
 */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@onlyoffice/apps-ui-kit/components/badge", () => ({
  Badge: ({ label }: { label?: string }) =>
    React.createElement("span", { "data-testid": "badge" }, label),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/icon-button", () => ({
  IconButton: ({ title }: { title?: string }) =>
    React.createElement("span", { "data-testid": "icon-button" }, title),
}));

vi.mock("@docspace/shared/services/encryption/identity", () => ({
  getPublicKeyFingerprint: vi.fn(async () => "FINGERPRINT"),
}));

import { KeysList } from "../KeysList";

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

const renderList = (keys: never[]) =>
  render(
    <KeysList
      keys={keys}
      onDelete={vi.fn()}
      onExport={vi.fn()}
      onRotate={vi.fn()}
      isDeleting={false}
      deletingKeyId={null}
    />,
  );

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
});
