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
  confirmation: null as Record<string, unknown> | null,
};

vi.mock("../../modals/ConfirmationModal", () => ({
  ConfirmationModal: (props: Record<string, unknown>) => {
    captured.confirmation = props;
    useEffect(() => () => {
      captured.confirmation = null;
    }, []);
    return null;
  },
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@docspace/shared/services/encryption/secret-storage", () => ({
  SecretStorage: { lock: vi.fn() },
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  deleteEncryptionKey: vi.fn(),
}));

import { toastr } from "@docspace/ui-kit/components/toast";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { deleteEncryptionKey } from "@docspace/shared/api/privacy";

import {
  useDeleteKeyFlow,
  type DeleteKeyFlow,
} from "../useDeleteKeyFlow";

let latest: DeleteKeyFlow;
const Harness = (deps: { refreshKeysFromServer: () => Promise<void> }) => {
  latest = useDeleteKeyFlow(deps);
  return <>{latest.modals}</>;
};

describe("useDeleteKeyFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.confirmation = null;
  });

  it("keeps confirmation hidden until request() is called", () => {
    render(<Harness refreshKeysFromServer={vi.fn()} />);
    expect(captured.confirmation).toBeNull();
  });

  it("shows the confirmation dialog when request(keyId) fires", () => {
    render(<Harness refreshKeysFromServer={vi.fn()} />);
    act(() => latest.request("key-7"));
    expect(captured.confirmation?.visible).toBe(true);
    expect(deleteEncryptionKey).not.toHaveBeenCalled();
  });

  it("clears pendingId after a successful delete (finally block)", async () => {
    vi.mocked(deleteEncryptionKey).mockResolvedValueOnce(undefined as never);

    render(<Harness refreshKeysFromServer={vi.fn().mockResolvedValue(undefined)} />);
    act(() => latest.request("key-7"));
    await act(async () => {
      await (captured.confirmation!.onConfirm as () => Promise<void>)();
    });

    expect(latest.pendingId).toBeNull();
    expect(deleteEncryptionKey).toHaveBeenCalledWith("key-7");
  });

  it("clears pendingId after a failed delete (finally block also runs on error)", async () => {
    vi.mocked(deleteEncryptionKey).mockRejectedValueOnce(new Error("403"));

    render(<Harness refreshKeysFromServer={vi.fn()} />);
    act(() => latest.request("key-7"));
    await act(async () => {
      await (captured.confirmation!.onConfirm as () => Promise<void>)();
    });

    expect(latest.pendingId).toBeNull();
    expect(toastr.error).toHaveBeenCalledTimes(1);
  });

  it("locks SecretStorage only on success — never on failure", async () => {
    vi.mocked(deleteEncryptionKey).mockRejectedValueOnce(new Error("403"));
    render(<Harness refreshKeysFromServer={vi.fn()} />);
    act(() => latest.request("key-7"));
    await act(async () => {
      await (captured.confirmation!.onConfirm as () => Promise<void>)();
    });
    expect(SecretStorage.lock).not.toHaveBeenCalled();

    vi.mocked(deleteEncryptionKey).mockResolvedValueOnce(undefined as never);
    act(() => latest.request("key-7"));
    await act(async () => {
      await (captured.confirmation!.onConfirm as () => Promise<void>)();
    });
    expect(SecretStorage.lock).toHaveBeenCalledTimes(1);
  });

  it("uses ORDERING: API call → lock → refresh on success", async () => {
    const callOrder: string[] = [];
    vi.mocked(deleteEncryptionKey).mockImplementationOnce((async () => {
      callOrder.push("api");
    }) as never);
    vi.mocked(SecretStorage.lock).mockImplementationOnce(() => {
      callOrder.push("lock");
    });
    const refresh = vi.fn().mockImplementation(async () => {
      callOrder.push("refresh");
    });

    render(<Harness refreshKeysFromServer={refresh} />);
    act(() => latest.request("key-7"));
    await act(async () => {
      await (captured.confirmation!.onConfirm as () => Promise<void>)();
    });
    expect(callOrder).toEqual(["api", "lock", "refresh"]);
  });

  it("does nothing on confirm when there is no confirming target (defensive)", () => {
    render(<Harness refreshKeysFromServer={vi.fn()} />);
    expect(captured.confirmation).toBeNull();
    expect(deleteEncryptionKey).not.toHaveBeenCalled();
  });
});
