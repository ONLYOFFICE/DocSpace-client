// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { KeyRotationDialog } from "../KeyRotationDialog";
import { ResetKeysConfirmDialog } from "../ResetKeysConfirmDialog";

// Spec: private-rooms/key-management, "Key dialogs are accessible and adapt
// to narrow screens".

const dialogs = [
  {
    name: "passphrase change",
    title: "Common:ChangePassphrase",
    element: () => (
      <KeyRotationDialog visible onSubmit={vi.fn()} onCancel={vi.fn()} />
    ),
  },
  {
    name: "reset",
    title: "Common:ResetEncryptionKeysTitle",
    element: () => (
      <ResetKeysConfirmDialog visible onConfirm={vi.fn()} onCancel={vi.fn()} />
    ),
  },
];

const originalWidth = window.innerWidth;
const setWidth = (width: number) =>
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });

beforeAll(() => {
  // The strength tooltip mounts floating-ui, which jsdom does not provide.
  globalThis.ResizeObserver = class {
    observe() {}

    unobserve() {}

    disconnect() {}
  };
});

afterEach(() => setWidth(originalWidth));

describe("keys management dialogs", () => {
  for (const dialog of dialogs) {
    it(`Screen reader: the ${dialog.name} dialog is announced with its title`, () => {
      render(dialog.element());
      expect(
        screen.getByRole("dialog", { name: dialog.title }),
      ).toBeInTheDocument();
    });

    it(`Mobile viewport: the ${dialog.name} dialog opens as an aside panel`, () => {
      setWidth(375);
      const { baseElement } = render(dialog.element());
      expect(
        baseElement.querySelector("[class*='displayTypeAside']"),
      ).not.toBeNull();
    });
  }

  it("Screen reader: the reset field is named by the instruction above it", () => {
    render(dialogs[1].element());
    expect(
      screen.getByRole("textbox", {
        name: "Common:ResetEncryptionKeysConfirmation",
      }),
    ).toBeInTheDocument();
  });
});
