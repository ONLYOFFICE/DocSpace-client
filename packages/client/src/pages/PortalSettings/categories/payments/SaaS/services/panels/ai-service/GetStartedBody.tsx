import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";

import AIAgentsIcon from "PUBLIC_DIR/images/icons/32/ai-agents.svg";
import ChatIcon from "PUBLIC_DIR/images/icons/32/ai-chat.svg";
import SummarizationIcon from "PUBLIC_DIR/images/icons/32/ai-summarization.svg";
import TranslationIcon from "PUBLIC_DIR/images/icons/32/ai-translation.svg";
import OcrIcon from "PUBLIC_DIR/images/icons/32/ai-ocr.svg";
import GenerationIcon from "PUBLIC_DIR/images/icons/32/ai-text-generation.svg";
import ImageGenerationIcon from "PUBLIC_DIR/images/icons/32/ai-img-generation.svg";
import ErrorIcon from "PUBLIC_DIR/images/icons/32/ai-error.svg";
import AiTokensIcon from "PUBLIC_DIR/images/icons/32/ai-tokens.svg";
import AiVectorizationIcon from "PUBLIC_DIR/images/icons/32/ai-vectorization.svg";
import AiSearchIcon from "PUBLIC_DIR/images/icons/32/ai-search.svg";
import RightArrowIcon from "PUBLIC_DIR/images/icons/16/right.arrow.react.svg";
import styles from "../../styles/BackupServiceDialog.module.scss";
import PriceBackground from "PUBLIC_DIR/images/icons/16/price.react.svg";
import AiSvg from "PUBLIC_DIR/images/icons/16/AI.svg";
import { ModalDialog, ModalDialogType } from "@docspace/ui-kit/components";
import { observer, inject } from "mobx-react";

interface ServiceOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface GetStartedBodyProps {
  onPricingBillingClick: () => void;
  visible: boolean;
  onClose: () => void;
  onBack: () => void;
  logoText?: string;
}

