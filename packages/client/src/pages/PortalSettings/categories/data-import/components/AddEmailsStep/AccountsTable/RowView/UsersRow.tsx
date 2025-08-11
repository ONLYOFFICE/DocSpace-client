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

import { useState, useRef } from "react";
import { Row } from "@docspace/shared/components/rows";
import UsersRowContent from "./UsersRowContent";
import { AddEmailUsersRowProps } from "../../../../types";

const UsersRow = (props: AddEmailUsersRowProps) => {
  const {
    data,
    sectionWidth,
    isChecked,
    toggleAccount,
    isEmailOpen,
    setOpenedEmailKey,
  } = props;

  const emailInputRef = useRef<HTMLDivElement>(null);
  const emailTextRef = useRef<HTMLSpanElement>(null);

  const [isPrevEmailValid, setIsPrevEmailValid] = useState(
    data.email?.length > 0,
  );

  const handleAccountToggle = (e: React.MouseEvent) => {
    if (
      isPrevEmailValid &&
      !emailInputRef.current?.contains(e.target as Node) &&
      !emailTextRef.current?.contains(e.target as Node)
    ) {
      toggleAccount();
    }
  };

  return (
    <Row
      checked={isChecked}
      onRowClick={handleAccountToggle}
      onSelect={toggleAccount}
      isDisabled={!isPrevEmailValid}
      contextButtonSpacerWidth="0"
    >
      <UsersRowContent
        id={data.key}
        sectionWidth={sectionWidth}
        displayName={data.displayName}
        email={data.email || ""}
        emailInputRef={emailInputRef}
        emailTextRef={emailTextRef}
        isChecked={isChecked}
        isEmailOpen={isEmailOpen}
        setOpenedEmailKey={setOpenedEmailKey}
        setIsPrevEmailValid={setIsPrevEmailValid}
        toggleAccount={toggleAccount}
      />
    </Row>
  );
};

export default UsersRow;
