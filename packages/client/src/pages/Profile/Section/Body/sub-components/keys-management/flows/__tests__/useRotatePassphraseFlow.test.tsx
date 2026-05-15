// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const captured = {
  rotation: null as Record<string, unknown> | null,
};

vi.mock("../../KeyRotationDialog", () => ({
  KeyRotationDialog: (props: Record<string, unknown>) => {
    captured.rotation = props;
    useEffect(() => () => {
      captured.rotation = null;
    }, []);
    return null;
  },
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@docspace/shared/services/encryption/identity", () => ({
  changePassphrase: vi.fn(),
}));
vi.mock("@docspace/shared/services/encryption/secretStorage", () => ({
  SecretStorage: { lock: vi.fn() },
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  updateEncryptionKeys: vi.fn(),
}));

import { toastr } from "@docspace/ui-kit/components/toast";
import { changePassphrase } from "@docspace/shared/services/encryption/identity";
import { SecretStorage } from "@docspace/shared/services/encryption/secretStorage";
import { updateEncryptionKeys } from "@docspace/shared/api/privacy";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import {
  useRotatePassphraseFlow,
  type RotatePassphraseFlow,
} from "../useRotatePassphraseFlow";

let latest: RotatePassphraseFlow;
const Harness = (deps: {
  userId: string | undefined;
  refreshKeysFromServer: () => Promise<void>;
}) => {
  latest = useRotatePassphraseFlow(deps);
  return <>{latest.modals}</>;
};

const dummyKey: TEncryptionKeyPair = {
  id: "k1",
  userId: "42",
  publicKey: "pub-old",
  privateKeyEnc: "enc-old",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe("useRotatePassphraseFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.rotation = null;
  });

  it("does NOT render the dialog before request() is called", () => {
    render(<Harness userId="42" refreshKeysFromServer={vi.fn()} />);
    expect(captured.rotation).toBeNull();
  });

  it("opens the dialog once request() is called with key data", () => {
    render(<Harness userId="42" refreshKeysFromServer={vi.fn()} />);
    act(() => latest.request(dummyKey));
    expect(captured.rotation).not.toBeNull();
    expect(captured.rotation?.visible).toBe(true);
    expect(captured.rotation?.error).toBeNull();
  });

  it("shows InvalidPassphrase inline (NOT a toast) on wrong old passphrase", async () => {
    vi.mocked(changePassphrase).mockRejectedValueOnce(
      new Error("wrong passphrase"),
    );
    render(<Harness userId="42" refreshKeysFromServer={vi.fn()} />);
    act(() => latest.request(dummyKey));
    await act(async () => {
      await (
        captured.rotation!.onSubmit as (a: string, b: string) => Promise<void>
      )("wrong-old", "new-pass");
    });

    expect(captured.rotation?.error).toBe("Common:InvalidPassphrase");
    expect(toastr.error).not.toHaveBeenCalled();
    expect(captured.rotation).not.toBeNull();
  });

  it("does NOT lock SecretStorage when the rotation fails", async () => {
    vi.mocked(changePassphrase).mockRejectedValueOnce(
      new Error("wrong passphrase"),
    );
    render(<Harness userId="42" refreshKeysFromServer={vi.fn()} />);
    act(() => latest.request(dummyKey));
    await act(async () => {
      await (
        captured.rotation!.onSubmit as (a: string, b: string) => Promise<void>
      )("wrong-old", "new-pass");
    });
    expect(SecretStorage.lock).not.toHaveBeenCalled();
  });

  it("on success: uploads, locks, refreshes, toasts, then closes the dialog", async () => {
    vi.mocked(changePassphrase).mockResolvedValueOnce({
      publicKey: "pub-new",
      privateKeyEnc: "enc-new",
    });

    const callOrder: string[] = [];
    vi.mocked(updateEncryptionKeys).mockImplementationOnce((async () => {
      callOrder.push("api");
    }) as never);
    vi.mocked(SecretStorage.lock).mockImplementationOnce(() => {
      callOrder.push("lock");
    });
    const refresh = vi.fn().mockImplementation(async () => {
      callOrder.push("refresh");
    });

    render(<Harness userId="42" refreshKeysFromServer={refresh} />);
    act(() => latest.request(dummyKey));
    await act(async () => {
      await (
        captured.rotation!.onSubmit as (a: string, b: string) => Promise<void>
      )("old", "new");
    });

    expect(changePassphrase).toHaveBeenCalledWith(
      { publicKey: dummyKey.publicKey, privateKeyEnc: dummyKey.privateKeyEnc },
      "old",
      "new",
    );
    expect(updateEncryptionKeys).toHaveBeenCalledWith({
      publicKey: "pub-new",
      privateKeyEnc: "enc-new",
    });
    expect(callOrder).toEqual(["api", "lock", "refresh"]);
    expect(toastr.success).toHaveBeenCalledTimes(1);
    expect(captured.rotation).toBeNull();
  });

});
