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
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Dark, Base } from "@docspace/shared/themes";
import ErrorContainer from "@docspace/shared/components/error-container/ErrorContainer";

interface IError520Props {
  match?: {
    params: MatchType;
  };
  theme?: any;
}

interface IErrorBoundaryProps extends IError520Props {
  onError?: (error: any, errorInfo: any) => void;
  theme?: any;
  children?: React.ReactNode;
}

interface IErrorBoundaryState {
  hasError: boolean;
}

const Error520: React.FC<IError520Props> = ({ match }) => {
  const { t } = useTranslation(["Common"]);
  const params = useParams();
  const { error } = (params && params) || {};

  const theme =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? Dark
      : Base;

  const themeProps = theme ? { theme } : {};

  return (
    <ErrorContainer
      headerText={t("SomethingWentWrong")}
      bodyText={error}
      {...themeProps}
    />
  );
};

class ErrorBoundary extends React.Component<
  IErrorBoundaryProps,
  IErrorBoundaryState
> {
  state: IErrorBoundaryState = { hasError: false };
  props: any;
  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
    this.props.onError && this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <Error520 {...this.props} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
