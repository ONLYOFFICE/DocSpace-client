/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, render, screen } from "@testing-library/react";
import enCommon from "PUBLIC_DIR/locales/en/Common.json";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const captured = {
  setup: null as Record<string, unknown> | null,
};

// The props of the key setup dialog while it shows the given step.
const stepProps = (step: string) =>
  captured.setup?.step === step ? captured.setup : null;

vi.mock("../KeySetupDialog", () => ({
  KeySetupDialog: (props: Record<string, unknown>) => {
    captured.setup = props;
    useEffect(() => () => {
      captured.setup = null;
    }, []);
    return null;
  },
}));

// The shared mock echoes the key alone; the step counter is read from the
// interpolation values, so they are printed after it.
vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  const t = (key: string, options?: Record<string, unknown>) =>
    options ? `${key} ${JSON.stringify(options)}` : key;
  return { ...actual, useTranslation: () => ({ t, ready: true }) };
});

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

vi.mock("@docspace/shared/services/encryption/identity", () => ({
  generateIdentityKeyPair: vi.fn(),
  serializeIdentity: vi.fn(),
}));
vi.mock("@docspace/shared/services/encryption/recovery", () => ({
  generateRecoveryMnemonic: vi.fn(),
}));
vi.mock("@docspace/shared/services/encryption/apply-new-identity", () => ({
  applyNewIdentity: vi.fn(),
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  setEncryptionKeys: vi.fn(),
}));
vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({ suspendAutoLock: () => () => {} }),
}));

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import {
  generateIdentityKeyPair,
  serializeIdentity,
} from "@docspace/shared/services/encryption/identity";
import { generateRecoveryMnemonic } from "@docspace/shared/services/encryption/recovery";
import { applyNewIdentity } from "@docspace/shared/services/encryption/apply-new-identity";
import { setEncryptionKeys } from "@docspace/shared/api/privacy";

import {
  useGenerateKeyFlow,
  type GenerateKeyFlow,
} from "../useGenerateKeyFlow";

let latest: GenerateKeyFlow;

/** Requests key setup and continues from its explanation to the passphrase. */
const openPassphraseStep = async () => {
  await act(async () => latest.request());
  if (captured.setup) {
    await act(async () => {
      (captured.setup!.onContinue as () => void)();
    });
  }
};

const submitPassphrase = async (passphrase: string) => {
  await act(async () => {
    await (
      stepProps("passphrase")!.onPassphraseSubmit as (p: string) => Promise<void>
    )(passphrase);
  });
};

const confirmRecovery = async () => {
  await act(async () => {
    await (stepProps("recovery")!.onRecoveryConfirm as () => Promise<void>)();
  });
};
const Harness = (deps: Parameters<typeof useGenerateKeyFlow>[0]) => {
  latest = useGenerateKeyFlow(deps);
  return <>{latest.modals}</>;
};

const dummyKeyPair = {
  publicKey: new Uint8Array(32),
  privateKey: new Uint8Array(32),
};

const happyMocks = () => {
  vi.mocked(generateIdentityKeyPair).mockResolvedValue(
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    dummyKeyPair as any,
  );
  vi.mocked(generateRecoveryMnemonic).mockResolvedValue("twelve word phrase");
  vi.mocked(serializeIdentity).mockResolvedValue({
    publicKey: "pub-base64",
    privateKeyEnc: "enc-base64",
  });
  vi.mocked(setEncryptionKeys).mockResolvedValue(undefined as never);
};

