// (c) Copyright Ascensio System SIA 2010-2024
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

import { Trans } from "react-i18next";
import React from "react";

import { Text } from "@docspace/shared/components/text";

interface IGreetingContainer {
  roomName?: string;
  firstName?: string;
  lastName?: string;
  greetingSettings?: string;
  logoUrl: string;
  type: string;
  t: (key: string) => string;
}

const DEFAULT_ROOM_TEXT =
  "<strong>{{firstName}} {{lastName}}</strong> invites you to join the room <strong>{{roomName}}</strong> for secure document collaboration.";
const DEFAULT_PORTAL_TEXT =
  "<strong>{{firstName}} {{lastName}}</strong> invites you to join the room <strong>{{roomName}}</strong> for secure document collaboration.";
const GreetingContainer = ({
  roomName,
  firstName,
  lastName,
  greetingSettings,
  logoUrl,
  type,
  t,
}: IGreetingContainer) => {
  return (
    <>
      <img src={logoUrl} className="logo-wrapper" />
      {type !== "invitation" && (
        <Text
          fontSize="23px"
          fontWeight={700}
          textAlign="center"
          className="greeting-title"
        >
          {greetingSettings}
        </Text>
      )}

      {type === "invitation" && (
        <div className="greeting-container">
          <Text fontSize="16px">
            <Trans
              t={t}
              i18nKey={roomName ? "InvitationToRoom" : "InvitationToPortal"}
              ns="Common"
              defaults={roomName ? DEFAULT_ROOM_TEXT : DEFAULT_PORTAL_TEXT}
              values={{
                firstName,
                lastName,
                ...(roomName
                  ? { roomName }
                  : { spaceAddress: window.location.host }),
              }}
              components={{
                1: <Text fontWeight={600} as="strong" fontSize="16px" />,
              }}
            />
          </Text>
        </div>
      )}
    </>
  );
};

export default GreetingContainer;
