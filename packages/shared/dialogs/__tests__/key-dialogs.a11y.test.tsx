// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { KeyChangeDialog } from "../key-change-dialog";
import { RecoveryPhraseDisplayModal } from "../key-generation/RecoveryPhraseDisplayModal";
import { RecoveryPhraseInputModal } from "../key-recovery/RecoveryPhraseInputModal";
import { PassphraseModal } from "../passphrase-modal/PassphraseModal";

// Spec: private-rooms/key-management, "Key dialogs are accessible and adapt
// to narrow screens".

const KEY = btoa(String.fromCharCode(...new Uint8Array(32).fill(7)));
const MNEMONIC = Array.from({ length: 24 }, () => "abandon").join(" ");

const dialogs = [
  {
    name: "passphrase",
    title: "Common:EnterPassphrase",
    element: () => (
      <PassphraseModal
        visible
        isNew={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        showRememberDevice
      />
    ),
  },
  {
    name: "recovery phrase display",
    title: "Common:RecoveryPhraseTitle",
    element: () => (
      <RecoveryPhraseDisplayModal
        visible
        mnemonic={MNEMONIC}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    ),
  },
  {
    name: "recovery phrase input",
    title: "Common:UseRecoveryPhrase",
    element: () => (
      <RecoveryPhraseInputModal visible onSubmit={vi.fn()} onCancel={vi.fn()} />
    ),
  },
  {
    name: "key change",
    title: "Common:KeyChangedTitle",
    element: () => (
      <KeyChangeDialog
        visible
        userId="peer-1"
        displayName="Alice"
        knownPublicKey={KEY}
        newPublicKey={KEY}
        knownFirstSeenAt={1000}
        knownLastSeenAt={2000}
        onAccept={vi.fn()}
        onRefuse={vi.fn()}
      />
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

describe("key dialogs", () => {
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

    it(`Opened as an aside panel: the ${dialog.name} dialog takes the focus`, () => {
      setWidth(375);
      const { baseElement } = render(dialog.element());
      const panel = baseElement.querySelector<HTMLElement>(
        "[class*='displayTypeAside']",
      );
      expect(panel).toContainElement(document.activeElement as HTMLElement);
    });

    it(`Wide screen: the ${dialog.name} dialog stays a centred modal`, () => {
      setWidth(1440);
      const { baseElement } = render(dialog.element());
      expect(
        baseElement.querySelector("[class*='displayTypeAside']"),
      ).toBeNull();
    });
  }

  it("Passphrase field", () => {
    render(
      <PassphraseModal visible isNew onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );
    const dialog = within(
      screen.getByRole("dialog", { name: "Common:CreatePassphrase" }),
    );

    for (const [name, label] of [
      ["passphrase", "Common:Passphrase"],
      ["confirmPassphrase", "Common:ConfirmPassphrase"],
    ]) {
      const field = dialog.getByLabelText<HTMLInputElement>(label);
      expect(field).toHaveAttribute("name", name);
      expect(field).toHaveAccessibleName(label);
      expect(field.labels).toHaveLength(1);
    }
  });

  it("Screen reader: the passphrase dialog names its actions", () => {
    render(dialogs[0].element());

    expect(
      screen.getByRole("checkbox", { name: "Common:RememberDeviceLabel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Common:ContinueButton" }),
    ).toBeInTheDocument();
  });

  it("Screen reader: the recovery phrase field is named by the hint above it", () => {
    render(dialogs[2].element());
    expect(
      screen.getByRole("textbox", { name: "Common:RecoveryPhraseInputHint" }),
    ).toBeInTheDocument();
  });
});
