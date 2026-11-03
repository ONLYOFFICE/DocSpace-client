import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const captured = {
  passphrase: null as Record<string, unknown> | null,
};

vi.mock("@docspace/shared/dialogs/passphrase-modal", () => ({
  PassphraseModal: (props: Record<string, unknown>) => {
    captured.passphrase = props;
    useEffect(
      () => () => {
        captured.passphrase = null;
      },
      [],
    );
    return null;
  },
}));
vi.mock("../dialogs/key-generation/RecoveryPhraseDisplayModal", () => ({
  RecoveryPhraseDisplayModal: () => null,
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
    captured.passphrase = null;
  });

  it("starts key generation for a user without a key", () => {
    renderGate({ hasExistingKeys: false });

    act(() => gate.confirmKeyGeneration());

    expect(captured.passphrase).not.toBeNull();
  });

  it("Key already exists", () => {
    renderGate({ hasExistingKeys: true });

    act(() => gate.confirmKeyGeneration());

    expect(captured.passphrase).toBeNull();
  });
});
