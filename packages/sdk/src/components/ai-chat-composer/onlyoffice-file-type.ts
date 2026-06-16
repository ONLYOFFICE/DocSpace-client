// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

// ONLYOFFICE c_oAscFileType codes — the scheme the AI chat widget's
// `FileItem` uses to pick an icon (see `getFileIconName` in the library:
// isDocument/isPresentation/isSpreadsheet check category bits 6/7/8; PDF /
// DjVu / XPS / PdfForm are exact constants; Visio uses bit 14).
//
// The widget reads `attachment.type` returned by the server. Until the C#
// `AttachmentDto` echoes a real `Type`, we backfill from the value the
// caller supplied on input (see `HttpAttachmentsStorage.createMany`). So
// what we send here lands directly on the chip.
//
// DocSpace's own `FileType` enum (Unknown=0…Diagram=11) is a category-only
// scheme and is not compatible with this map — never pass it through as
// `type`.

const EXT_TO_CODE: Record<string, number> = {
  // Documents (category bit 6 = 64)
  doc: 66,
  docx: 65,
  docm: 75,
  dotx: 76,
  dotm: 77,
  odt: 67,
  ott: 79,
  fodt: 78,
  rtf: 68,
  txt: 69,
  mht: 71,
  html: 70,
  htm: 70,
  xml: 70,
  epub: 72,
  fb2: 73,
  mobi: 74,
  docxf: 83,
  oform: 84,
  md: 69,
  // Presentations (bit 7 = 128)
  ppt: 130,
  pptx: 129,
  pptm: 134,
  ppsx: 132,
  ppsm: 133,
  potx: 135,
  potm: 136,
  odp: 131,
  otp: 138,
  fodp: 137,
  // Spreadsheets (bit 8 = 256)
  xls: 258,
  xlsx: 257,
  xlsm: 261,
  xltx: 262,
  xltm: 263,
  ods: 259,
  ots: 265,
  fods: 264,
  csv: 260,
  // PDF family (exact codes — predicates compare to literals)
  pdf: 513,
  djvu: 515,
  djv: 515,
  xps: 516,
  oxps: 516,
  // Visio (bit 14 = 16384)
  vsd: 16385,
  vsdx: 16385,
  vsdm: 16391,
  vss: 16387,
  vssx: 16387,
  vssm: 16393,
  vst: 16389,
  vstx: 16389,
  vstm: 16395,
};

const extOf = (titleOrExt: string): string => {
  const dot = titleOrExt.lastIndexOf(".");
  return (dot >= 0 ? titleOrExt.slice(dot + 1) : titleOrExt).toLowerCase();
};

export const getOnlyofficeFileType = (titleOrExt: string): number =>
  EXT_TO_CODE[extOf(titleOrExt)] ?? 0;
