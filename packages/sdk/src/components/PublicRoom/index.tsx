"use client";

import React from "react";
import { ValidationStatus } from "@docspace/shared/enums";
import Section from "@docspace/shared/components/section";
import { Text } from "@docspace/shared/components/text";

import { PublicRoomProps } from "./PublicRoom.types";

const PublicRoom = ({ roomData }: PublicRoomProps) => {
  if (!roomData || roomData.status !== ValidationStatus.Ok) {
    return (
      <Section.SectionBody>
        <Text fontSize="16px">Room not found or access denied</Text>
      </Section.SectionBody>
    );
  }

  return (
    <div>
      {roomData.files?.length === 0 && roomData.folders?.length === 0 ? (
        <Text>This room is empty</Text>
      ) : (
        <Text>
          Room has {roomData.files?.length} files and {roomData.folders?.length}{" "}
          folders
        </Text>
      )}
    </div>
  );
};

export default PublicRoom;
