import React from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Text } from "@docspace/ui-kit/components/text";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";
import InputTokensIcon from "PUBLIC_DIR/images/icons/16/input-tokens.svg";
import OutputTokensIcon from "PUBLIC_DIR/images/icons/16/output-tokens.svg";

import styles from "../../styles/BackupServiceDialog.module.scss";
import type { TAiToolsPrices } from "SRC_DIR/store/ServicesStore";
import {
  Button,
  ButtonSize,
  Link,
  LinkTarget,
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components";

interface PricingBillingBodyProps {
  visible: boolean;
  onClose: () => void;
  onTopUpClick?: () => void;
  onBack?: () => void;
  aiToolsPrices?: TAiToolsPrices;
  formatAiModelsCurrency?: (amount: number) => string;
  minimumInputPrice?: number;
  minimumOutputPrice?: number;
  withoutFooter?: boolean;
  isBackButton?: boolean;
}

const PricingBillingBody: React.FC<PricingBillingBodyProps> = ({
  onBack,
  onClose,
  visible,
  onTopUpClick,
  aiToolsPrices,
  formatAiModelsCurrency,
  minimumInputPrice,
  minimumOutputPrice,
  isBackButton = true,
  withoutFooter,
}) => {
  const { t } = useTranslation(["Services", "Common"]);

  const safeFormatAiModelsCurrency = (amount: number) =>
    formatAiModelsCurrency ? formatAiModelsCurrency(amount) : String(amount);

  const chatModels = aiToolsPrices?.chat ?? [];
  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      isBackButton={isBackButton}
      onBackClick={onBack}
      onCloseClick={onClose}
      withBodyScroll
    >
      <ModalDialog.Header>{t("AIPricingAndBilling")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.pricingBody}>
          <Text fontSize="12px">{t("AIPricingIntro")}</Text>

          <Text fontSize="16px" fontWeight="700">
            {t("AIWhatYouPayForTitle")}
          </Text>

          <div className={styles.pricingSection}>
            <div className={styles.pricingSectionHeader}>
              <Text fontSize="14px" fontWeight="700">
                {t("AIPricingTokensTitle")}
              </Text>
              <HelpButton
                iconName={HelpReactSvgUrl}
                style={{ height: "15px", margin: "0" }}
                tooltipContent={
                  <>
                    <Trans
                      t={t}
                      ns="Services"
                      i18nKey="AIPricingTokensTooltipInput"
                      components={{
                        1: <strong />,
                      }}
                    />
                    <br />
                    <Trans
                      t={t}
                      ns="Services"
                      i18nKey="AIPricingTokensTooltipOutput"
                      components={{
                        1: <strong />,
                      }}
                    />
                  </>
                }
              />
            </div>

            <div className={styles.pricingCard}>
              <div className={styles.pricingRow}>
                <div className={styles.pricingRowLeft}>
                  <InputTokensIcon />
                  <Text fontSize="12px">{t("AIPricingInputTokens")}</Text>
                </div>
                <Text fontSize="12px" fontWeight="600">
                  <Trans
                    t={t}
                    ns="Services"
                    i18nKey="AIPricingInputTokensPrice"
                    components={{
                      1: (
                        <Text
                          as="span"
                          className={styles.payForItemTextMuted}
                        />
                      ),
                    }}
                    values={{
                      price: safeFormatAiModelsCurrency(minimumInputPrice ?? 0),
                    }}
                  />
                </Text>
              </div>

              <div className={styles.pricingRow}>
                <div className={styles.pricingRowLeft}>
                  <OutputTokensIcon />
                  <Text fontSize="12px">{t("AIPricingOutputTokens")}</Text>
                </div>
                <Text fontSize="12px" fontWeight="600">
                  <Trans
                    t={t}
                    ns="Services"
                    i18nKey="AIPricingOutputTokensPrice"
                    components={{
                      1: (
                        <Text
                          as="span"
                          className={styles.payForItemTextMuted}
                        />
                      ),
                    }}
                    values={{
                      price: safeFormatAiModelsCurrency(
                        minimumOutputPrice ?? 0,
                      ),
                    }}
                  />
                </Text>
              </div>
            </div>

            <Text className={styles.payForItemTextMuted}>
              <Trans
                t={t}
                ns="Services"
                i18nKey="AIPricingFeeNoteUsage"
                components={{
                  1: (
                    <Link
                      fontWeight={600}
                      fontSize="12px"
                      textDecoration="underline"
                      href="https://openrouter.ai/models"
                      target={LinkTarget.blank}
                      className={styles.payForItemTextMutedLink}
                    />
                  ),
                }}
              />
            </Text>
          </div>

          <div className={styles.pricingSection}>
            <div className={styles.pricingSectionHeader}>
              <Text className={styles.pricingSectionTitle}>
                {t("AIPricingAdditionalFeaturesTitle")}
              </Text>
              <HelpButton
                iconName={HelpReactSvgUrl}
                style={{ height: "15px", margin: "0" }}
                tooltipContent={
                  <>
                    <Trans
                      t={t}
                      ns="Services"
                      i18nKey="AIPricingAdditionalTooltipVectorization"
                      components={{
                        1: <strong />,
                      }}
                    />
                    <br />
                    <Trans
                      t={t}
                      ns="Services"
                      i18nKey="AIPricingAdditionalTooltipWebSearch"
                      components={{
                        1: <strong />,
                      }}
                    />
                    <br />
                    <Trans
                      t={t}
                      ns="Services"
                      i18nKey="AIPricingAdditionalTooltipWebCrawling"
                      components={{
                        1: <strong />,
                      }}
                    />
                  </>
                }
              />
            </div>

            <div className={styles.pricingCard}>
              {aiToolsPrices?.embedding?.[0]?.price?.prompt ? (
                <div className={styles.pricingRow}>
                  <div className={styles.pricingRowLeft}>
                    <div className={styles.pricingRowIconBox}>
                      <div
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: TODO fix
                        dangerouslySetInnerHTML={{
                          __html: aiToolsPrices.embedding[0].image,
                        }}
                        className={styles.iconsContainer}
                      />
                    </div>
                    <Text fontSize="12px">
                      {aiToolsPrices.embedding[0].alias}
                    </Text>
                    {aiToolsPrices.embedding[0].provider ? (
                      <Text className={styles.payForItemTextMuted} as="span">
                        ({aiToolsPrices.embedding[0].provider})
                      </Text>
                    ) : null}
                  </div>
                  <Text className={styles.pricingRowPrice}>
                    <Text fontWeight="600" as="span">
                      <Trans
                        t={t}
                        ns="Services"
                        i18nKey="AIPricingPricePerTokens"
                        components={{
                          1: (
                            <Text
                              fontSize="12px"
                              as="span"
                              className={styles.payForItemTextMuted}
                            />
                          ),
                        }}
                        values={{
                          price: safeFormatAiModelsCurrency(
                            aiToolsPrices.embedding[0].price.prompt,
                          ),
                        }}
                      />
                    </Text>
                  </Text>
                </div>
              ) : null}

              {aiToolsPrices?.webSearch?.map((ws) =>
                ws.price ? (
                  <div className={styles.pricingRow} key={ws.id}>
                    <div className={styles.pricingRowLeft}>
                      <div className={styles.pricingRowIconBox}>
                        <div
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: TODO fix
                          dangerouslySetInnerHTML={{
                            __html: ws.image,
                          }}
                          className={styles.iconsContainer}
                        />
                      </div>
                      <Text fontSize="12px">{ws.alias}</Text>
                      {ws.provider ? (
                        <Text className={styles.payForItemTextMuted} as="span">
                          ({ws.provider})
                        </Text>
                      ) : null}
                    </div>
                    <Text fontSize="12px" fontWeight="600">
                      <Trans
                        t={t}
                        ns="Services"
                        i18nKey="AIPricingPricePerRequest"
                        components={{
                          1: (
                            <Text
                              fontSize="12px"
                              as="span"
                              className={styles.payForItemTextMuted}
                            />
                          ),
                        }}
                        values={{
                          price: safeFormatAiModelsCurrency(ws.price),
                        }}
                      />
                    </Text>
                  </div>
                ) : null,
              )}
            </div>
            <Text className={styles.payForItemTextMuted}>
              {t("AIPricingFeeNoteWithoutLink")}
            </Text>
          </div>

          <div className={styles.modelListSection}>
            <Text className={styles.modelListTitle}>
              {t("AIModelListTitle")}
            </Text>

            <Text className={styles.payForItemTextMuted}>
              <Trans
                t={t}
                ns="Services"
                i18nKey="AIPricingFeeNoteUsage"
                components={{
                  1: (
                    <Link
                      fontWeight={600}
                      fontSize="12px"
                      textDecoration="underline"
                      href="https://openrouter.ai/models"
                      target={LinkTarget.blank}
                      className={styles.payForItemTextMutedLink}
                    />
                  ),
                }}
              />
            </Text>

            <div className={styles.modelList}>
              {chatModels?.map((model, index) => {
                const title = model?.alias ?? "";
                const image = model?.image ?? "";

                return (
                  <div key={`${model.id}-${index}`} className={styles.modelRow}>
                    <div className={styles.modelIconPlaceholder}>
                      <div
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: TODO fix
                        dangerouslySetInnerHTML={{ __html: image }}
                        className={styles.iconsContainer}
                      />
                    </div>
                    <div className={styles.modelText}>
                      <div className={styles.modelNameWrapper}>
                        <Text className={styles.modelName} as="span">
                          {title}
                        </Text>
                        {model.provider ? (
                          <Text
                            className={styles.payForItemTextMuted}
                            as="span"
                          >
                            ({model.provider})
                          </Text>
                        ) : null}
                      </div>
                      <Text className={styles.payForItemTextMuted}>
                        {t("AIModelPrice", {
                          inputPrice: safeFormatAiModelsCurrency(
                            model?.price?.prompt ?? 0,
                          ),
                          outputPrice: safeFormatAiModelsCurrency(
                            model?.price?.completion ?? 0,
                          ),
                        })}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ModalDialog.Body>
      {withoutFooter ? null : (
        <ModalDialog.Footer>
          <div className={styles.closeFooter}>
            <Button
              key="OkButton"
              label={t("Payments:TopUp")}
              size={ButtonSize.normal}
              primary
              scale
              isDisabled={false}
              onClick={onTopUpClick}
              isLoading={false}
              testId="top_up_button"
            />
            <Button
              key="CancelButton"
              label={t("Common:CancelButton")}
              size={ButtonSize.normal}
              scale
              onClick={onClose}
              isDisabled={false}
              testId="cancel_top_up_button"
            />
          </div>
        </ModalDialog.Footer>
      )}
    </ModalDialog>
  );
};

export default inject(({ servicesStore }: TStore) => {
  const {
    aiToolsPrices,
    formatAiModelsCurrency,
    minimumInputPrice,
    minimumOutputPrice,
  } = servicesStore;

  return {
    aiToolsPrices,
    formatAiModelsCurrency,
    minimumInputPrice,
    minimumOutputPrice,
  };
})(observer(PricingBillingBody));
