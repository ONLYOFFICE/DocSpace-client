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

import { describe, it, expect } from "vitest";

import {
  uuidToBytes,
  bytesToUuid,
  uint64BE,
  uint32BE,
  readUint32BE,
  uint16BE,
  readUint16BE,
  base64ToUint8Array,
  arrayBufferToBase64,
  concatBuffers,
} from "../utils";
import { InvalidFormatError } from "../errors";

describe("utils", () => {
  describe("uuidToBytes / bytesToUuid", () => {
    it("round-trips the spec example", () => {
      const uuid = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
      const bytes = uuidToBytes(uuid);
      expect(Array.from(bytes)).toEqual([
        0x66, 0xfa, 0xa6, 0xe4, 0xf1, 0x33, 0x11, 0xea, 0xb1, 0x26, 0x00, 0xff,
        0xee, 0xc8, 0xb4, 0xef,
      ]);
      expect(bytesToUuid(bytes)).toBe(uuid);
    });

    it("normalizes upper-case hex input", () => {
      const uuid = "66FAA6E4-F133-11EA-B126-00FFEEC8B4EF";
      const bytes = uuidToBytes(uuid);
      expect(bytesToUuid(bytes)).toBe(uuid.toLowerCase());
    });

    it("rejects malformed input", () => {
      expect(() => uuidToBytes("not-a-uuid")).toThrow(InvalidFormatError);
      expect(() => uuidToBytes("")).toThrow(InvalidFormatError);
      expect(() =>
        uuidToBytes("66faa6e4f13311eab12600ffeec8b4ef"),
      ).toThrow(InvalidFormatError);
      expect(() =>
        uuidToBytes("66faa6e4-f133-11ea-b126-00ffeec8b4efZZ"),
      ).toThrow(InvalidFormatError);
    });

    it("bytesToUuid rejects wrong-length input", () => {
      expect(() => bytesToUuid(new Uint8Array(15))).toThrow(InvalidFormatError);
      expect(() => bytesToUuid(new Uint8Array(17))).toThrow(InvalidFormatError);
    });
  });

  describe("uint64BE", () => {
    it("encodes small values in low 4 bytes", () => {
      expect(Array.from(uint64BE(0))).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
      expect(Array.from(uint64BE(1))).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
      expect(Array.from(uint64BE(0x12345678))).toEqual([
        0, 0, 0, 0, 0x12, 0x34, 0x56, 0x78,
      ]);
    });

    it("encodes values above 2^32", () => {
      // 2^33 = 8589934592 = 0x0000_0002_0000_0000
      expect(Array.from(uint64BE(2 ** 33))).toEqual([
        0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00,
      ]);
    });

    it("rejects negative or non-integer values", () => {
      expect(() => uint64BE(-1)).toThrow(InvalidFormatError);
      expect(() => uint64BE(1.5)).toThrow(InvalidFormatError);
      expect(() => uint64BE(Number.NaN)).toThrow(InvalidFormatError);
    });

    it("rejects values above MAX_SAFE_INTEGER", () => {
      expect(() => uint64BE(Number.MAX_SAFE_INTEGER + 1)).toThrow(
        InvalidFormatError,
      );
    });
  });

  describe("uint32BE / readUint32BE", () => {
    it("round-trips", () => {
      const v = 0xdeadbeef;
      const bytes = uint32BE(v);
      expect(readUint32BE(bytes, 0)).toBe(v);
    });
  });

  describe("uint16BE / readUint16BE", () => {
    it("round-trips", () => {
      const bytes = uint16BE(0xbabe);
      expect(readUint16BE(bytes, 0)).toBe(0xbabe);
    });
  });

  describe("base64", () => {
    it("round-trips arbitrary bytes", () => {
      const bytes = new Uint8Array([0, 1, 254, 255, 127, 128]);
      const b64 = arrayBufferToBase64(bytes);
      const decoded = base64ToUint8Array(b64);
      expect(decoded).toEqual(bytes);
    });

    it("rejects malformed input", () => {
      expect(() => base64ToUint8Array("not!base64@")).toThrow(InvalidFormatError);
    });
  });

  describe("concatBuffers", () => {
    it("concatenates Uint8Arrays in order", () => {
      const a = new Uint8Array([1, 2, 3]);
      const b = new Uint8Array([4, 5]);
      const c = new Uint8Array([6]);
      expect(Array.from(concatBuffers(a, b, c))).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });
});
