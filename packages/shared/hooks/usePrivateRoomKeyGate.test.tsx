import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const captured = {
  setup: null as Record<string, unknown> | null,
};

vi.mock("../dialogs/key-generation/KeySetupDialog", () => ({
  KeySetupDialog: (props: Record<string, unknown>) => {
    captured.setup = props;
    useEffect(
      () => () => {
        captured.setup = null;
      },
      [],
    );
    return null;
  },
}));
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

import {
  generateIdentityKeyPair,
  serializeIdentity,
} from "@docspace/shared/services/encryption/identity";
import { generateRecoveryMnemonic } from "@docspace/shared/services/encryption/recovery";
import { setEncryptionKeys } from "@docspace/shared/api/privacy";

import { usePrivateRoomKeyGate } from "./usePrivateRoomKeyGate";

type TGate = ReturnType<typeof usePrivateRoomKeyGate>;
type TGateDeps = Parameters<typeof usePrivateRoomKeyGate>[0];

let gate: TGate;
const Harness = (deps: TGateDeps) => {
  gate = usePrivateRoomKeyGate(deps);
  return <>{gate.keyGenerationModals}</>;
};

const renderGate = (deps: Partial<TGateDeps> = {}) =>
  render(
    <Harness
      t={((key: string) => key) as TGateDeps["t"]}
      userId="me"
      refreshKeysFromServer={vi.fn(async () => {})}
      {...deps}
    />,
  );

const call = (name: string, ...args: unknown[]) =>
  act(async () => {
    await (captured.setup![name] as (...a: unknown[]) => unknown)(...args);
  });

describe("Starting private room creation without a key opens key setup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.setup = null;
  });

  it("No prompt before key setup", () => {
    renderGate({ hasExistingKeys: false });

    let offered = false;
    act(() => {
      offered = gate.offerKeyGeneration();
    });

    expect(offered).toBe(true);
    expect(captured.setup?.step).toBe("explanation");
  });

  it("User cancels on the explanation", async () => {
    const onKeyGenerationCancelled = vi.fn();
    const onClose = vi.fn();
    renderGate({ hasExistingKeys: false, onKeyGenerationCancelled, onClose });
    act(() => {
      gate.offerKeyGeneration();
    });

    await call("onCancel");

    expect(onKeyGenerationCancelled).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(captured.setup).toBeNull();
  });

  it("User cancels inside key setup", async () => {
    vi.mocked(generateIdentityKeyPair).mockResolvedValue({} as never);
    vi.mocked(generateRecoveryMnemonic).mockResolvedValue("words");
    const onKeyGenerationCancelled = vi.fn();
    renderGate({ hasExistingKeys: false, onKeyGenerationCancelled });
    act(() => {
      gate.offerKeyGeneration();
    });
    await call("onContinue");
    await call("onPassphraseSubmit", "secret");
    expect(captured.setup?.step).toBe("recovery");

    await call("onCancel");

    expect(onKeyGenerationCancelled).toHaveBeenCalledTimes(1);
    expect(setEncryptionKeys).not.toHaveBeenCalled();
  });

  it("User completes key setup", async () => {
    vi.mocked(generateIdentityKeyPair).mockResolvedValue({} as never);
    vi.mocked(generateRecoveryMnemonic).mockResolvedValue("words");
    vi.mocked(serializeIdentity).mockResolvedValue({
      publicKey: "pub",
      privateKeyEnc: "enc",
    });
    vi.mocked(setEncryptionKeys).mockResolvedValue(undefined as never);
    const onKeyGenerated = vi.fn();
    renderGate({ hasExistingKeys: false, onKeyGenerated });
    act(() => {
      gate.offerKeyGeneration();
    });

    await call("onContinue");
    await call("onPassphraseSubmit", "secret");
    await call("onRecoveryConfirm");

    expect(setEncryptionKeys).toHaveBeenCalledTimes(1);
    expect(onKeyGenerated).toHaveBeenCalledTimes(1);
  });
});

describe("Key setup is not closed while the key is registered", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.setup = null;
  });

  it("Private room creation during registration", async () => {
    vi.mocked(generateIdentityKeyPair).mockResolvedValue({} as never);
    vi.mocked(generateRecoveryMnemonic).mockResolvedValue("words");
    vi.mocked(serializeIdentity).mockResolvedValue({
      publicKey: "pub",
      privateKeyEnc: "enc",
    });
    let registered!: () => void;
    vi.mocked(setEncryptionKeys).mockReturnValueOnce(
      new Promise<void>((resolve) => {
        registered = resolve;
      }) as never,
    );
    const onKeyGenerated = vi.fn();
    const onKeyGenerationCancelled = vi.fn();
    renderGate({
      hasExistingKeys: false,
      onKeyGenerated,
      onKeyGenerationCancelled,
    });
    act(() => {
      gate.offerKeyGeneration();
    });
    await call("onContinue");
    await call("onPassphraseSubmit", "secret");

    let confirming!: Promise<unknown>;
    act(() => {
      confirming = (captured.setup!.onRecoveryConfirm as () => Promise<unknown>)();
    });
    // The dialog is told it is busy, so its cross and Escape do nothing.
    expect(captured.setup?.isLoading).toBe(true);

    await act(async () => {
      registered();
      await confirming;
    });

    expect(onKeyGenerated).toHaveBeenCalledTimes(1);
    expect(onKeyGenerationCancelled).not.toHaveBeenCalled();
  });
});

describe("usePrivateRoomKeyGate", () => {
  beforeEach(() => {
    captured.setup = null;
  });

  it("Guest reaches the key offer of room creation", () => {
    renderGate({ hasExistingKeys: false, isGuest: true });

    let offered = true;
    act(() => {
      offered = gate.offerKeyGeneration();
    });

    expect(offered).toBe(false);
    expect(captured.setup).toBeNull();
  });

  it("Key already exists", () => {
    renderGate({ hasExistingKeys: true });

    act(() => {
      gate.offerKeyGeneration();
    });

    expect(captured.setup).toBeNull();
  });
});
