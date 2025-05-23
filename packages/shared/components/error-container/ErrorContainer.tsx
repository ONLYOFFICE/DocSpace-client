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
import classNames from "classnames";
import { Text } from "../text";
import { Button, ButtonSize } from "../button";
import { Heading } from "../heading";
import PortalLogo from "../portal-logo/PortalLogo";
import { Scrollbar } from "../scrollbar";

import type { ErrorContainerProps } from "./ErrorContainer.types";
import styles from "./ErrorContainer.module.scss";

const ErrorContainer = (props: ErrorContainerProps) => {
  const {
    headerText,
    bodyText,
    buttonText,
    onClickButton,
    children,
    customizedBodyText,
    isPrimaryButton = true,
    isEditor = false,
    className,
    hideLogo = false,
    ...rest
  } = props;

  return (
    <Scrollbar style={{ height: "100dvh" }}>
      <div
        {...rest}
        className={classNames(
          styles.container,
          { [styles.isEditor]: isEditor },
          className,
        )}
        data-testid="ErrorContainer"
      >
        {!hideLogo ? <PortalLogo isResizable /> : null}
        <div id="container-inner">
          <svg
            id="background"
            width="753"
            height="361"
            viewBox="0 0 753 361"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M605.159 329.5L502.298 335.217C254.439 335.217 356.184 345.596 268.916 345.596C179.954 345.596 145.188 350.392 79.3741 349.916C17.1668 345.596 -36.4313 231.143 31.8546 171.934C109.509 90.4003 120.656 5.02279e-06 254.764 0C357.493 -3.84752e-06 383.499 65.6633 577.897 46.6555C712.51 33.4934 779.566 260.925 742.919 335.217C713.53 394.796 605.159 329.5 605.159 329.5Z"
              fill="#E9F7FF"
            />
          </svg>
          <svg
            id="birds"
            width="263"
            height="123"
            viewBox="0 0 263 123"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M53.0374 0C52.4644 0 52 0.457978 52 1.02292C52 1.58787 52.4644 2.04584 53.0374 2.04584C57.1445 2.04584 60.1955 5.68928 61.3682 9.2816C61.5035 9.70858 61.9047 10 62.3585 10C62.8124 10 63.2137 9.70875 63.3489 9.28152L63.3492 9.28052C64.4188 5.99204 67.0823 2.04584 70.9626 2.04584C71.5356 2.04584 72 1.58787 72 1.02292C72 0.457978 71.5356 0 70.9626 0C66.9479 0 64.0346 3.08772 62.3445 6.38386C60.4819 2.8992 57.243 0 53.0374 0Z"
              fill="#BADAF4"
            />
            <path
              d="M27.193 29C26.5341 29 26 29.5496 26 30.2275C26 30.9054 26.5341 31.455 27.193 31.455C31.9162 31.455 35.4248 35.8271 36.7734 40.1379C36.929 40.6503 37.3905 41 37.9123 41C38.4343 41 38.8957 40.6505 39.0512 40.1378L39.0516 40.1366C40.2816 36.1905 43.3447 31.455 47.807 31.455C48.4659 31.455 49 30.9054 49 30.2275C49 29.5496 48.4659 29 47.807 29C43.1901 29 39.8397 32.7053 37.8962 36.6606C35.7542 32.479 32.0294 29 27.193 29Z"
              fill="#BADAF4"
            />
            <path
              d="M0 6.97439C0 6.43625 0.473705 6 1.05805 6C3.80222 6 5.62553 7.54675 6.702 8.93327C6.89487 9.18168 7.06749 9.4293 7.22099 9.66845C7.36273 9.43672 7.52095 9.19713 7.6963 8.95671C8.68661 7.59887 10.39 6 12.9419 6C13.5263 6 14 6.43625 14 6.97439C14 7.51254 13.5263 7.94879 12.9419 7.94879C11.4534 7.94879 10.3046 8.87553 9.45294 10.0433C9.03994 10.6096 8.73563 11.1828 8.53414 11.6183C8.43406 11.8346 8.361 12.0133 8.31384 12.1353C8.2903 12.1962 8.27331 12.2428 8.26273 12.2725L8.25168 12.3041L8.25017 12.3084C8.1147 12.7189 7.70352 13 7.23768 13C6.77235 13 6.36174 12.72 6.22581 12.3103L6.22539 12.3091C6.22529 12.3088 6.22518 12.3084 7.23768 12.0256L6.22539 12.3091L6.22407 12.3052L6.21337 12.2749C6.203 12.246 6.18614 12.2004 6.16254 12.1403C6.11528 12.0201 6.04139 11.8434 5.93891 11.6292C5.73262 11.198 5.41731 10.6292 4.98064 10.0667C4.09627 8.92764 2.82976 7.94879 1.05805 7.94879C0.473705 7.94879 0 7.51254 0 6.97439Z"
              fill="#BADAF4"
            />
            <path
              d="M250.058 116C249.474 116 249 116.436 249 116.974C249 117.513 249.474 117.949 250.058 117.949C251.83 117.949 253.096 118.928 253.981 120.067C254.417 120.629 254.733 121.198 254.939 121.629C255.041 121.843 255.115 122.02 255.163 122.14C255.176 122.174 255.187 122.203 255.196 122.228C255.203 122.246 255.209 122.262 255.213 122.275L255.224 122.305L255.225 122.308L256.238 122.026C255.225 122.308 255.225 122.308 255.225 122.308L255.226 122.31"
              fill="#BADAF4"
            />
            <path
              d="M250.058 116C252.802 116 254.626 117.547 255.702 118.933L250.058 116Z"
              fill="#BADAF4"
            />
            <path
              d="M255.702 118.933C255.895 119.182 256.068 119.429 256.221 119.668L255.702 118.933Z"
              fill="#BADAF4"
            />
            <path
              d="M256.221 119.668C256.363 119.437 256.521 119.197 256.696 118.957L256.221 119.668Z"
              fill="#BADAF4"
            />
            <path
              d="M256.696 118.957C257.687 117.599 259.39 116 261.942 116L256.696 118.957Z"
              fill="#BADAF4"
            />
            <path
              d="M261.942 116C262.526 116 263 116.436 263 116.974L261.942 116Z"
              fill="#BADAF4"
            />
            <path
              d="M263 116.974C263 117.513 262.526 117.949 261.942 117.949L263 116.974Z"
              fill="#BADAF4"
            />
            <path
              d="M261.942 117.949C260.453 117.949 259.305 118.876 258.453 120.043L261.942 117.949Z"
              fill="#BADAF4"
            />
            <path
              d="M258.453 120.043C258.04 120.61 257.736 121.183 257.534 121.618L258.453 120.043Z"
              fill="#BADAF4"
            />
            <path
              d="M257.534 121.618C257.434 121.835 257.361 122.013 257.314 122.135L257.534 121.618Z"
              fill="#BADAF4"
            />
            <path
              d="M257.314 122.135C257.29 122.196 257.273 122.243 257.263 122.272L257.314 122.135Z"
              fill="#BADAF4"
            />
            <path
              d="M257.263 122.272L257.252 122.304L257.263 122.272Z"
              fill="#BADAF4"
            />
            <path
              d="M257.252 122.304L257.25 122.308L257.252 122.304Z"
              fill="#BADAF4"
            />
            <path
              d="M257.25 122.308C257.115 122.719 256.704 123 256.238 123L257.25 122.308Z"
              fill="#BADAF4"
            />
            <path
              d="M256.238 123C255.772 123 255.362 122.719 255.226 122.31L256.238 123Z"
              fill="#BADAF4"
            />
            <path
              d="M255.226 122.31C255.226 122.31 255.226 122.31 255.226 122.31V122.31Z"
              fill="#BADAF4"
            />
          </svg>
          <svg
            id="mountain-left"
            width="191"
            height="130"
            viewBox="0 0 191 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M100.787 5.63419L179.184 110.875C181.935 114.568 190.942 119.551 190.942 119.551C190.942 119.551 148.016 118.255 88.8323 126.895C29.6489 135.535 0 119.234 0 119.234C0 119.234 3.8778 114.47 6.75659 110.778L88.8323 5.53793C91.5955 1.99477 98.1152 2.04727 100.787 5.63419Z"
              fill="#E1C6C6"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M95.5 5.53794C121 36.912 127.5 87.412 159 119.234C159 119.234 148.016 118.255 88.8323 126.895C29.6489 135.535 0 119.234 0 119.234C0 119.234 3.8778 114.47 6.75659 110.778L88.8323 5.53794C91.5955 1.99478 92.828 1.95102 95.5 5.53794Z"
              fill="#E6CECE"
            />
            <path
              d="M108.5 33.912C113 28.412 120.893 33.1437 120 30.912C119 28.412 110.66 17.004 108.5 14.412L99.5 3.41202C95.5 -1.08798 90 0.412003 85 7.41202L78.5 15.912C74.5 20.9261 66.5 32.912 66.5 32.912C77.5 22.912 82.1015 32.5223 87 27.912C95.5 19.912 102.003 41.8522 108.5 33.912Z"
              fill="white"
            />
          </svg>
          <svg
            id="mountain-right"
            width="230"
            height="162"
            viewBox="0 0 230 162"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M129.056 6.27931L222.861 131.807C226.153 136.213 229.641 144.1 229.641 144.1C229.641 144.1 208.905 171.748 121.642 156.196C34.3791 140.644 0.251465 156.196 0.251465 156.196C0.251465 156.196 13.0994 136.095 16.544 131.692L114.751 6.16449C118.058 1.93832 125.859 2.00093 129.056 6.27931Z"
              fill="#B59C9C"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M129.056 6.27931C143.5 57.412 184.124 100.94 206 150.412C206 150.412 208.905 171.748 121.642 156.196C34.3791 140.644 0.251465 156.196 0.251465 156.196C0.251465 156.196 13.0994 136.095 16.544 131.692L114.751 6.16449C118.058 1.93832 125.859 2.00093 129.056 6.27931Z"
              fill="#BCA7A7"
            />
            <path
              d="M109 39.912C105.361 43.8211 104 29.9121 95.5 28.912C95.5 28.912 96.2357 26.3398 98.1979 23.9575L114.845 3.03197C117.929 -0.71246 124.826 -0.603776 127.724 3.23494L145.223 26.4121C146.136 27.6214 151.854 34.2395 151.018 35.484C144 35.484 138.674 23.9041 132 31.412C124 40.412 122.5 25.412 109 39.912Z"
              fill="white"
            />
          </svg>
          <svg
            id="mountain-center"
            width="364"
            height="242"
            viewBox="0 0 364 242"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M196.843 8.54528L345.932 200.731C351.165 207.476 363.298 222.596 363.298 222.596C363.298 222.596 293.315 257.164 180.564 230.372C67.8133 203.579 5.17395 215.997 5.17395 215.997C5.17395 215.997 12.5485 207.296 18.0231 200.555L174.108 8.36949C179.363 1.89911 191.762 1.99498 196.843 8.54528Z"
              fill="#FAE0D2"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M192 5.77758C251.837 82.912 281 186.912 333.923 232.532C333.923 232.532 270.851 252.836 174.108 232.532C77.3655 212.228 0.854004 219.14 0.854004 219.14C58.5157 151.11 117.888 75.0012 174.108 5.77758C179.363 -0.6928 186.919 -0.772726 192 5.77758Z"
              fill="#FFE9DD"
            />
            <path
              d="M147.732 91.7013C137.365 88.6773 149.808 61.2481 120 72.912C112.211 69.8585 151.512 30.5027 168.9 9.16558C177.108 -0.263733 185.748 -4.83696 196.98 7.46215C213.582 28.4184 249.705 64.8585 245.5 71.412C223.9 62.3926 252.154 99.9491 217.284 78.6262C204.756 70.9655 202.164 59.7336 196.98 59.7336C191.796 59.7336 186.18 76.1494 173.652 76.1494C161.124 76.1494 158.1 94.7252 147.732 91.7013Z"
              fill="white"
            />
          </svg>
          <svg
            id="white-cloud-behind"
            width="63"
            height="27"
            viewBox="0 0 63 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M62.0283 26.8523H1.63598C1.08018 25.5954 0.771484 24.2047 0.771484 22.7419C0.771484 17.8782 4.18439 13.8116 8.74599 12.8063C10.407 5.47421 16.9629 0 24.7974 0C30.5416 0 35.5985 2.94278 38.5427 7.40298C40.0926 6.52762 41.883 6.02808 43.79 6.02808C49.6918 6.02808 54.4762 10.8124 54.4762 16.7142C54.4762 17.3503 54.4206 17.9734 54.314 18.579C54.5181 18.5615 54.7246 18.5526 54.9332 18.5526C58.8995 18.5526 62.1148 21.768 62.1148 25.7343C62.1148 26.1146 62.0853 26.488 62.0283 26.8523Z"
              fill="white"
            />
          </svg>
          <svg
            id="white-cloud-center"
            width="74"
            height="33"
            viewBox="0 0 74 33"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M73.3357 32.1895H1.03496C0.369565 30.6847 0 29.0198 0 27.2686C0 21.4458 4.08587 16.5773 9.54695 15.3738C11.5355 6.59599 19.3841 0.0423584 28.7634 0.0423584C35.6403 0.0423584 41.6943 3.5654 45.219 8.90507C47.0746 7.8571 49.218 7.25906 51.5011 7.25906C58.5666 7.25906 64.2943 12.9868 64.2943 20.0523C64.2943 20.8138 64.2278 21.5598 64.1002 22.2847C64.3445 22.2639 64.5918 22.2532 64.8415 22.2532C69.5899 22.2532 73.4392 26.1026 73.4392 30.851C73.4392 31.3063 73.4038 31.7533 73.3357 32.1895Z"
              fill="white"
            />
          </svg>
          <svg
            id="white-cloud-left"
            width="180"
            height="80"
            viewBox="0 0 180 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M178.952 79.5991H3.02637C1.08826 75.6491 0 71.2064 0 66.5096C0 50.0768 13.3215 36.7553 29.7543 36.7553C31.2286 36.7553 32.6778 36.8625 34.0946 37.0696C39.0926 15.8192 58.1735 0 80.9492 0C103.664 0 122.703 15.7345 127.763 36.8987C138.074 38.9576 146.476 46.3064 150.02 55.9956C152.586 54.8778 155.42 54.2579 158.398 54.2579C169.998 54.2579 179.401 63.6613 179.401 75.2609C179.401 76.7482 179.246 78.1993 178.952 79.5991Z"
              fill="white"
            />
          </svg>
          <svg
            id="white-cloud-right"
            width="160"
            height="70"
            viewBox="0 0 160 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M159.613 69.9674H2.25259C0.80436 66.6922 0 63.0686 0 59.2571C0 46.584 8.89278 35.9879 20.7787 33.3685C25.1067 14.2638 42.189 0 62.6028 0C77.5701 0 90.7464 7.6678 98.4179 19.2894C102.457 17.0086 107.122 15.707 112.091 15.707C127.468 15.707 139.935 28.1732 139.935 43.5511C139.935 45.2085 139.79 46.8321 139.512 48.4099C140.044 48.3645 140.582 48.3413 141.126 48.3413C151.46 48.3413 159.838 56.7193 159.838 67.0541C159.838 68.0451 159.761 69.0181 159.613 69.9674Z"
              fill="white"
            />
          </svg>
          <svg
            id="blue-cloud-left"
            width="63"
            height="24"
            viewBox="0 0 63 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M62.1979 23.7708H0C0.135632 10.6194 10.8389 0 24.0224 0C32.5025 0 39.9564 4.3938 44.2317 11.029C45.7258 10.4393 47.3539 10.1152 49.0576 10.1152C56.3201 10.1152 62.2074 16.0026 62.2074 23.265C62.2074 23.4344 62.2042 23.603 62.1979 23.7708Z"
              fill="#D0E7F9"
            />
          </svg>
          <svg
            id="blue-cloud-right"
            width="85"
            height="33"
            viewBox="0 0 85 33"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.011907 32.1712H84.4586C83.3204 14.213 68.3946 0 50.1493 0C37.9859 0 27.2979 6.31668 21.1866 15.8486C19.6727 15.3875 18.0658 15.1394 16.401 15.1394C7.34299 15.1394 0 22.4824 0 31.5404C0 31.7516 0.00399277 31.9619 0.011907 32.1712Z"
              fill="#D0E7F9"
            />
          </svg>
          <svg
            id="baloon"
            width="92"
            height="139"
            viewBox="0 0 92 139"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.75806 61.9671L46.4736 135.739M46.4736 135.739L22.9019 80.111M46.4736 135.739L27.6538 37.7754M46.4736 135.739L65.2374 37.7754M46.4736 135.739L70.4214 80.111M46.4736 135.739L88.5652 61.9671M46.4736 135.739V56.3512"
              stroke="#CBE4F6"
            />
            <path
              d="M40.1818 126.334H52.2776V135.43C52.2776 137.087 50.9345 138.43 49.2776 138.43H43.1818C41.5249 138.43 40.1818 137.087 40.1818 135.43V126.334Z"
              fill="#BCA7A7"
            />
            <rect
              x="39.3177"
              y="125.47"
              width="13.8239"
              height="1.72798"
              fill="#CBE4F6"
            />
            <rect
              x="41.9097"
              y="128.926"
              width="1.72798"
              height="6.91193"
              fill="#E1C6C6"
            />
            <rect
              x="45.3657"
              y="128.926"
              width="1.72798"
              height="6.91193"
              fill="#E1C6C6"
            />
            <rect
              x="48.8217"
              y="128.926"
              width="1.72798"
              height="6.91193"
              fill="#E1C6C6"
            />
            <circle cx="46" cy="46" r="46" fill="#D0E7F9" />
            <ellipse cx="46" cy="46" rx="30" ry="46" fill="#E9F7FF" />
            <ellipse cx="46" cy="46" rx="12" ry="46" fill="#D0E7F9" />
          </svg>
        </div>
        {headerText ? (
          <Heading id="header" type="header">
            {headerText}
          </Heading>
        ) : null}
        {bodyText ? <Text id="text">{bodyText}</Text> : null}
        {customizedBodyText ? (
          <Text id="customized-text" fontWeight={600} fontSize="13px">
            {customizedBodyText}
          </Text>
        ) : null}
        {buttonText && onClickButton ? (
          <div id="button-container">
            <Button
              id="button"
              scale
              label={buttonText}
              onClick={onClickButton}
              size={ButtonSize.normal}
              primary={isPrimaryButton}
            />
          </div>
        ) : null}
        {children}
      </div>
    </Scrollbar>
  );
};

export default ErrorContainer;
