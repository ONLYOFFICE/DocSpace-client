// (c) Copyright Ascensio System SIA 2009-2025
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

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
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
    result.set(
      buf instanceof Uint8Array ? buf : new Uint8Array(buf),
      offset,
    );
    offset += buf.byteLength;
  }
  return result;
}

export function uint32BE(value: number): Uint8Array {
  const buf = new Uint8Array(4);
  const view = new DataView(buf.buffer);
  view.setUint32(0, value, false);
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

export function uint16BE(value: number): Uint8Array {
  const buf = new Uint8Array(2);
  const view = new DataView(buf.buffer);
  view.setUint16(0, value, false);
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

export function zeroBuffer(buf: ArrayBuffer | Uint8Array): void {
  const view = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  view.fill(0);
}
