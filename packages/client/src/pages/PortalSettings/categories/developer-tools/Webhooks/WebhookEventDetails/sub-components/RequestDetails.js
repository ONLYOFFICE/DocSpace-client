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

import React from "react";
import styled from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { Textarea } from "@docspace/shared/components/textarea";
import { inject, observer } from "mobx-react";

import DangerIcon from "PUBLIC_DIR/images/danger.toast.react.svg?url";
import { useTranslation } from "react-i18next";

const DetailsWrapper = styled.div`
  width: 100%;

  .textareaBody {
    height: 50vh !important;
  }

  .mt-7 {
    margin-top: 7px;
  }

  .mt-16 {
    margin-top: 16px;
  }

  .mb-4 {
    margin-bottom: 4px;
  }
`;
const ErrorMessageTooltip = styled.div`
  box-sizing: border-box;

  width: 100%;
  max-width: 1200px;
  padding: 8px 12px;
  background: #f7cdbe;

  box-shadow: 0px 5px 20px rgba(4, 15, 27, 0.07);
  border-radius: 6px;
  display: flex;
  align-items: center;

  margin-bottom: 16px;

  color: black;

  img {
    margin-inline-end: 8px;
  }
`;

function isJSON(jsonString) {
  try {
    const parsedJson = JSON.parse(jsonString);
    return parsedJson && typeof parsedJson === "object";
  } catch (e) {}

  return false;
}

const RequestDetails = ({ eventDetails }) => {
  const { t } = useTranslation(["Webhooks"]);

  return (
    <DetailsWrapper>
      {eventDetails.status === 0 && (
        <ErrorMessageTooltip>
          <img src={DangerIcon} alt="danger icon" />
          {t("FailedToConnect")}
        </ErrorMessageTooltip>
      )}
      <Text as="h3" fontWeight={600} className="mb-4 mt-7">
        {t("RequestPostHeader")}
      </Text>
      {!eventDetails.requestHeaders ? (
        <Textarea isDisabled />
      ) : (
        <Textarea
          classNameCopyIcon="request-header-copy"
          value={eventDetails.requestHeaders}
          enableCopy
          hasNumeration
          isFullHeight
          isJSONField
          copyInfoText={t("RequestHeaderCopied")}
        />
      )}

      <Text as="h3" fontWeight={600} className="mb-4 mt-16">
        {t("RequestPostBody")}
      </Text>
      {isJSON(eventDetails.requestPayload) ? (
        <Textarea
          classNameCopyIcon="request-body-copy"
          value={eventDetails.requestPayload}
          isJSONField
          enableCopy
          hasNumeration
          isFullHeight
          copyInfoText={t("RequestBodyCopied")}
        />
      ) : (
        <Textarea
          value={eventDetails.requestPayload}
          heightScale
          className="textareaBody"
        />
      )}
    </DetailsWrapper>
  );
};

export default inject(({ webhooksStore }) => {
  const { eventDetails } = webhooksStore;

  return { eventDetails };
})(observer(RequestDetails));
