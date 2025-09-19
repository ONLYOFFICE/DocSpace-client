// (c) Copyright Ascensio System SIA 2009-2025
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

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import PlusReactSvgUrl from "PUBLIC_DIR/images/icons/16/plus.svg";

import { RectangleSkeleton } from "../../../../../skeletons";

import { Text } from "../../../../text";

import { useMessageStore } from "../../../store/messageStore";
import { useChatStore } from "../../../store/chatStore";

import styles from "../ChatHeader.module.scss";

const CreateChat = ({ isLoadingProp }: { isLoadingProp?: boolean }) => {
  const { messages, isRequestRunning, startNewChat } = useMessageStore();
  const { setCurrentChat } = useChatStore();

  const { t } = useTranslation(["Common"]);

  if (isLoadingProp)
    return (
      <RectangleSkeleton
        width="96px"
        height="32px"
        borderRadius="3px"
        style={{ minWidth: "32px" }}
      />
    );

  if (messages.length === 0) return null;

  const onClickAction = () => {
    if (isRequestRunning) return;

    setCurrentChat(null);
    startNewChat();
  };

  return (
    <div className={styles.createChat} onClick={onClickAction}>
      <PlusReactSvgUrl />
      <Text fontSize="14px" lineHeight="16px" fontWeight={600}>
        {t("AINewChat")}
      </Text>
    </div>
  );
};

export default observer(CreateChat);
