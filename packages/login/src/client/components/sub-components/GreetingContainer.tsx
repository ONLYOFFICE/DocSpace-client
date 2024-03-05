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
