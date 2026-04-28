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

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components";

import PluginStore from "SRC_DIR/store/PluginStore";
import { getBrandName } from "@docspace/shared/constants/brands";

export type UsePluginUploadProps = {
  addPlugin: PluginStore["addPlugin"];
};

const usePluginUpload = ({ addPlugin }: UsePluginUploadProps) => {
  const { t } = useTranslation(["WebPlugins", "Common"]);
  const [showCacheWarning, setShowCacheWarning] = useState(false);

  const handleAddPluginResult = useCallback(
    (result: Awaited<ReturnType<typeof addPlugin>>) => {
      if (!result) return;

      const { isPluginCompatible, isPluginInCache } = result;

      if (isPluginInCache) {
        setShowCacheWarning(true);
        return;
      }

      if (!isPluginCompatible) {
        toastr.error(
          t("PluginIsNotCompatible", {
            productName: getBrandName("ProductName"),
          }),
        );
      } else {
        toastr.success(t("PluginLoadedSuccessfully"));
      }
    },
    [t],
  );

  const onDrop = useCallback(
    async (files: File[]) => {
      const formData = new FormData();

      formData.append("file", files[0]);

      const result = await addPlugin(formData);
      handleAddPluginResult(result);
    },
    [addPlugin, handleAddPluginResult],
  );

  const handleCloseCacheWarning = useCallback(() => {
    setShowCacheWarning(false);
  }, []);

  return {
    onDrop,
    showCacheWarning,
    handleCloseCacheWarning,
  };
};

export default usePluginUpload;