describe("useGenerateKeyFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.setup = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("entry branch", () => {
    it("opens key setup for a user without a key", async () => {
      render(<Harness userId="42" refreshKeysFromServer={vi.fn()} />);
      await openPassphraseStep();
      expect(captured.setup).not.toBeNull();
    });

    it("Key already exists: no key setup opens", async () => {
      render(
        <Harness userId="42" hasExistingKeys refreshKeysFromServer={vi.fn()} />,
      );
      await openPassphraseStep();
      expect(captured.setup).toBeNull();
    });
  });

  describe("User cancels inside key generation", () => {
    it("reports a cancel of the passphrase dialog", async () => {
      const onCancel = vi.fn();
      const onError = vi.fn();
      render(
        <Harness
          userId="42"
          refreshKeysFromServer={vi.fn()}
          onCancel={onCancel}
          onError={onError}
        />,
      );
      await openPassphraseStep();

      await act(async () => {
        (stepProps("passphrase")!.onCancel as () => void)();
      });

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
      expect(captured.setup).toBeNull();
      expect(setEncryptionKeys).not.toHaveBeenCalled();
    });

    it("reports a cancel of the recovery-phrase dialog", async () => {
      happyMocks();
      const onCancel = vi.fn();
      render(
        <Harness
          userId="42"
          refreshKeysFromServer={vi.fn()}
          onCancel={onCancel}
        />,
      );
      await openPassphraseStep();
      await submitPassphrase("secret");

      await act(async () => {
        (stepProps("recovery")!.onCancel as () => void)();
      });

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(captured.setup).toBeNull();
      expect(setEncryptionKeys).not.toHaveBeenCalled();
    });
  });

  describe("onPassphraseSubmit", () => {
    it("toasts an error and does NOT generate keys when userId is undefined", async () => {
      render(
        <Harness userId={undefined} refreshKeysFromServer={vi.fn()} />,
      );
      await openPassphraseStep();

      await submitPassphrase("secret");

      expect(toastr.error).toHaveBeenCalledTimes(1);
      expect(generateIdentityKeyPair).not.toHaveBeenCalled();
      expect(generateRecoveryMnemonic).not.toHaveBeenCalled();
    });

    it("advances to the recovery phrase step on successful keypair generation", async () => {
      happyMocks();
      render(
        <Harness userId="42" refreshKeysFromServer={vi.fn()} />,
      );
      await openPassphraseStep();

      await submitPassphrase("secret");

      expect(generateIdentityKeyPair).toHaveBeenCalledTimes(1);
      expect(generateRecoveryMnemonic).toHaveBeenCalledTimes(1);
      expect(stepProps("recovery")?.mnemonic).toBe("twelve word phrase");
    });

    it("toasts an error and resets state when keypair generation throws", async () => {
      vi.mocked(generateIdentityKeyPair).mockRejectedValueOnce(
        new Error("rng failure"),
      );
      render(
        <Harness userId="42" refreshKeysFromServer={vi.fn()} />,
      );
      await openPassphraseStep();

      await submitPassphrase("secret");

      expect(toastr.error).toHaveBeenCalledTimes(1);
      expect(stepProps("recovery")).toBeNull();
    });
  });

  describe("onRecoveryConfirm", () => {
    it("calls setEncryptionKeys with a fresh UUID and the serialized payload", async () => {
      happyMocks();
      const refresh = vi.fn().mockResolvedValue(undefined);
      render(
        <Harness userId="42" refreshKeysFromServer={refresh} />,
      );
      await openPassphraseStep();
      await submitPassphrase("secret");
      await confirmRecovery();

      expect(setEncryptionKeys).toHaveBeenCalledTimes(1);
      expect(setEncryptionKeys).toHaveBeenCalledWith(
        expect.objectContaining({
          publicKey: "pub-base64",
          privateKeyEnc: "enc-base64",
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
          ),
        }),
      );
    });

    it("invokes serializeIdentity with the generated recovery mnemonic", async () => {
      happyMocks();
      render(
        <Harness userId="42" refreshKeysFromServer={vi.fn()} />,
      );
      await openPassphraseStep();
      await submitPassphrase("secret");
      await confirmRecovery();

      expect(serializeIdentity).toHaveBeenCalledWith(
        dummyKeyPair,
        "secret",
        { recoveryMnemonic: "twelve word phrase" },
      );
    });

    it("applies the new identity AFTER the API write but BEFORE refresh", async () => {
      happyMocks();
      const callOrder: string[] = [];
      vi.mocked(setEncryptionKeys).mockImplementationOnce((async () => {
        callOrder.push("api");
      }) as never);
      vi.mocked(applyNewIdentity).mockImplementationOnce(async () => {
        callOrder.push("apply");
      });
      const refresh = vi.fn().mockImplementation(async () => {
        callOrder.push("refresh");
      });

      render(
        <Harness userId="42" refreshKeysFromServer={refresh} />,
      );
      await openPassphraseStep();
      await submitPassphrase("secret");
      await confirmRecovery();

      expect(callOrder).toEqual(["api", "apply", "refresh"]);
    });

    it("applies the new key as the user's only key", async () => {
      happyMocks();
      render(
        <Harness
          userId="42"
          hasExistingKeys={false}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      await openPassphraseStep();
      await submitPassphrase("secret");
      await confirmRecovery();

      expect(applyNewIdentity).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "42" }),
      );
    });

    it("clears state via reset() on API error so the user can retry", async () => {
      happyMocks();
      vi.mocked(setEncryptionKeys).mockRejectedValueOnce(new Error("500"));

      render(
        <Harness userId="42" refreshKeysFromServer={vi.fn()} />,
      );
      await openPassphraseStep();
      await submitPassphrase("secret");
      await confirmRecovery();

      expect(toastr.error).toHaveBeenCalledTimes(1);
      expect(stepProps("recovery")).toBeNull();
    });
  });
});

