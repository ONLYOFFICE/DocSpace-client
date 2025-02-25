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

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getObjectByLocation } from "@docspace/shared/utils/common";
import ErrorContainer from "@docspace/shared/components/error-container/ErrorContainer";
import Section from "@docspace/shared/components/section";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import SectionWrapper from "SRC_DIR/components/Section";

const ThirdPartyResponsePage = ({ match }) => {
  const { params } = match;
  const { provider } = params;
  const { t } = useTranslation("Errors");
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = getObjectByLocation(window.location);
    const code = urlParams ? urlParams.code || null : null;
    const errorMessage = urlParams ? urlParams.error || null : null;
    setDocumentTitle(provider);
    if (errorMessage) {
      setError(errorMessage);
    } else if (code) {
      localStorage.setItem("code", code);
      window.close();
    } else {
      setError(t("ErrorEmptyResponse"));
    }
  }, [t, provider]);

  return (
    <SectionWrapper>
      <Section.SectionBody>
        {error ? (
          <ErrorContainer bodyText={error} />
        ) : (
          <RectangleSkeleton height="96vh" />
        )}
      </Section.SectionBody>
    </SectionWrapper>
  );
};

export default ThirdPartyResponsePage;
