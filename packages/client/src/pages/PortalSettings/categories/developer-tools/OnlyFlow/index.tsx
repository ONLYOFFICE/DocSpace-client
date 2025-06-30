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

import { useEffect, useState, useRef } from "react";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { toastr } from "@docspace/shared/components/toast";

const OnlyFlow = () => {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    document.title = "OnlyFlow Developer Tool";

    const iframe = iframeRef.current;
    if (!iframe) return undefined;

    // not sure if we need to check if the iframe already loaded (e.g. readyState)

    const listener = () => {
      setIsLoading(false);
      console.log("event listener");
    };

    iframe.addEventListener("load", listener);

    return () => {
      iframe.removeEventListener("load", listener);
    };
  }, []);

  return (
    <>
      {isLoading && (
        <div style={{ display: 'flex', width: '100%', height: '800px' }}>
          {/* Left side menu skeleton */}
          <div style={{ width: '240px', borderRight: '1px solid #eceef1', padding: '16px' }}>
            {/* Menu header */}
            <RectangleSkeleton height="24px" width="70%" style={{ marginBottom: '20px' }} />
            
            {/* Menu items */}
            {Array(8).fill(0).map((_, index) => (
              <div key={`menu-item-${index}`} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <RectangleSkeleton height="16px" width="16px" style={{ marginRight: '12px' }} />
                  <RectangleSkeleton height="16px" width={`${60 + Math.random() * 30}%`} />
                </div>
              </div>
            ))}
          </div>
          
          {/* Main content skeleton */}
          <div style={{ flex: 1, padding: '24px' }}>
            {/* Header section */}
            <div style={{ marginBottom: '32px' }}>
              <RectangleSkeleton height="32px" width="50%" style={{ marginBottom: '16px' }} />
              <RectangleSkeleton height="16px" width="80%" />
            </div>
            
            {/* Content sections */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
              {Array(4).fill(0).map((_, index) => (
                <div key={`section-${index}`} style={{ borderRadius: '8px', border: '1px solid #eceef1', padding: '16px' }}>
                  <RectangleSkeleton height="24px" width="60%" style={{ marginBottom: '12px' }} />
                  <RectangleSkeleton height="16px" width="90%" style={{ marginBottom: '8px' }} />
                  <RectangleSkeleton height="16px" width="75%" style={{ marginBottom: '12px' }} />
                  <RectangleSkeleton height="24px" width="40%" />
                </div>
              ))}
            </div>
            
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <RectangleSkeleton height="36px" width="120px" />
              <RectangleSkeleton height="36px" width="120px" />
            </div>
          </div>
        </div>
      )}
      <iframe
        title="OnlyFlow Developer Tool"
        src="/onlyflow/"
        style={{
          width: "100%",
          height: "800px",
          border: "none",
          visibility: isLoading ? "hidden" : "visible",
        }}
        ref={iframeRef}
        onLoad={() => {
          setIsLoading(false);
        }}
        onError={(e) => {
          toastr.error(e?.message || "Failed to load OnlyFlow");
          setIsLoading(false);
        }}
      />
    </>
  );
};

export default OnlyFlow;
