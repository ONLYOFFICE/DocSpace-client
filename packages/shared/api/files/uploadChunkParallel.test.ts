// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const request = vi.fn();

vi.mock("../client", () => ({
  request: (options: unknown) => request(options),
}));

// eslint-disable-next-line import/first
import { uploadChunkParallel } from ".";

const timeoutError = {
  isAxiosError: true,
  code: "ECONNABORTED",
  message: "timeout of 30000ms exceeded",
};

const responseError = (status: number) => ({
  isAxiosError: true,
  message: `Request failed with status code ${status}`,
  response: { status, data: {} },
});

const upload = (signal?: AbortSignal) =>
  uploadChunkParallel(1, "session", 3, new FormData(), signal);

const settle = async <T>(promise: Promise<T>) => {
  const result = promise.then(
    (value) => ({ value }),
    (error: unknown) => ({ error }),
  );
  await vi.runAllTimersAsync();
  return result;
};

describe("uploadChunkParallel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    request.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends a timed-out chunk again instead of failing the file (bug 84938)", async () => {
    request
      .mockRejectedValueOnce(timeoutError)
      .mockResolvedValueOnce({ uploaded: false });

    const result = await settle(upload());

    expect(result).toEqual({ value: { uploaded: false } });
    expect(request).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "post",
        url: "/files/1/session/session/upload?chunkNumber=3",
      }),
    );
  });

  it("retries a gateway error", async () => {
    request
      .mockRejectedValueOnce(responseError(504))
      .mockResolvedValueOnce({ uploaded: false });

    const result = await settle(upload());

    expect(result).toEqual({ value: { uploaded: false } });
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("gives up after the last attempt", async () => {
    request.mockRejectedValue(timeoutError);

    const result = await settle(upload());

    expect(result).toEqual({ error: timeoutError });
    expect(request).toHaveBeenCalledTimes(3);
  });

  it("does not retry an error the server answered with", async () => {
    const quotaError = responseError(403);
    request.mockRejectedValueOnce(quotaError);

    const result = await settle(upload());

    expect(result).toEqual({ error: quotaError });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("does not retry a cancelled request", async () => {
    const canceledError = {
      isAxiosError: true,
      code: "ERR_CANCELED",
      __CANCEL__: true,
    };
    request.mockRejectedValueOnce(canceledError);

    const result = await settle(upload());

    expect(result).toEqual({ error: canceledError });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("does not retry once the upload is aborted", async () => {
    const controller = new AbortController();
    request.mockImplementationOnce(async () => {
      controller.abort();
      throw timeoutError;
    });

    const result = await settle(upload(controller.signal));

    expect(result).toEqual({ error: timeoutError });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("stops waiting for the retry when the upload is aborted", async () => {
    const controller = new AbortController();
    const canceledError = {
      isAxiosError: true,
      code: "ERR_CANCELED",
      __CANCEL__: true,
    };
    request
      .mockRejectedValueOnce(timeoutError)
      .mockRejectedValueOnce(canceledError);

    const result = upload(controller.signal).then(
      (value) => ({ value }),
      (error: unknown) => ({ error }),
    );
    await vi.advanceTimersByTimeAsync(0);
    expect(request).toHaveBeenCalledTimes(1);

    controller.abort();

    expect(await result).toEqual({ error: canceledError });
    expect(request).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });
});
