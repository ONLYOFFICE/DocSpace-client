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

import { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import {
  changeApiKeyStatus,
  createApiKey,
  deleteApiKey,
  getApiKeys,
} from "@docspace/shared/api/api-keys";
import { TApiKey, TApiKeyRequest } from "@docspace/shared/api/api-keys/types";

import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import CreateApiKeyDialog from "./sub-components/CreateApiKeyDialog";
import ApiKeysView from "./sub-components";
import { ApiKeysProps } from "./types";

const StyledApiKeys = styled.div`
  width: 100%;

  .api-keys_description {
    box-sizing: border-box;
    max-width: 700px;
    margin-bottom: 24px;

    .api-keys_description-text {
      line-height: 20px;
      color: ${(props) => props.theme.client.settings.common.descriptionColor};
    }
  }
`;

const ApiKeys = (props: ApiKeysProps) => {
  const { t, viewAs } = props;

  const [listItems, setListItems] = useState<TApiKey[]>([]);
  const [createKeyDialogIsVisible, setCreateKeyDialogIsVisible] =
    useState(false);
  const [isRequestRunning, setIsRequestRunning] = useState(false);

  const onCreateKey = (newKey: TApiKeyRequest) => {
    setIsRequestRunning(true);
    createApiKey(newKey)
      .then((key) => {
        setCreateKeyDialogIsVisible(false);
        setListItems((prev) => [...prev, key]);
      })
      .finally(() => setIsRequestRunning(false));
  };

  const onDeleteApiKey = (id: TApiKey["id"]) => {
    deleteApiKey(id).then((res) => {
      if (res) setListItems((prev) => prev.filter((k) => k.id !== id));
    });
  };

  const onChangeApiKeyStatus = (id: TApiKey["id"]) => {
    changeApiKeyStatus(id).then((res) => {
      if (res) {
        const items = listItems.slice();
        const index = items.findIndex((x) => x.id === id);
        items[index].isActive = !items[index].isActive;
        setListItems(items);
      }
    });
  };

  const getKeys = async () => {
    const keys = await getApiKeys();
    setListItems(keys);
  };

  useEffect(() => {
    getKeys();
  }, []);

  useEffect(() => {
    setDocumentTitle(t("Settings:ApiKeys"));
  }, []);

  return (
    <StyledApiKeys>
      <div className="api-keys_description">
        <Text className="api-keys_description-text">
          {t("Settings:ApiKeysDescription")}
        </Text>
      </div>
      <div>
        <Button
          onClick={() => setCreateKeyDialogIsVisible(true)}
          label={t("Settings:CreateNewSecretKey")}
          primary
        />
        <div>
          {listItems.length ? (
            <ApiKeysView
              items={listItems}
              viewAs={viewAs}
              onDeleteApiKey={onDeleteApiKey}
              onChangeApiKeyStatus={onChangeApiKeyStatus}
            />
          ) : null}
        </div>
      </div>
      {createKeyDialogIsVisible ? (
        <CreateApiKeyDialog
          isVisible={createKeyDialogIsVisible}
          setIsVisible={setCreateKeyDialogIsVisible}
          onCreateKey={onCreateKey}
          isRequestRunning={isRequestRunning}
        />
      ) : null}
    </StyledApiKeys>
  );
};

export default inject(({ setup }: TStore) => {
  const { viewAs } = setup;

  return {
    viewAs,
  };
})(withTranslation(["Settings", "Common"])(observer(ApiKeys)));
