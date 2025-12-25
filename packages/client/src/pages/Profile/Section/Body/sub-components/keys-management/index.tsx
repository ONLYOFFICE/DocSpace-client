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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  TextInput,
  InputType,
  InputSize,
} from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";

import styles from "./keys-management.module.scss";

type KeysManagementProps = {
  userKeys?: boolean;
  setUserKeys?: () => void;
  encryptionKeys?: TEncryptionKeyPair[] | null;
};

const KeysManagement = ({
  userKeys,
  setUserKeys,
  encryptionKeys,
}: KeysManagementProps) => {
  //const { t } = useTranslation(["Common"]);

  const [keyWord, setKeyWord] = React.useState("");

  const keys = encryptionKeys ? (
    encryptionKeys
  ) : (
    <div>No encryption keys available.</div>
  );

  const onChangeKeyWord = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setKeyWord(value);
  };

  return (
    <div className={styles.sectionBody}>
      <div className={styles.categoryTitle}>
        <Text fontSize="14px" fontWeight={600}>
          Generate or upload your encryption keys
        </Text>
      </div>
      <div className={styles.contentBody}>
        <div className={styles.inputGroup}>
          <TextInput
            type={InputType.text}
            size={InputSize.middle}
            id="keyWord"
            name="keyWord"
            onChange={onChangeKeyWord}
            value={keyWord}
            scale={false}
            tabIndex={11}
            testId="keyWord_input"
          />
          <Button
            size={ButtonSize.small}
            onClick={setUserKeys}
            label="Generate"
          />
          <div className={styles.buttonsSeparator}>or</div>
          <Button
            primary={true}
            size={ButtonSize.small}
            onClick={setUserKeys}
            label="Upload"
          />
        </div>
      </div>
      <div className={styles.categoryTitle}>
        <Text fontSize="14px" fontWeight={600}>
          User keys
        </Text>
      </div>
      <div className={styles.contentBody}>{keys}</div>
    </div>
  );
};

export default inject(({ userStore }: TStore) => {
  const { encryptionKeys } = userStore;

  return {
    encryptionKeys,
  };
})(observer(KeysManagement));
