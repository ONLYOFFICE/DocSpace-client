// (c) Copyright Ascensio System SIA 2009-2024
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

/* eslint-disable @next/next/no-img-element */

"use client";

import { useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { getLogoUrl } from "@docspace/shared/utils";
import { WhiteLabelLogoType } from "@docspace/shared/enums";

import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import { DEFAULT_PORTAL_TEXT, DEFAULT_ROOM_TEXT } from "@/utils/constants";
import { GreetingCreateUserContainerProps } from "@/types";

import { GreetingContainer } from "./GreetingCreateUserContainer.styled";

export const GreetingCreateUserContainer = ({
  type,
  firstName,
  lastName,
  culture,
  hostName,
}: GreetingCreateUserContainerProps) => {
  const { t } = useTranslation(["Confirm", "Common"]);
  const theme = useTheme();
  const { roomData } = useContext(ConfirmRouteContext);

  const logoUrl = getLogoUrl(
    WhiteLabelLogoType.LoginPage,
    !theme.isBase,
    false,
    culture,
  );

  return (
    <GreetingContainer>
      <img src={logoUrl} className="portal-logo" alt="greeting-logo" />
      {type === "LinkInvite" && (
        <div className="tooltip">
          <Text fontSize="16px">
            {roomData.title ? (
              <Trans
                t={t}
                i18nKey="InvitationToRoom"
                ns="Common"
                defaults={DEFAULT_ROOM_TEXT}
                values={{
                  firstName,
                  lastName,
                  ...(roomData.title
                    ? { roomName: roomData.title }
                    : { spaceAddress: hostName }),
                }}
                components={{
                  1: <Text fontWeight={600} as="strong" fontSize="16px" />,
                }}
              />
            ) : (
              <Trans
                t={t}
                i18nKey="InvitationToPortal"
                ns="Common"
                defaults={DEFAULT_PORTAL_TEXT}
                values={{
                  firstName,
                  lastName,
                  productName: t("Common:ProductName"),
                  ...(roomData.title
                    ? { roomName: roomData.title }
                    : { spaceAddress: hostName }),
                }}
                components={{
                  1: <Text fontWeight={600} as="strong" fontSize="16px" />,
                }}
              />
            )}
          </Text>
        </div>
      )}
    </GreetingContainer>
  );
};
