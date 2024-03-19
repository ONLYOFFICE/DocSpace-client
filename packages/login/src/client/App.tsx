// (c) Copyright Ascensio System SIA 2010-2024
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
import { Routes, Route } from "react-router-dom";
import { Provider as MobxProvider } from "mobx-react";
import { Toast } from "@docspace/shared/components/toast";
import { WRONG_PORTAL_NAME_URL } from "@docspace/shared/constants";

import Login from "./components/Login";
import SimpleNav from "../client/components/sub-components/SimpleNav";
import InvalidRoute from "./components/Invalid";
import CodeLogin from "./components/CodeLogin";
import initLoginStore from "../store";

interface ILoginProps extends IInitialState {
  isDesktopEditor?: boolean;
  theme: IUserTheme;
  setTheme: (theme: IUserTheme) => void;
}

const App: React.FC<ILoginProps> = (props) => {
  const loginStore = initLoginStore(props?.currentColorScheme || {});

  React.useEffect(() => {
    if (window && props.error) {
      const { status, standalone, message } = props.error;

      if (status === 404 && !standalone) {
        const url = new URL(WRONG_PORTAL_NAME_URL);
        url.searchParams.append("url", window.location.hostname);
        window.location.replace(url);
      }

      throw new Error(message);
    }
  }, []);

  return (
    <MobxProvider {...loginStore}>
      <SimpleNav {...props} />
      <Toast isSSR />
      <Routes>
        <Route path="/login/error" element={<InvalidRoute {...props} />} />
        {/*<Route path="/login/code" element={<CodeLogin {...props} />} />*/}
        <Route path="/login" element={<Login {...props} />} />
      </Routes>
    </MobxProvider>
  );
};

export default App;
