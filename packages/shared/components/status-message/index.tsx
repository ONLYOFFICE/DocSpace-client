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
import DangerToastReactSvg from "PUBLIC_DIR/images/danger.toast.react.svg";

import { IconSizeType } from "../../utils/common-icons-style";
import styles from "./StatusMessage.module.scss";
import { Text } from "../text";

interface StatusMessageProps {
  message: string | React.ReactNode;
  isWarning?: boolean;
}

const StatusMessage: React.FC<StatusMessageProps> = ({
  message,
  isWarning,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const [isShowComponent, setIsShowComponent] = React.useState(!!message);
  const messageRef = React.useRef<HTMLDivElement>(null);
  const prevMessageRef = React.useRef<string | React.ReactNode | undefined>(
    message,
  );
  const shouldShowAfterAnimationRef = React.useRef(false);

  React.useEffect(() => {
    if (prevMessageRef.current) {
      if (!message || prevMessageRef.current !== message) {
        setIsVisible(false);
        shouldShowAfterAnimationRef.current = true;
        return;
      }

      if (!shouldShowAfterAnimationRef.current) {
        setIsVisible(true);
        prevMessageRef.current = message;
      }

      return;
    }

    prevMessageRef.current = message;
    if (!message) return;

    setIsShowComponent(true);
    setIsVisible(true);
  }, [message]);

  React.useEffect(() => {
    const element = messageRef.current;
    if (!element) return;

    const handleEnd = () => {
      const resetStates = () => {
        shouldShowAfterAnimationRef.current = false;
        prevMessageRef.current = message;
      };

      if (!message) {
        setIsShowComponent(false);
        resetStates();
        return;
      }

      if (shouldShowAfterAnimationRef.current && prevMessageRef.current) {
        setIsShowComponent(true);
        setIsVisible(true);
        resetStates();
        return;
      }

      if (!prevMessageRef.current) {
        setIsShowComponent(false);
      }
    };

    element.addEventListener("animationend", handleEnd);
    element.addEventListener("transitionend", handleEnd);

    return () => {
      element.removeEventListener("animationend", handleEnd);
      element.removeEventListener("transitionend", handleEnd);
    };
  }, [message]);

  if (!isShowComponent) return null;

  return (
    <div
      ref={messageRef}
      className={`${styles.body} ${!isVisible ? styles.hide : ""} ${isWarning ? styles.warning : ""}`}
    >
      <DangerToastReactSvg
        className={styles.dangerToastIcon}
        data-size={IconSizeType.medium}
      />
      <Text>{prevMessageRef.current}</Text>
    </div>
  );
};

export default StatusMessage;
