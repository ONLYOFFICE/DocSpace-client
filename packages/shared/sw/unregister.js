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

function clearCaches() {
  try {
    if (!("caches" in window)) return;

    caches?.keys()?.then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (
            key.startsWith("workbox-") ||
            key.startsWith("wb6-") ||
            key.startsWith("docspace-")
          ) {
            return caches.delete(key);
          }
        }),
      );
    });
  } catch (error) {
    console.error("clearCaches failed", error);
  }
}
export default function () {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator))
    return;

  clearCaches();

  return navigator.serviceWorker
    .getRegistrations()
    .then(function (registrations) {
      for (const registration of registrations) {
        registration
          .unregister()
          .then(function () {
            return self.clients?.matchAll() || [];
          })
          .then(function (clients) {
            clients.forEach((client) => {
              if (client.url && "navigate" in client) {
                client.navigate(client.url);
              }
            });
          })
          .catch((err) => {
            console.error(err);
          });
      }
    })
    .catch((err) => {
      console.error(err);
    });
}
