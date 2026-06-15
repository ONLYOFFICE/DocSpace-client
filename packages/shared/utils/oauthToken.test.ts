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

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from "vitest";

vi.mock("./common", () => ({
  frameCallCommand: vi.fn(),
}));

import { frameCallCommand } from "./common";
import {
  isOAuthFrame,
  requestAuthToken,
  AUTH_TOKEN_TIMEOUT_MS,
  __resetOAuthTokenForTests,
} from "./oauthToken";

const frameCallCommandMock = frameCallCommand as Mock;

let fakeParent: Window;
let originalParent: PropertyDescriptor | undefined;

const enterIframe = () => {
  if (!originalParent) {
    originalParent = Object.getOwnPropertyDescriptor(window, "parent");
  }
  fakeParent = {} as Window;
  Object.defineProperty(window, "parent", {
    value: fakeParent,
    configurable: true,
  });
};

const leaveIframe = () => {
  if (originalParent) {
    Object.defineProperty(window, "parent", originalParent);
    originalParent = undefined;
  }
};

const lastCallId = (): number => {
  const calls = frameCallCommandMock.mock.calls;
  const last = calls[calls.length - 1];
  return (last[1] as { callId: number }).callId;
};

const dispatchTokenReturn = (
  callId: number,
  data: unknown,
  opts: { source?: unknown; origin?: string } = {},
) => {
  const event = new MessageEvent("message", {
    data: JSON.stringify({
      frameId: "test-frame",
      type: "onAuthTokenReturn",
      callId,
      data,
    }),
    source: (opts.source ?? fakeParent) as MessageEventSource,
    origin: opts.origin,
  });
  window.dispatchEvent(event);
};

describe("oauthToken", () => {
  beforeEach(() => {
    frameCallCommandMock.mockReset();
    __resetOAuthTokenForTests();
    delete (window as unknown as { ClientConfig?: unknown }).ClientConfig;
  });

  afterEach(() => {
    __resetOAuthTokenForTests();
    leaveIframe();
    vi.useRealTimers();
  });

  describe("isOAuthFrame", () => {
    it("returns the cached ClientConfig flag when set", () => {
      (window as unknown as { ClientConfig: { isOAuthFrame: boolean } }).ClientConfig =
        { isOAuthFrame: true };
      expect(isOAuthFrame()).toBe(true);
    });

    it("falls back to the ?auth=oauth URL param and caches it", () => {
      (window as unknown as { ClientConfig: Record<string, unknown> }).ClientConfig =
        {};
      window.history.replaceState({}, "", "/?auth=oauth");

      expect(isOAuthFrame()).toBe(true);
      expect(
        (window as unknown as { ClientConfig: { isOAuthFrame?: boolean } })
          .ClientConfig.isOAuthFrame,
      ).toBe(true);
    });

    it("is false without the param", () => {
      (window as unknown as { ClientConfig: Record<string, unknown> }).ClientConfig =
        {};
      window.history.replaceState({}, "", "/");
      expect(isOAuthFrame()).toBe(false);
    });
  });

  describe("requestAuthToken", () => {
    it("resolves with the access token from a matching callId reply", async () => {
      enterIframe();
      const promise = requestAuthToken();

      expect(frameCallCommandMock).toHaveBeenCalledWith(
        "getAuthToken",
        expect.objectContaining({ callId: expect.any(Number) }),
      );

      dispatchTokenReturn(lastCallId(), { accessToken: "jwt-123" });
      await expect(promise).resolves.toBe("jwt-123");
    });

    it("ignores replies from a different source", async () => {
      vi.useFakeTimers();
      enterIframe();
      const promise = requestAuthToken();

      dispatchTokenReturn(lastCallId(), { accessToken: "jwt-123" }, {
        source: {} as Window,
      });

      vi.advanceTimersByTime(AUTH_TOKEN_TIMEOUT_MS);
      await expect(promise).resolves.toBeNull();
    });

    it("ignores replies whose origin does not match the embedder", async () => {
      vi.useFakeTimers();
      Object.defineProperty(document, "referrer", {
        value: "https://host.example.com",
        configurable: true,
      });
      enterIframe();
      const promise = requestAuthToken();

      dispatchTokenReturn(lastCallId(), { accessToken: "jwt-123" }, {
        origin: "https://evil.example.com",
      });

      vi.advanceTimersByTime(AUTH_TOKEN_TIMEOUT_MS);
      await expect(promise).resolves.toBeNull();

      Object.defineProperty(document, "referrer", {
        value: "",
        configurable: true,
      });
    });

    it("ignores a mismatched callId", async () => {
      vi.useFakeTimers();
      enterIframe();
      const promise = requestAuthToken();

      dispatchTokenReturn(lastCallId() + 999, { accessToken: "jwt-123" });

      vi.advanceTimersByTime(AUTH_TOKEN_TIMEOUT_MS);
      await expect(promise).resolves.toBeNull();
    });

    it("resolves null on timeout", async () => {
      vi.useFakeTimers();
      enterIframe();
      const promise = requestAuthToken();

      vi.advanceTimersByTime(AUTH_TOKEN_TIMEOUT_MS);
      await expect(promise).resolves.toBeNull();
    });

    it("resolves null when not embedded in an iframe", async () => {
      leaveIframe();
      await expect(requestAuthToken()).resolves.toBeNull();
      expect(frameCallCommandMock).not.toHaveBeenCalled();
    });
  });

});
