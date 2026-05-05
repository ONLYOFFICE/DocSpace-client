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

import { WebCryptoUnavailableError, InvalidFormatError } from "./errors";
import { USER_ID_BYTES } from "./types";

export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new InvalidFormatError("invalid base64 input");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

export function base64ToUint8Array(base64: string): Uint8Array {
  return new Uint8Array(base64ToArrayBuffer(base64));
}

export function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  return arrayBufferToBase64(buffer)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function getCrypto(): SubtleCrypto {
  const subtle =
    globalThis.crypto?.subtle ??
    (typeof window !== "undefined" ? window.crypto?.subtle : undefined);
  if (!subtle) {
    throw new WebCryptoUnavailableError();
  }
  return subtle;
}

export function getRandomBytes(size: number): Uint8Array {
  if (!globalThis.crypto) {
    throw new WebCryptoUnavailableError();
  }
  const bytes = new Uint8Array(size);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

export function concatBuffers(
  ...buffers: (ArrayBuffer | Uint8Array)[]
): Uint8Array {
  const totalLength = buffers.reduce((sum, b) => sum + b.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    result.set(buf instanceof Uint8Array ? buf : new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  return result;
}

/** Best-effort wipe; JS GC offers no real guarantee. */
export function zeroBuffer(buf: ArrayBuffer | Uint8Array): void {
  const view = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  view.fill(0);
}

export function uint16BE(value: number): Uint8Array {
  const buf = new Uint8Array(2);
  new DataView(buf.buffer).setUint16(0, value, false);
  return buf;
}

export function readUint16BE(
  data: ArrayBuffer | Uint8Array,
  offset: number,
): number {
  const view = new DataView(
    data instanceof Uint8Array ? data.buffer : data,
    data instanceof Uint8Array ? data.byteOffset : 0,
  );
  return view.getUint16(offset, false);
}

export function uint32BE(value: number): Uint8Array {
  const buf = new Uint8Array(4);
  new DataView(buf.buffer).setUint32(0, value, false);
  return buf;
}

export function readUint32BE(
  data: ArrayBuffer | Uint8Array,
  offset: number,
): number {
  const view = new DataView(
    data instanceof Uint8Array ? data.buffer : data,
    data instanceof Uint8Array ? data.byteOffset : 0,
  );
  return view.getUint32(offset, false);
}

export function uint64BE(value: number): Uint8Array {
  if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
    throw new InvalidFormatError("uint64BE: value must be a non-negative integer");
  }
  if (value > Number.MAX_SAFE_INTEGER) {
    throw new InvalidFormatError("uint64BE: value exceeds MAX_SAFE_INTEGER");
  }
  const buf = new Uint8Array(8);
  const view = new DataView(buf.buffer);
  // High 32 bits via float arithmetic — JS bitwise ops are int32-only.
  const high = Math.floor(value / 0x1_0000_0000);
  const low = value >>> 0;
  view.setUint32(0, high, false);
  view.setUint32(4, low, false);
  return buf;
}

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function uuidToBytes(uuid: string): Uint8Array {
  if (typeof uuid !== "string" || !UUID_REGEX.test(uuid)) {
    throw new InvalidFormatError(`invalid UUID: ${uuid}`);
  }
  const hex = uuid.replace(/-/g, "").toLowerCase();
  const bytes = new Uint8Array(USER_ID_BYTES);
  for (let i = 0; i < USER_ID_BYTES; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToUuid(bytes: Uint8Array): string {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength !== USER_ID_BYTES) {
    throw new InvalidFormatError(
      `bytesToUuid: input must be ${USER_ID_BYTES} bytes`,
    );
  }
  const hex: string[] = [];
  for (let i = 0; i < USER_ID_BYTES; i++) {
    hex.push(bytes[i].toString(16).padStart(2, "0"));
  }
  const j = hex.join("");
  return `${j.slice(0, 8)}-${j.slice(8, 12)}-${j.slice(12, 16)}-${j.slice(16, 20)}-${j.slice(20, 32)}`;
}

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });

export function utf8(s: string): Uint8Array {
  return utf8Encoder.encode(s);
}

export function fromUtf8(bytes: Uint8Array): string {
  return utf8Decoder.decode(bytes);
}
