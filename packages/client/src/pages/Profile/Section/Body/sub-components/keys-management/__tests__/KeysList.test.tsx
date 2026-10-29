// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Heavy UI-kit components are replaced with lightweight stand-ins that expose
 * their label so the rendered variant can be asserted.
 */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@onlyoffice/apps-ui-kit/components/badge", () => ({
  Badge: ({ label }: { label?: string }) =>
    React.createElement("span", { "data-testid": "badge" }, label),
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
      within(screen.getByTestId("key_details"))
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Common:ChangePassphrase", "Common:ExportKey", "Common:Delete"]);
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
