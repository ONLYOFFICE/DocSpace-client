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
import AppLoader from "@docspace/shared/components/app-loader";
import Error404 from "@docspace/shared/components/errors/Error404";

import ErrorBoundary from "../ErrorBoundaryWrapper";
import { Error520Component } from "../Error520Wrapper";

function loadComponent(scope, module) {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await __webpack_init_sharing__("default");
    const container = window[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
}

const useDynamicScript = (args) => {
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!args.url) {
      return;
    }

    const exists = document.getElementById(args.id);

    if (exists) {
      setReady(true);
      setFailed(false);
      return;
    }

    const element = document.createElement("script");

    element.id = args.id;
    element.src = args.url;
    element.type = "text/javascript";
    element.async = true;

    setReady(false);
    setFailed(false);

    element.onload = () => {
      console.log(`Dynamic Script Loaded: ${args.url}`);
      setReady(true);
    };

    element.onerror = () => {
      console.error(`Dynamic Script Error: ${args.url}`);
      setReady(false);
      setFailed(true);
    };

    document.head.appendChild(element);

    // TODO: Comment if you don't want to remove loaded remoteEntry
    return () => {
      console.log(`Dynamic Script Removed: ${args.url}`);
      document.head.removeChild(element);
    };
  }, [args.url]);

  return {
    ready,
    failed,
  };
};

const System = (props) => {
  const { system } = props;

  const { ready, failed } = useDynamicScript({
    url: system && system.url,
    id: system && system.scope,
  });

  if (!system) {
    console.log(`Not system specified`);
    return <Error404 />;
  }

  if (!ready) {
    console.log(`Loading dynamic script: ${system.url}`);
    return <AppLoader />;
  }

  if (failed) {
    console.log(`Failed to load dynamic script: ${system.url}`);
    return <Error520Component />;
  }

  const Component = React.lazy(loadComponent(system.scope, system.module));

  return (
    <React.Suspense fallback={<AppLoader />}>
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    </React.Suspense>
  );
};

export default System;
