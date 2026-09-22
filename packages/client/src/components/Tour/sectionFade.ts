/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import "./sectionFade.module.scss";

// The section's content box.
const SECTION_CONTENT_SELECTOR = ".section-wrapper-content";
const FADE_CLASS = "tour-section-fade";
const FADE_OUT_CLASS = "tour-section-fade-out";

/** Matches the transition in sectionFade.module.scss. */
export const SECTION_FADE_MS = 150;

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * The box the loader is centred in: the section's own, run down to the bottom
 * of the window. An emptied section is only as tall as what it is showing,
 * which is nothing here.
 */
export function sectionBox() {
  const rect = document
    .querySelector(SECTION_CONTENT_SELECTOR)
    ?.getBoundingClientRect();

  if (!rect) return undefined;

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: Math.max(rect.height, window.innerHeight - rect.top),
  };
}

/** No transition: the section must not paint what the swap is about to drop. */
export function hideSection() {
  document
    .querySelector(SECTION_CONTENT_SELECTOR)
    ?.classList.add(FADE_OUT_CLASS);
}

export async function fadeSectionOut() {
  const section = document.querySelector(SECTION_CONTENT_SELECTOR);
  if (!section) return;

  section.classList.add(FADE_CLASS, FADE_OUT_CLASS);
  await wait(SECTION_FADE_MS);
}

export function fadeSectionIn() {
  const section = document.querySelector(`.${FADE_OUT_CLASS}`);
  if (!section) return;

  section.classList.add(FADE_CLASS);
  section.classList.remove(FADE_OUT_CLASS);
  setTimeout(() => section.classList.remove(FADE_CLASS), SECTION_FADE_MS);
}

/** Runs `swap` with the section hidden, and brings it back afterwards. */
export async function throughSectionFade(swap: () => Promise<void>) {
  await fadeSectionOut();

  try {
    await swap();
  } finally {
    fadeSectionIn();
  }
}

/** For a tour that ended mid-fade. */
export function clearSectionFade() {
  document
    .querySelector(`.${FADE_CLASS}, .${FADE_OUT_CLASS}`)
    ?.classList.remove(FADE_CLASS, FADE_OUT_CLASS);
}
