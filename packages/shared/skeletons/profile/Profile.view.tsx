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

import { isMobile } from "../../utils";

import { RectangleSkeleton } from "../rectangle";
import { CircleSkeleton } from "../circle";

import MobileViewLoader from "./Profile.mobile-view";
import styles from "./Profile.module.scss";

import { ProfileViewLoaderProps } from "./Profile.types";

export const ProfileViewLoader = ({
  id,
  className,
  style,
  ...rest
}: ProfileViewLoaderProps) => {
  const {
    title,
    borderRadius,
    backgroundColor,
    foregroundColor,
    backgroundOpacity,
    foregroundOpacity,
    speed,
    animate,
  } = rest;

  if (isMobile())
    return (
      <div
        id={id}
        className={className}
        style={style}
        data-testid="profile-view"
      >
        <MobileViewLoader {...rest} />
      </div>
    );
  return (
    <div id={id} className={className} style={style} data-testid="profile-view">
      <div className={styles.wrapper}>
        <div className={styles.mainBlock}>
          <CircleSkeleton
            className="avatar"
            title={title}
            x="62"
            y="62"
            radius="62"
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />

          <div className="combos">
            <div className="row">
              <RectangleSkeleton
                title={title}
                width="37"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="226"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
            <div className="row">
              <RectangleSkeleton
                title={title}
                width="34"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="156"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
            <div className="row">
              <RectangleSkeleton
                title={title}
                width="59"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="93"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
            <div className="row">
              <RectangleSkeleton
                title={title}
                width="75"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="208"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
            <div className="row">
              <RectangleSkeleton
                title={title}
                width="59"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="140"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
          </div>
        </div>
        <div className={styles.loginBlock}>
          <div>
            <RectangleSkeleton
              className="title"
              title={title}
              width="112"
              height="22"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
            <RectangleSkeleton
              title={title}
              height="40"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
          <div className="actions">
            <RectangleSkeleton
              title={title}
              width="168"
              height="32"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
            <RectangleSkeleton
              title={title}
              width="109"
              height="20"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
        </div>
        <div className={styles.socialBlock}>
          <RectangleSkeleton
            title={title}
            width="237"
            height="22"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />
          <div className="row">
            <RectangleSkeleton
              className="button"
              title={title}
              height="32"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
            <RectangleSkeleton
              className="button"
              title={title}
              height="32"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
          <div className="row">
            <RectangleSkeleton
              className="button"
              title={title}
              height="32"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
            <RectangleSkeleton
              className="button"
              title={title}
              height="32"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
        </div>
        <div className={styles.subBlock}>
          <RectangleSkeleton
            title={title}
            width="101"
            height="22"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />
          <div className="toggle">
            <RectangleSkeleton
              title={title}
              width="28"
              height="16"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
            <RectangleSkeleton
              title={title}
              width="223"
              height="20"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
        </div>
        <div className={styles.themeBlock}>
          <RectangleSkeleton
            title={title}
            width="129"
            height="22"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />
          <div className="checkbox">
            <div className="row">
              <RectangleSkeleton
                title={title}
                width="16"
                height="16"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="124"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
            <RectangleSkeleton
              className="description"
              title={title}
              width="291"
              height="32"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>

          <div className="themes-wrapper">
            <RectangleSkeleton
              className="theme"
              title={title}
              height="284"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
            <RectangleSkeleton
              className="theme"
              title={title}
              height="284"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