describe("Key setup is one dialog of three steps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.setup = null;
  });

  it("Steps in order", async () => {
    happyMocks();
    render(<Harness userId="42" refreshKeysFromServer={vi.fn()} />);

    await act(async () => latest.request());
    expect(captured.setup?.step).toBe("explanation");

    await act(async () => {
      (captured.setup!.onContinue as () => void)();
    });
    expect(captured.setup?.step).toBe("passphrase");

    await submitPassphrase("secret");
    expect(captured.setup?.step).toBe("recovery");
  });

  it("Nothing registered before the last step", async () => {
    happyMocks();
    render(<Harness userId="42" refreshKeysFromServer={vi.fn()} />);

    await act(async () => latest.request());
    await act(async () => {
      (stepProps("explanation")!.onCancel as () => void)();
    });
    await openPassphraseStep();
    await act(async () => {
      (stepProps("passphrase")!.onCancel as () => void)();
    });

    expect(generateIdentityKeyPair).not.toHaveBeenCalled();
    expect(setEncryptionKeys).not.toHaveBeenCalled();
  });
});

describe("Key setup steps can be walked back", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.setup = null;
  });

  it("Passphrase changed after going back", async () => {
    happyMocks();
    render(<Harness userId="42" refreshKeysFromServer={vi.fn()} />);
    await openPassphraseStep();
    await submitPassphrase("first");
    const words = stepProps("recovery")!.mnemonic;

    await act(async () => {
      (stepProps("recovery")!.onBack as () => void)();
    });
    expect(captured.setup?.step).toBe("passphrase");
    await submitPassphrase("second");

    expect(stepProps("recovery")!.mnemonic).toBe(words);
    expect(generateIdentityKeyPair).toHaveBeenCalledTimes(1);
    expect(generateRecoveryMnemonic).toHaveBeenCalledTimes(1);

    await confirmRecovery();
    expect(serializeIdentity).toHaveBeenCalledWith(dummyKeyPair, "second", {
      recoveryMnemonic: "twelve word phrase",
    });
  });
});

