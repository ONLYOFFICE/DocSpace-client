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

describe("usePrivateRoomKeyGate", () => {
  beforeEach(() => {
    captured.setup = null;
  });

  it("starts key generation for a user without a key", () => {
    renderGate({ hasExistingKeys: false });

    act(() => gate.confirmKeyGeneration());

    expect(captured.setup).not.toBeNull();
  });

  it("User cancels inside key generation", () => {
    const onKeyGenerationCancelled = vi.fn();
    const onClose = vi.fn();
    renderGate({ hasExistingKeys: false, onKeyGenerationCancelled, onClose });
    act(() => gate.confirmKeyGeneration());

    act(() => {
      (captured.setup!.onCancel as () => void)();
    });

    expect(onKeyGenerationCancelled).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Guest reaches the key offer of room creation", () => {
    renderGate({ hasExistingKeys: false, isGuest: true });

    let offered = true;
    act(() => {
      offered = gate.offerKeyGeneration();
    });

    expect(offered).toBe(false);
    expect(gate.keyConfirmVisible).toBe(false);

    act(() => gate.confirmKeyGeneration());

    expect(captured.setup).toBeNull();
  });

  it("Key already exists", () => {
    renderGate({ hasExistingKeys: true });

    act(() => gate.confirmKeyGeneration());

    expect(captured.setup).toBeNull();
  });
});
