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

// Shows HTML that a plugin hands over (a mail body, an HTML file) under this
// page's own Content Security Policy, which nginx sets for /static/html-frame/
// instead of the portal one: the content may load images, styles, fonts and
// media from any site. It never runs scripts, because its frame has no
// allow-scripts, and it cannot reach the portal, because the frame has no
// allow-same-origin either. Only the same-origin page that framed this one may
// hand content over.
//
// Messages:
//   to the parent, once on load: { type: "html-frame-ready" }
//   from the parent: { type: "html-frame-content", html, title? }, all strings
(() => {
  const frame = document.getElementById("content");

  window.addEventListener("message", (event) => {
    if (
      event.source !== window.parent ||
      event.origin !== window.location.origin
    )
      return;
    const data = event.data;
    if (
      !data ||
      data.type !== "html-frame-content" ||
      typeof data.html !== "string"
    )
      return;
    if (typeof data.title === "string") frame.title = data.title;
    frame.srcdoc = data.html;
  });

  window.parent.postMessage(
    { type: "html-frame-ready" },
    window.location.origin,
  );
})();