// The dialog itself, for what it shows: the step counter, the typed
// passphrase kept across steps and the acknowledgement cleared on return.
describe("Key setup dialog", () => {
  const WORDS = Array.from({ length: 24 }, (_, i) => `word${i + 1}`).join(" ");
  const PASSPHRASE = "Correct1horse!battery";

  beforeAll(() => {
    // The rules tooltip mounts floating-ui, which jsdom does not provide.
    globalThis.ResizeObserver = class {
      observe() {}

      unobserve() {}

      disconnect() {}
    };
  });

  const renderDialog = async () => {
    const { KeySetupDialog } = await vi.importActual<
      typeof import("../KeySetupDialog")
    >("../KeySetupDialog");
    const props = {
      mnemonic: WORDS,
      isLoading: false,
      onContinue: vi.fn(),
      onPassphraseSubmit: vi.fn(),
      onRecoveryConfirm: vi.fn(),
      onBack: vi.fn(),
      onCancel: vi.fn(),
    };
    const view = render(<KeySetupDialog step="explanation" {...props} />);
    const show = (step: "explanation" | "passphrase" | "recovery") =>
      view.rerender(<KeySetupDialog step={step} {...props} />);
    return { show, props };
  };

  it("Three terms explained", async () => {
    await renderDialog();
    const explanation = screen.getByTestId("key_setup_explanation");

    for (const key of [
      "Common:KeySetupKeyTitle",
      "Common:KeySetupKeyDescription",
      "Common:KeySetupPassphraseTitle",
      "Common:KeySetupPassphraseDescription",
      "Common:KeySetupRecoveryTitle",
      "Common:KeySetupRecoveryDescription",
      "Common:KeySetupNotStored",
    ]) {
      expect(explanation).toHaveTextContent(key);
    }
    expect(screen.getAllByRole("term")).toHaveLength(3);
    expect(screen.getAllByRole("definition")).toHaveLength(3);
  });

  it("Three icons", async () => {
    await renderDialog();

    expect(screen.getAllByTestId("key_setup_term_icon")).toHaveLength(3);
  });

  it("Read aloud", async () => {
    await renderDialog();

    for (const icon of screen.getAllByTestId("key_setup_term_icon")) {
      expect(icon.closest("[aria-hidden=\"true\"]")).not.toBeNull();
    }
    expect(
      screen.getAllByRole("term").map((term) => term.textContent),
    ).toEqual([
      "Common:KeySetupKeyTitle",
      "Common:KeySetupPassphraseTitle",
      "Common:KeySetupRecoveryTitle",
    ]);
  });

  it("Key of the account", () => {
    for (const key of ["KeySetupKeyTitle", "KeySetupKeyDescription"] as const) {
      expect(enCommon[key]).not.toMatch(/browser|device/i);
    }
  });

  // A closed ModalDialog stays mounted, hidden from assistive technology, so
  // the confirmation is looked up among the dialogs that are actually open.
  const openConfirmation = () =>
    screen
      .queryAllByRole("dialog")
      .find((dialog) => dialog.textContent?.includes("Common:UnsavedChanges")) ??
    null;

  it("Closed on the recovery phrase step", async () => {
    const user = userEvent.setup();
    const { show, props } = await renderDialog();
    show("recovery");

    await user.keyboard("{Escape}");

    expect(openConfirmation()).toHaveTextContent(
      "Common:KeySetupDiscardRecovery",
    );
    expect(props.onCancel).not.toHaveBeenCalled();
  });

  it("Closed on the explanation", async () => {
    const user = userEvent.setup();
    const { props } = await renderDialog();

    await user.keyboard("{Escape}");

    expect(props.onCancel).toHaveBeenCalledTimes(1);
    expect(openConfirmation()).toBeNull();
  });

  it("Step shown", async () => {
    const { show } = await renderDialog();
    const counter = () => screen.getByTestId("key_setup_step");

    expect(counter()).toHaveTextContent('"step":1,"total":3');
    show("passphrase");
    expect(counter()).toHaveTextContent('"step":2,"total":3');
    show("recovery");
    expect(counter()).toHaveTextContent('"step":3,"total":3');
  });

  it("keeps the hint of the passphrase form on the passphrase step", async () => {
    const { show } = await renderDialog();
    show("passphrase");

    expect(screen.getByText("Common:CreatePassphraseHint")).toBeVisible();
  });

  it("Back from the recovery phrase", async () => {
    const user = userEvent.setup();
    const { show } = await renderDialog();
    show("passphrase");
    await user.type(screen.getByPlaceholderText("Common:Passphrase"), PASSPHRASE);
    await user.type(
      screen.getByPlaceholderText("Common:ConfirmPassphrase"),
      PASSPHRASE,
    );

    show("recovery");
    show("passphrase");

    expect(screen.getByPlaceholderText("Common:Passphrase")).toHaveValue(
      PASSPHRASE,
    );
    expect(screen.getByPlaceholderText("Common:ConfirmPassphrase")).toHaveValue(
      PASSPHRASE,
    );
  });

  it("Acknowledgement cleared", async () => {
    const user = userEvent.setup();
    const { show } = await renderDialog();
    show("recovery");
    const continueButton = () =>
      screen.getByRole("button", { name: "Common:ContinueButton" });
    const words = () => screen.getByTestId("recovery_phrase_words").textContent;
    const shown = words();

    await user.click(screen.getByLabelText("Common:RecoveryPhraseAcknowledge"));
    expect(continueButton()).toBeEnabled();

    show("passphrase");
    show("recovery");

    expect(words()).toBe(shown);
    expect(
      screen.getByLabelText("Common:RecoveryPhraseAcknowledge"),
    ).not.toBeChecked();
    expect(continueButton()).toBeDisabled();
  });
});
