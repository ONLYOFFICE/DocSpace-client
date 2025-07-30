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

import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Text } from "@docspace/shared/components/text";
import { TRoom } from "@docspace/shared/api/rooms/types";
import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { useTheme } from "@docspace/shared/hooks/useTheme";
import { TGroup } from "@docspace/shared/api/groups/types";

import EmptyScreenPersonSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
import EmptyScreenPersonSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_persons_dark.svg?url";
import EmptyScreenAltSvgUrl from "PUBLIC_DIR/images/empty_screen_alt.svg?url";
import EmptyScreenAltSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_alt_dark.svg?url";

import { TPeopleListItem } from "SRC_DIR/helpers/contacts";

import styles from "./SeveralItems.module.scss";

type SeveralItemsProps = {
  isGroups?: boolean;
  isUsers?: boolean;
  selectedItems: TPeopleListItem[] | TGroup[] | (TRoom | TFile | TFolder)[];
};

const SeveralItems = ({
  isGroups,
  isUsers,
  selectedItems,
}: SeveralItemsProps) => {
  const { t } = useTranslation(["InfoPanel"]);
  const { isBase } = useTheme();

  const emptyScreenAlt = isBase
    ? EmptyScreenAltSvgUrl
    : EmptyScreenAltSvgDarkUrl;

  const emptyScreenPerson = isBase
    ? EmptyScreenPersonSvgUrl
    : EmptyScreenPersonSvgDarkUrl;

  const isContacts = isGroups || isUsers;

  const imgSrc = isContacts ? emptyScreenPerson : emptyScreenAlt;

  const itemsText = isGroups
    ? t("InfoPanel:SelectedGroups")
    : isUsers
      ? t("InfoPanel:SelectedUsers")
      : t("InfoPanel:ItemsSelected");

  return (
    <div className={classNames("no-thumbnail-img-wrapper", styles.container)}>
      <img src={imgSrc} alt="Several items" />
      <Text fontSize="16px" fontWeight={700}>
        {`${itemsText}: ${selectedItems.length}`}
      </Text>
    </div>
  );
};

export default SeveralItems;
