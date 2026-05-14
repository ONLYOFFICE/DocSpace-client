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

import React, { useMemo } from "react";
import { inject, observer } from "mobx-react";

import type { TUser } from "@docspace/shared/api/people/types";
import type {
  TCurrentFile,
  PluginRuntime,
} from "@onlyoffice/docspace-plugin-sdk/react";
import { withPluginRuntime } from "@onlyoffice/docspace-plugin-sdk/react";

import type PluginStore from "SRC_DIR/store/PluginStore";

import { PluginErrorBoundary } from "./PluginErrorBoundary";

type Props = {
  pluginName: string;
  component: React.ComponentType;
  currentFile?: TCurrentFile | null;
  // injected by MobX
  currentUser?: TUser | null;
  pluginStore?: PluginStore;
};

const PluginWrappedComponent = ({
  pluginName,
  component,
  currentFile = null,
  currentUser,
  pluginStore,
}: Props) => {
  const runtime: PluginRuntime = useMemo(
    () =>
      pluginStore!.buildReactPluginRuntime(
        pluginName,
        currentFile,
        currentUser ?? null,
      ),
    [pluginName, currentFile, currentUser, pluginStore],
  );

  // withPluginRuntime wraps the component with LocalRuntimeContext.Provider
  // so that usePluginActions/useCurrentFile hooks work inside the component.
  // The plugin uses the host's SDK copy (via shim) — same context reference.
  const ComponentWithRuntime = useMemo(
    () => withPluginRuntime(component),
    [component],
  );

  return (
    <PluginErrorBoundary pluginName={pluginName}>
      <ComponentWithRuntime runtime={runtime} />
    </PluginErrorBoundary>
  );
};

PluginWrappedComponent.displayName = "PluginWrappedComponent";

export default inject(({ userStore, pluginStore }: TStore) => ({
  currentUser: userStore.user,
  pluginStore,
}))(observer(PluginWrappedComponent));

