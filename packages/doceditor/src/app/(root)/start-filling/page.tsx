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

import {
  getFileById,
  getFormFillingStatus,
  getSettings,
  getUser,
} from "@/utils/actions";
import { CompletedVDRForm } from "@/components/completed-form/CompletedVDRForm";
import { CompletedFormEmpty } from "@/components/completed-form/CompletedForm.empty";

import { logger } from "@/../logger.mjs";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function Page(props: PageProps) {
  const { searchParams: sp } = props;
  const searchParams = await sp;
  const { formId, roomId, share } = searchParams;

  logger.info("Open start filling form page");

  const [formFillingStatus, file, user, settings] = await Promise.all([
    getFormFillingStatus(formId!),
    getFileById(formId!),
    getUser(),
    getSettings(share),
  ]);

  if (
    !file ||
    !user ||
    !roomId ||
    !formId ||
    !settings ||
    settings === "access-restricted"
  )
    return <CompletedFormEmpty />;

  return (
    <CompletedVDRForm
      file={file}
      user={user}
      roomId={roomId}
      isStartFilling
      formFillingStatus={formFillingStatus}
      settings={settings}
    />
  );
}

export default Page;
