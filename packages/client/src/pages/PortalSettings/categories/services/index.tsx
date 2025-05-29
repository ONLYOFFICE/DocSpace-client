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

import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { toastr } from "@docspace/shared/components/toast";

import AdditionalStorage from "./AdditionalStorage";
import StorageDialog from "./StorageDialog";
import ServicesLoader from "./ServicesLoader";

type ServicesProps = {
  servicesInit: () => void;
  isInitServicesPage: boolean;
};

let timerId: NodeJS.Timeout | null = null;

const Services: React.FC<ServicesProps> = ({
  servicesInit,
  isInitServicesPage,
}) => {
  const { t, ready } = useTranslation(["Payments", "Common"]);
  const [isVisible, setIsVisible] = useState(false);

  const [showLoader, setShowLoader] = useState(false);
  const shouldShowLoader = !isInitServicesPage || !ready;

  useEffect(() => {
    const fetchData = async () => {
      try {
        await servicesInit();
      } catch (error) {
        toastr.error(t("Common:UnexpectedError"));
      }
    };

    fetchData();
  }, [servicesInit]);

  useEffect(() => {
    timerId = setTimeout(() => {
      setShowLoader(true);
    }, 200);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const onClick = () => {
    setIsVisible(true);
  };

  const onClose = () => {
    setIsVisible(false);
  };

  return shouldShowLoader ? (
    showLoader ? (
      <ServicesLoader />
    ) : null
  ) : (
    <>
      <AdditionalStorage onClick={onClick} />
      {isVisible ? (
        <StorageDialog visible={isVisible} onClose={onClose} />
      ) : null}
    </>
  );
};

export const Component = inject(({ paymentStore }: TStore) => {
  const { servicesInit, isInitServicesPage } = paymentStore;

  return {
    servicesInit,
    isInitServicesPage,
  };
})(observer(Services));

export default Component;
