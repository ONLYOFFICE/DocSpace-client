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

import type { IHtmlFrame } from "@onlyoffice/docspace-plugin-sdk";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

// The page that shows HTML a plugin hands over under a Content Security Policy
// of its own (nginx serves /static/html-frame/ outside the portal's policy), so
// that a mail body or an HTML file loads its images, styles and fonts.
const PAGE_PATH = "/static/html-frame/html-frame.html";
const READY = "html-frame-ready";
const CONTENT = "html-frame-content";

type Content = { html: string; title?: string };

const contents = new WeakMap<HTMLIFrameElement, Content>();
const readyFrames = new WeakSet<HTMLIFrameElement>();
let listening = false;

const pageUrl = () =>
  new URL(
    combineUrl(window.ClientConfig?.proxy?.url, PAGE_PATH),
    window.location.origin,
  ).href;

const post = (frame: HTMLIFrameElement, content: Content) =>
  frame.contentWindow?.postMessage(
    { type: CONTENT, html: content.html, title: content.title },
    window.location.origin,
  );

// A "ready" message names the page's window; the frame is found by it among the
// frames in the document, so a removed frame keeps nothing alive here.
const frameOf = (source: MessageEventSource | null) =>
  Array.from(document.getElementsByTagName("iframe")).find(
    (frame) => frame.contentWindow === source,
  );

// The page reports every load, so a frame that reloads gets its HTML again.
const onMessage = (event: MessageEvent) => {
  if (event.origin !== window.location.origin) return;
  if (event.data?.type !== READY) return;

  const frame = frameOf(event.source);
  const content = frame && contents.get(frame);
  if (!frame || !content) return;

  readyFrames.add(frame);
  post(frame, content);
};

/**
 * Shows HTML in a plugin's frame on the html-frame page: points the frame at
 * the page and hands the HTML over once the page is ready; new HTML for the
 * same frame goes to the page at once. The page sandboxes the content itself,
 * so the frame loses any sandbox and srcdoc the plugin gave it.
 */
export const showHtmlInFrame = ({ frameId, html, title }: IHtmlFrame) => {
  const frame = document.getElementById(frameId);
  if (!(frame instanceof HTMLIFrameElement)) return;

  if (!listening) {
    window.addEventListener("message", onMessage);
    listening = true;
  }

  if (title !== undefined) frame.title = title;

  const content = { html, title };
  contents.set(frame, content);

  const url = pageUrl();
  if (
    frame.src !== url ||
    frame.hasAttribute("srcdoc") ||
    frame.hasAttribute("sandbox")
  ) {
    readyFrames.delete(frame);
    frame.removeAttribute("srcdoc");
    frame.removeAttribute("sandbox");
    frame.src = url;
    return;
  }

  if (readyFrames.has(frame)) post(frame, content);
};