const GetStartedBody: React.FC<GetStartedBodyProps> = ({
  onPricingBillingClick,
  visible,
  onClose,
  onBack,
  logoText,
}) => {
  const { t } = useTranslation(["Services", "Payments", "Common"]);

  const serviceOptions: ServiceOption[] = [
    {
      id: "ai-tools",
      title: t("Common:AIAgents"),
      description: t("AIAgentsDescription", {
        mcpServer: t("Common:MCPServer"),
      }),
      icon: <AIAgentsIcon />,
    },
    {
      id: "chatbot",
      title: t("ChatBot"),
      description: t("ChatBotDescription"),
      icon: <ChatIcon />,
    },
    {
      id: "summarization",
      title: t("Summarization"),
      description: t("SummarizationDescription"),
      icon: <SummarizationIcon />,
    },
    {
      id: "text-translation",
      title: t("TextTranslation"),
      description: t("TextTranslationDescription"),
      icon: <TranslationIcon />,
    },
    {
      id: "ocr",
      title: t("OCR"),
      description: t("OCRDescription"),
      icon: <OcrIcon />,
    },
    {
      id: "text-generation",
      title: t("TextGeneration"),
      description: t("TextGenerationDescription"),
      icon: <GenerationIcon />,
    },
    {
      id: "image-generation",
      title: t("ImageGeneration"),
      description: t("ImageGenerationDescription"),
      icon: <ImageGenerationIcon />,
    },
    {
      id: "error-checking",
      title: t("ErrorChecking"),
      description: t("ErrorCheckingDescription"),
      icon: <ErrorIcon />,
    },
  ];

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      isBackButton
      onBackClick={onBack}
      onCloseClick={onClose}
      withBodyScroll
    >
      <ModalDialog.Header>
        {t("Payments:AddCreditsToAI", { organizationName: logoText })}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.getStartedSteps}>
          <div className={styles.stepMainRow}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepText}>
              <Text className={styles.stepTitleText}>
                {t("AIGetStartedStep1Title")}
              </Text>
              <Text
                fontSize="12px"
                lineHeight="16px"
                className={styles.stepDescription}
              >
                {t("AIGetStartedStep1Description", {
                  productName: t("Common:ProductName"),
                  organizationName: logoText,
                })}
              </Text>
            </div>
          </div>

          <div className={styles.stepConnectorSolid}>
            <div className={styles.stepConnectorContent}>
              <div className={styles.transfer}>
                <div className={styles.from}>
                  <Text
                    fontWeight={600}
                    fontSize={"12px"}
                    className={styles.payForItemTextMuted}
                  >
                    {t("Payments:TopUpFrom")}
                  </Text>
                </div>
                <div></div>
                <div className={styles.to}>
                  <Text
                    fontWeight={600}
                    fontSize={"12px"}
                    className={styles.payForItemTextMuted}
                  >
                    {t("Payments:TopUpTo")}
                  </Text>
                </div>

                <div className={styles.item}>
                  <div className={styles.icon}>
                    <PriceBackground />
                  </div>
                  <Text fontWeight={600} fontSize={"12px"}>
                    {t("WalletBalance")}
                  </Text>
                </div>

                <div className={styles.arrow}>
                  <RightArrowIcon />
                </div>

                <div className={styles.item}>
                  <div className={styles.icon}>
                    <AiSvg />
                  </div>
                  <Text fontWeight={600} fontSize={"12px"}>
                    {t("AIBalance")}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.stepMainRow}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepText}>
              <Text className={styles.stepTitleText}>
                {t("AIGetStartedStep2Title")}
              </Text>
              <Text
                fontSize="12px"
                lineHeight="16px"
                className={styles.stepDescription}
              >
                {t("AIGetStartedStep2Description")}
              </Text>
            </div>
          </div>

          <div className={styles.stepConnectorDashed}>
            <div className={styles.featureTilesGrid}>
              {serviceOptions.slice(0, 8).map((service) => (
                <div key={service.id} className={styles.featureTile}>
                  <div className={styles.featureTileIcon}>{service.icon}</div>
                  <Text fontSize="12px" fontWeight={600}>
                    {service.title}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.stepMainRow}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepText}>
              <Text className={styles.stepTitleText}>
                {t("AIGetStartedStep3Title")}
              </Text>
              <Text
                fontSize="12px"
                lineHeight="16px"
                className={styles.stepDescription}
              >
                {t("AIGetStartedStep3Description")}
              </Text>
            </div>
          </div>

          <div className={styles.stepConnectorDashed}>
            <div className={styles.payForSection}>
              <Text fontSize="12px" fontWeight={700}>
                {t("AIWhatYouPayForTitle")}
              </Text>

              <div className={styles.payForList}>
                <div className={styles.payForItem}>
                  <div className={styles.featureTileIcon}>
                    <AiTokensIcon />
                  </div>
                  <Text fontSize="12px" fontWeight={600}>
                    {t("AIWhatYouPayForTokens")}
                  </Text>
                </div>

                <div className={styles.payForItem}>
                  <div className={styles.featureTileIcon}>
                    <AiVectorizationIcon />
                  </div>
                  <Text fontSize="12px" fontWeight={600} as="span">
                    <Trans
                      t={t}
                      ns="Services"
                      i18nKey="AIWhatYouPayForVectorization"
                      components={{
                        1: (
                          <Text
                            fontSize="12px"
                            as="span"
                            className={styles.payForItemTextMuted}
                          />
                        ),
                      }}
                    />
                  </Text>
                </div>

                <div className={styles.payForItem}>
                  <div className={styles.featureTileIcon}>
                    <AiSearchIcon />
                  </div>
                  <Text fontSize="12px" fontWeight={600}>
                    {t("AIWhatYouPayForWebSearch")}
                  </Text>
                </div>
              </div>

              <Link
                className={styles.pricingBillingLink}
                onClick={onPricingBillingClick}
                textDecoration="underline dotted"
                color="accent"
              >
                <Text>{t("AIPricingAndBilling")}</Text>
              </Link>
            </div>
          </div>
        </div>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default inject(({ paymentStore, settingsStore }: TStore) => {
  const { formatWalletCurrency } = paymentStore;
  const { logoText } = settingsStore;
  return {
    isEnabled: true,

    formatWalletCurrency,
    logoText,
  };
})(observer(GetStartedBody));

