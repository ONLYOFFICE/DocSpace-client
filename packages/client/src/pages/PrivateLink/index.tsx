/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { FieldContainer } from "@onlyoffice/apps-ui-kit/components/field-container";
import { PasswordInput } from "@onlyoffice/apps-ui-kit/components/password-input";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { InputSize } from "@onlyoffice/apps-ui-kit/components/text-input";

import { validatePublicRoomKey } from "@docspace/shared/api/rooms";
import type { TValidateShareRoom } from "@docspace/shared/api/rooms/types";
import { getBrandName } from "@docspace/shared/constants/brands";
import {
  LinkSharingEntityType,
  ValidationStatus,
} from "@docspace/shared/enums";
import {
  openVisitorLink,
  readLinkSecret,
  type TVisitorLink,
} from "@docspace/shared/services/private-room/private-link-visitor";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { VisitorFolder, VisitorSingleFile } from "./PrivateLinkContent";
import styles from "./PrivateLink.module.scss";

type TView =
  | { kind: "loading" }
  | { kind: "message"; text: string; signIn?: boolean }
  | { kind: "password"; error?: string }
  | { kind: "open"; link: TVisitorLink; status: TValidateShareRoom };

/**
 * The page of a visitor of an external link of a private item. The secret is
 * read from the part of the address after `#` and stays there; it goes into
 * no request, no storage and no log.
 *
 * Spec: private-rooms/encryption-core, "The page of a visitor keeps the secret of a link to the address"
 * Spec: private-rooms/file-operations, "A visitor opens an external link without an account"
 */
export const PrivateLinkPage = () => {
  const { t } = useTranslation(["Common"]);
  const { hash } = useLocation();
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const folder = searchParams.get("folder");
  const secret = useMemo(() => readLinkSecret(hash), [hash]);

  const [view, setView] = useState<TView>({ kind: "loading" });
  const [password, setPassword] = useState("");
  const [isOpening, setIsOpening] = useState(false);

  const open = useCallback(
    async (withPassword?: string) => {
      if (!key || !secret) return;
      setIsOpening(true);
      try {
        const result = await openVisitorLink(key, secret, withPassword);
        switch (result.state) {
          case "open":
            setView({ kind: "open", link: result.link, status: result.status });
            break;
          case "wrong-proof":
            // Without a password the secret itself is not the link's: the
            // address was copied wrongly.
            setView(
              withPassword === undefined
                ? { kind: "message", text: t("Common:PrivateLinkIncomplete") }
                : { kind: "password", error: t("Common:IncorrectPassword") },
            );
            break;
          case "blocked":
            setView({
              kind: "message",
              text: t("Common:PromoCodeTooManyAttempts"),
            });
            break;
          case "expired":
            setView({ kind: "message", text: t("Common:LinkExpired") });
            break;
          case "sign-in":
            setView({
              kind: "message",
              signIn: true,
              text: t("Common:PrivateLinkSignInRequired", {
                productName: getBrandName("ProductName"),
              }),
            });
            break;
          default:
            setView({
              kind: "message",
              text: t("Common:LinkNoLongerAvailable"),
            });
        }
      } catch {
        setView({ kind: "message", text: t("Common:LinkNoLongerAvailable") });
      } finally {
        setIsOpening(false);
      }
    },
    [key, secret, t],
  );

  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    if (!key || !secret) {
      setView({ kind: "message", text: t("Common:PrivateLinkIncomplete") });
      return undefined;
    }

    let cancelled = false;
    Promise.resolve(validatePublicRoomKey(key))
      .then((status) => {
        if (cancelled) return;
        if (status?.status === ValidationStatus.Expired) {
          setView({ kind: "message", text: t("Common:LinkExpired") });
        } else if (
          !status ||
          status.status === ValidationStatus.Invalid ||
          !status.isPrivate
        ) {
          setView({
            kind: "message",
            text: t("Common:LinkNoLongerAvailable"),
          });
        } else if (status.status === ValidationStatus.ExternalAccessDenied) {
          setView({
            kind: "message",
            signIn: true,
            text: t("Common:PrivateLinkSignInRequired", {
              productName: getBrandName("ProductName"),
            }),
          });
        } else if (status.passwordRequired) {
          setView({ kind: "password" });
        } else {
          openRef.current();
        }
      })
      .catch(() => {
        if (!cancelled) {
          setView({
            kind: "message",
            text: t("Common:LinkNoLongerAvailable"),
          });
        }
      });
    return () => {
      cancelled = true;
    };
    // The address decides what is opened: the status is read once for it,
    // whatever the translation function and the callback become later.
  }, [key, secret]);

  const onSubmitPassword = () => {
    if (!password) {
      setView({ kind: "password", error: t("Common:RequiredField") });
      return;
    }
    open(password);
  };

  const onSignIn = () => {
    // The part after # is not carried through the sign-in: the address is
    // opened again afterwards.
    window.location.href = combineUrl(
      window.ClientConfig?.proxy?.url,
      "/login",
    );
  };

  return (
    <main className={styles.page} data-testid="private_link_page">
      {view.kind === "loading" ? (
        <Text>{t("Common:LoadingProcessing")}</Text>
      ) : null}

      {view.kind === "message" ? (
        <div className={styles.message} role="alert">
          <Text fontSize="16px" fontWeight="600">
            {view.text}
          </Text>
          {view.signIn ? (
            <Button
              primary
              size={ButtonSize.normal}
              label={t("Common:LoginButton")}
              onClick={onSignIn}
              testId="private_link_sign_in"
            />
          ) : null}
        </div>
      ) : null}

      {view.kind === "password" ? (
        <form
          className={styles.message}
          onSubmit={(event) => {
            event.preventDefault();
            onSubmitPassword();
          }}
        >
          <Text fontSize="16px" fontWeight="600">
            {t("Common:PasswordRequired")}
          </Text>
          <FieldContainer
            isVertical
            labelVisible={false}
            hasError={!!view.error}
            errorMessage={view.error}
          >
            <PasswordInput
              simpleView
              id="private-link-password"
              inputName="password"
              placeholder={t("Common:Password")}
              inputValue={password}
              hasError={!!view.error}
              size={InputSize.large}
              scale
              autoComplete="off"
              onChange={(event) => setPassword(event.target.value)}
              isDisabled={isOpening}
            />
          </FieldContainer>
          <Button
            primary
            type="submit"
            size={ButtonSize.normal}
            label={t("Common:ContinueButton")}
            isLoading={isOpening}
            testId="private_link_open"
          />
        </form>
      ) : null}

      {view.kind === "open" ? (
        <div className={styles.content}>
          {view.status.type === LinkSharingEntityType.File ? (
            <VisitorSingleFile
              t={t}
              link={view.link}
              fileId={Number(view.status.id)}
            />
          ) : (
            <VisitorFolder
              t={t}
              link={view.link}
              folderId={Number(folder ?? view.status.id)}
            />
          )}
        </div>
      ) : null}
    </main>
  );
};

export default PrivateLinkPage;
