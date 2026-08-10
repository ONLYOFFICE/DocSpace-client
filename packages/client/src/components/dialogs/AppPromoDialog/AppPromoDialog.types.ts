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

import type { AppId } from "SRC_DIR/helpers/apps-catalog";

// SVG imported as a React component (e.g. via `PUBLIC_DIR/images/...svg`).
export type SvgComponent = React.FC<React.SVGProps<SVGSVGElement>>;

// One feature row shown on the left column of the promo: a small icon plus a
// title and a short description. Text fields are already-localized strings —
// the config resolves them via `t()`; the dialog stays layout-only.
export type AppPromoFeature = {
  /** Icon rendered inside the tinted square. SVG-as-component. */
  Icon: SvgComponent;
  title: string;
  description: string;
};

// All the per-app content the generic `AppPromoDialog` needs. Every app
// (ai-files, ai-rooms, ai-forms, …) supplies one of these; only the content
// differs, the layout is shared. Text fields are already-localized strings.
export type AppPromoContent = {
  /** Modal header / app name (e.g. "Files"). */
  title: string;
  /** One-line tagline under the header. */
  subtitle: string;
  /** Longer intro paragraph above the feature list. */
  description: string;
  /** Feature rows (the screenshot shows four). */
  features: AppPromoFeature[];
  /**
   * Right-column illustration for the light theme. A URL, not a component:
   * the illustrations are ~1 MB SVGs, so they are imported with `?url` and
   * rendered as `<img>` instead of being inlined into the JS chunk.
   */
  illustrationLight: string;
  /** Right-column illustration for the dark theme. Same `?url` rule. */
  illustrationDark: string;
  /** Primary action label (e.g. "Open Files"). */
  openLabel: string;
  /**
   * "Take a tour" label. Set only for apps that have an onboarding tour — the
   * button is left out entirely for the ones that don't.
   */
  tourLabel?: string;
  /**
   * Accessible name / hover title for the icon-only repo action (e.g. "View on
   * GitHub"). Not rendered as visible text.
   */
  githubLabel: string;
  /** Public GitHub repo URL opened by the secondary action. */
  githubUrl: string;
};

export type AppPromoDialogProps = {
  visible: boolean;
  /** Content config for the app being promoted. */
  content: AppPromoContent;
  /** Fired by the close icon / backdrop — dismiss without navigating. */
  onClose: () => void;
  /** Fired by the primary "Open …" button — navigate to the app. */
  onOpen: () => void;
  /**
   * Fired by the "Take a tour" button — open the app and walk the user through
   * it. Omitted when no tour can run (no tour for this app, or mobile), which
   * also hides the button.
   */
  onTakeTour?: () => void;
};

// The promo content keyed by app, so callers just pass an `AppId`.
export type AppPromoContentMap = Partial<Record<AppId, AppPromoContent>>;
