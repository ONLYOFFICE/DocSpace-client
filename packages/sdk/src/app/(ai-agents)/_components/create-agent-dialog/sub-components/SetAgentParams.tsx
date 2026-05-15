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

// Slim port of client SetAgentParams.tsx. The full client form depends on
// client-only components/stores that do not exist in SDK (TagHandler,
// TagInput, ItemIcon, InputParam, AvatarEditorDialog, ChangeRoomOwner,
// RoomQuota, DialogsStore cover model, InfoPanelStore icon resolver,
// AvatarEditorDialogStore upload flow). To keep the SDK route group focused
// and isolated we render the core fields only: name, model, instructions,
// MCP. Visuals (logo/cover editor, tag input, owner change, quota toggle)
// can be reintroduced once the corresponding SDK utilities are ported.

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import {
  TextInput,
  InputSize,
  InputType,
} from "@docspace/ui-kit/components/text-input";
import { isMobile } from "@docspace/shared/utils";
import { removeEmojiCharacters } from "@docspace/shared/utils";

import type { TAgentParams } from "@docspace/shared/utils/aiAgents";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector";

import ModelSettings from "./Model";
import InstructionsSettings from "./Instructions";
import MCPSettings from "./MCP";

import styles from "./SetAgentParams.module.scss";

type SetAgentParamsProps = {
  agentParams: TAgentParams;
  setAgentParams: (value: Partial<TAgentParams>) => void;
  setIsScrollLocked?: (value: boolean) => void;
  isEdit?: boolean;
  isDisabled: boolean;
  isValidTitle: boolean;
  setIsValidTitle: (value: boolean) => void;
  isWrongTitle: boolean;
  setIsWrongTitle: (value: boolean) => void;
  onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  portalMcpServerId?: string;
  onClickAction?: () => void;
  selectedServers?: TSelectorItem[];
  setSelectedServers?: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;
  folderFormValidation?: RegExp;
};

const SetAgentParams = ({
  agentParams,
  setAgentParams,
  isDisabled,
  isValidTitle,
  setIsValidTitle,
  isWrongTitle,
  setIsWrongTitle,
  onKeyUp,
  portalMcpServerId,
  onClickAction,
  selectedServers,
  setSelectedServers,
  folderFormValidation,
}: SetAgentParamsProps) => {
  const { t } = useTranslation([
    "CreateEditRoomDialog",
    "Translations",
    "Common",
  ]);

  const [title, setTitle] = React.useState(agentParams.title);

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsValidTitle(true);
    let newValue = e.target.value;

    newValue = removeEmojiCharacters(newValue);

    if (folderFormValidation && newValue.match(folderFormValidation)) {
      setIsWrongTitle(true);
    } else {
      setIsWrongTitle(false);
    }

    setTitle(newValue);
    setAgentParams({ title: newValue });
  };

  return (
    <div className={styles.setAgentParams}>
      <div className={styles.logoNameContainer}>
        <RoomIcon
          title={title}
          showDefault
          size={isMobile() ? "96px" : "64px"}
          radius={isMobile() ? "18px" : "12px"}
          className="room-params-icon"
        />

        <FieldContainer
          isVertical
          labelText={`${t("Common:AgentName")}:`}
          isRequired
          hasError={!isValidTitle || isWrongTitle}
          errorMessage={
            isWrongTitle
              ? t("Common:ContainsSpecCharacter")
              : t("Common:RequiredField")
          }
          style={{ flex: 1 }}
        >
          <TextInput
            id="shared_agent-name"
            type={InputType.text}
            value={title}
            onChange={onChangeName}
            scale
            isDisabled={isDisabled}
            size={InputSize.base}
            placeholder={t("Common:EnterName")}
            onKeyUp={onKeyUp}
            isAutoFocussed
            hasError={!isValidTitle || isWrongTitle}
            testId="create_edit_agent_input"
          />
        </FieldContainer>
      </div>

      <ModelSettings
        agentParams={agentParams}
        setAgentParams={setAgentParams}
      />

      <InstructionsSettings
        agentParams={agentParams}
        setAgentParams={setAgentParams}
      />

      <MCPSettings
        agentParams={agentParams}
        setAgentParams={setAgentParams}
        portalMcpServerId={portalMcpServerId}
        onClickAction={onClickAction}
        selectedServers={selectedServers}
        setSelectedServers={setSelectedServers}
      />
    </div>
  );
};

export default SetAgentParams;
