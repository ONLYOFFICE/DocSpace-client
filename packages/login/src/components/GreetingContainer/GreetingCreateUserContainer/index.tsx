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

"use client";

import { useContext } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";

import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import {
  DEFAULT_PORTAL_TEXT,
  DEFAULT_ROOM_TEXT,
  DEFAULT_AGENT_TEXT,
} from "@/utils/constants";
import { GreetingCreateUserContainerProps } from "@/types";

import { Logo } from "@/components/Logo";
import styles from "./GreetingCreateUserContainer.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

export const GreetingCreateUserContainer = ({
  type,
  displayName,
  culture,
  hostName,
}: GreetingCreateUserContainerProps) => {
  const { t } = useTranslation(["Confirm", "Common"]);

  const { roomData } = useContext(ConfirmRouteContext);

  const getInviteText = () => {
    const commonProps = {
      t,
      ns: "Common",
      components: {
        1: (
          <Text
            key="component_key"
            fontWeight={600}
            as="strong"
            fontSize="16px"
          />
        ),
      },
    };

    if (roomData?.isAgent) {
      return (
        <Trans
          {...commonProps}
          i18nKey="InvitationToAgent"
          defaults={DEFAULT_AGENT_TEXT}
          values={{
            displayName,
            agentName: roomData.title,
            aiAgent: t("Common:AIAgent"),
          }}
        />
      );
    }

    if (roomData?.title) {
      return (
        <Trans
          {...commonProps}
          i18nKey="InvitationToRoom"
          defaults={DEFAULT_ROOM_TEXT}
          values={{
            displayName,
            ...(roomData.title
              ? { roomName: roomData.title }
              : { spaceAddress: hostName }),
          }}
        />
      );
    }

    return (
      <Trans
        {...commonProps}
        i18nKey="InvitationToPortal"
        defaults={DEFAULT_PORTAL_TEXT}
        values={{
          displayName,
          productName: getBrandName("ProductName"),
          ...(roomData.title
            ? { roomName: roomData.title }
            : { spaceAddress: hostName }),
        }}
      />
    );
  };

  return (
    <div className={styles.greetingContainer}>
      <Logo culture={culture} />
      {type === "LinkInvite" ? (
        <div className={styles.tooltip}>
          <Text fontSize="16px">{getInviteText()}</Text>
        </div>
      ) : null}
    </div>
  );
};
