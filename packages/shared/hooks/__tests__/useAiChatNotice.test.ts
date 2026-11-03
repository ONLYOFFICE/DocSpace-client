import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const handlers = new Map<string, () => void>();

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", () => ({
  default: {
    on: vi.fn((event: string, handler: () => void) =>
      handlers.set(event, handler),
    ),
    off: vi.fn((event: string) => handlers.delete(event)),
  },
  SocketEvents: { TopUpWallet: "top-up-wallet" },
}));

import { getAiChatBlock } from "@docspace/shared/utils/ai";

import { useAiChatNotice } from "../useAiChatNotice";

const t = ((key: string) => key) as never;
const LIMIT_MESSAGE =
  "Service limit exceeded: Service limit exceeded for customer No.1. Service group 'ai-services', amount limit 1.0, available 0.02 until 2099-10-23 23:59:59Z";

const walletError = {
  error: { code: "insufficient_funds", message: "402" },
  providerType: "onlyoffice",
};

const setup = (overrides: Partial<Parameters<typeof useAiChatNotice>[0]> = {}) => {
  const onTopUpWallet = vi.fn();
  const onChangeAiLimit = vi.fn();
  const view = renderHook((props: Parameters<typeof useAiChatNotice>[0]) =>
    useAiChatNotice(props), {
    initialProps: {
      t,
      language: "en",
      standalone: false,
      isAdmin: false,
      isPayer: false,
      isChatOpen: true,
      onTopUpWallet,
      onChangeAiLimit,
      ...overrides,
    },
  });
  return { ...view, onTopUpWallet, onChangeAiLimit };
};

describe("getAiChatBlock", () => {
  it("tells the portal wallet from a provider's own credits", () => {
    expect(getAiChatBlock(walletError, false)).toEqual({ kind: "wallet" });
    expect(
      getAiChatBlock({ ...walletError, providerType: "openai" }, false),
    ).toEqual({ kind: "provider" });
  });

  it("reads a spending limit and its reset date", () => {
    expect(
      getAiChatBlock({ error: { code: "auth", message: LIMIT_MESSAGE } }, false),
    ).toEqual({ kind: "limit", until: "2099-10-23T23:59:59Z" });
  });

  it("reads a spending limit from the gateway's shortened text", () => {
    expect(
      getAiChatBlock(
        { error: { code: "auth", message: "403 Service limit exceeded" } },
        false,
      ),
    ).toEqual({ kind: "limit", until: null });
    expect(
      getAiChatBlock(
        {
          error: {
            code: "auth",
            message:
              "Service limit exceeded for customer No.1. Service group 'storage'",
          },
        },
        false,
      ),
    ).toBeNull();
  });

  it("has no wallet or limit on standalone, and ignores non-money errors", () => {
    expect(getAiChatBlock(walletError, true)).toEqual({ kind: "provider" });
    expect(
      getAiChatBlock({ error: { code: "auth", message: LIMIT_MESSAGE } }, true),
    ).toBeNull();
    expect(getAiChatBlock({ error: { code: "network" } }, false)).toBeNull();
  });
});

describe("useAiChatNotice", () => {
  beforeEach(() => {
    handlers.clear();
  });

  it("shows nothing until a round fails for lack of money", () => {
    const { result } = setup();
    expect(result.current.composerNotice).toBeNull();
    act(() => result.current.onStreamError({ error: { code: "network" } }));
    expect(result.current.composerNotice).toBeNull();
  });

  it("blocks sending on an empty wallet and lifts it on the top-up event", () => {
    const { result } = setup();
    act(() => result.current.onStreamError(walletError));
    expect(result.current.composerNotice).toEqual({
      title: "Common:AIPaused",
      description: "Common:AIPausedWalletEmptyContactPayer",
      action: undefined,
      blocksSending: true,
    });
    act(() => handlers.get("top-up-wallet")?.());
    expect(result.current.composerNotice).toBeNull();
  });

  it("offers the Payer the top-up", () => {
    const { result, onTopUpWallet } = setup({ isPayer: true });
    act(() => result.current.onStreamError(walletError));
    const notice = result.current.composerNotice;
    expect(notice?.description).toBe("Common:AIPausedWalletEmpty");
    expect(notice?.action?.text).toBe("Common:TopUpWallet");
    notice?.action?.onClick();
    expect(onTopUpWallet).toHaveBeenCalledTimes(1);
  });

  it("re-checks the wallet when the chat is opened again", async () => {
    const fetchWalletBalance = vi.fn().mockResolvedValue(5);
    const { result, rerender } = setup({ isAdmin: true, fetchWalletBalance });
    act(() => result.current.onStreamError(walletError));
    const props = {
      t,
      language: "en",
      standalone: false,
      isAdmin: true,
      isPayer: false,
      onTopUpWallet: vi.fn(),
      onChangeAiLimit: vi.fn(),
      fetchWalletBalance,
    };
    rerender({ ...props, isChatOpen: false });
    expect(result.current.composerNotice).not.toBeNull();
    await act(async () => {
      rerender({ ...props, isChatOpen: true });
    });
    expect(fetchWalletBalance).toHaveBeenCalledWith(true);
    expect(result.current.composerNotice).toBeNull();
  });

  it("leaves the buttons out for a host with nowhere to send the user", () => {
    const { result } = setup({
      isAdmin: true,
      isPayer: true,
      onTopUpWallet: undefined,
      onChangeAiLimit: undefined,
    });
    act(() => result.current.onStreamError(walletError));
    expect(result.current.composerNotice?.action).toBeUndefined();
  });

  it("explains a spending limit and lets the admin change it", () => {
    const { result, onChangeAiLimit } = setup({ isAdmin: true });
    act(() =>
      result.current.onStreamError({
        error: { code: "auth", message: LIMIT_MESSAGE },
      }),
    );
    const notice = result.current.composerNotice;
    expect(notice?.title).toBe("Common:AILimitReached");
    expect(notice?.blocksSending).toBe(true);
    notice?.action?.onClick();
    expect(onChangeAiLimit).toHaveBeenCalledTimes(1);
  });

  it("keeps a provider's credits notice open for sending until an answer completes", () => {
    const { result } = setup();
    act(() =>
      result.current.onStreamError({ ...walletError, providerType: "openai" }),
    );
    expect(result.current.composerNotice).toEqual({
      title: "Common:AIProviderOutOfCredits",
      description: "Common:AIProviderOutOfCreditsTopUp",
    });
    act(() => result.current.onStreamEnd());
    expect(result.current.composerNotice).toBeNull();
  });
});
