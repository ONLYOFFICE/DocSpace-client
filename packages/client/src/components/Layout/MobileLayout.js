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

import React, { Component, createRef } from "react";
import {
  isDesktop,
  isTouchDevice,
  getBannerAttribute,
} from "@docspace/shared/utils";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { LayoutContextProvider } from "./context";

import PropTypes from "prop-types";
import {
  isTablet,
  isMobile,
  isSafari,
  isIOS,
  isChrome,
} from "react-device-detect";
class MobileLayout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      prevScrollPosition: window.pageYOffset,
      visibleContent: true,
    };

    this.scrollRefPage = createRef();
  }

  componentDidMount() {
    this.customScrollElm = document.querySelector(
      "#customScrollBar > .scroll-wrapper > .scroller",
    );

    if (!isChrome) this.customScrollElm.scrollTo(0, 0);

    this.customScrollElm.addEventListener(
      "scroll",
      this.scrolledTheVerticalAxis,
    );

    // this.setState({ visibleContent: true });
  }

  componentWillUnmount() {
    this.customScrollElm.removeEventListener(
      "scroll",
      this.scrolledTheVerticalAxis,
    );
  }

  scrolledTheVerticalAxis = () => {
    const { prevScrollPosition, visibleContent } = this.state;
    const { headerHeight } = getBannerAttribute();

    const currentScrollPosition =
      this.customScrollElm.scrollTop > 0 ? this.customScrollElm.scrollTop : 0;

    if (
      !isDesktop() &&
      document.getElementsByClassName("backdrop-active").length > 0 &&
      !this.props.isArticleVisibleOnUnpin
    ) {
      const elements = document.getElementsByClassName("backdrop-active");
      elements[0].click();
      return;
    }

    if (visibleContent && isMobile && !isTouchDevice) {
      return;
    }
    if (
      (isSafari || isIOS) &&
      this.customScrollElm.scrollHeight - this.customScrollElm.clientHeight <
        headerHeight
    ) {
      if (!this.state.visibleContent)
        this.setState({
          visibleContent: true,
        });
      return;
    }

    if (
      prevScrollPosition - currentScrollPosition > 0 &&
      currentScrollPosition < headerHeight
    ) {
      if (!this.state.visibleContent)
        this.setState({
          visibleContent: true,
        });
      return;
    }

    if (
      (isSafari || isIOS) &&
      Math.abs(currentScrollPosition - prevScrollPosition) <= headerHeight &&
      currentScrollPosition === 0
    ) {
      if (!this.state.visibleContent)
        this.setState({
          visibleContent: true,
        });
      return;
    }

    if (Math.abs(currentScrollPosition - prevScrollPosition) <= headerHeight) {
      return;
    }

    if (prevScrollPosition === 0 && currentScrollPosition > 100) {
      if (Math.abs(currentScrollPosition - prevScrollPosition) <= 104) {
        return;
      }
    }

    let isVisible = prevScrollPosition >= currentScrollPosition;

    if (
      (isSafari || isIOS) &&
      currentScrollPosition >=
        this.customScrollElm.scrollHeight - this.customScrollElm.clientHeight &&
      this.customScrollElm.scrollHeight !== this.customScrollElm.clientHeight
    ) {
      isVisible = false;
    }

    this.setState({
      prevScrollPosition: currentScrollPosition,
      visibleContent: isVisible,
    });
  };

  render() {
    const scrollProp = { ref: this.scrollRefPage };
    const { children } = this.props;

    return (
      <Scrollbar id="customScrollBar" {...scrollProp}>
        <LayoutContextProvider
          value={{
            scrollRefLayout: this.scrollRefPage,
            isVisible: this.state.visibleContent,
          }}
        >
          {children}
        </LayoutContextProvider>
      </Scrollbar>
    );
  }
}

MobileLayout.propTypes = {
  children: PropTypes.any,
};

export default MobileLayout;
