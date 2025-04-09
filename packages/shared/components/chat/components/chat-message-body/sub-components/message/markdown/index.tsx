import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { Text } from "../../../../../../text";

import Code from "./Code";
// import CodeTabsComponent from "../../../../../../components/core/codeTabsComponent/ChatCodeTabComponent";

type MarkdownFieldProps = {
  chatMessage: string;
};

// Function to replace <think> tags with a placeholder before markdown processing
const preprocessChatMessage = (text: string): string => {
  // Replace <think> tags with `<span class="think-tag">think:</span>`
  return text
    .replace(/<think>/g, "`<think>`")
    .replace(/<\/think>/g, "`</think>`");
};

export const MarkdownField = ({ chatMessage }: MarkdownFieldProps) => {
  // Process the chat message to handle <think> tags
  const processedChatMessage = preprocessChatMessage(chatMessage);

  return (
    <div style={{ width: "100%" }}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ children }) => {
            return (
              <Text
                fontSize="12px"
                lineHeight="16px"
                fontWeight={400}
                color="#555F65"
              >
                {children as React.ReactNode}
              </Text>
            );
          },
          ol({ children }) {
            return <ol className="max-w-full">{children}</ol>;
          },
          ul({ children }) {
            return <ul className="max-w-full">{children}</ul>;
          },
          pre: ({ children }) => {
            return <pre>{children}</pre>;
          },
          code: ({ className, children }) => {
            let content = children as string;
            if (
              Array.isArray(children) &&
              children.length === 1 &&
              typeof children[0] === "string"
            ) {
              content = children[0] as string;
            }

            const match = /language-(\w+)/.exec(className || "");

            if (typeof content === "string") {
              if (content.length) {
                if (content[0] === "▍") {
                  return <span className="form-modal-markdown-span" />;
                }

                // Specifically handle <think> tags that were wrapped in backticks
                if (content === "<think>" || content === "</think>") {
                  return <span>{content}</span>;
                }
              }

              return (
                <Code language={match?.[1].toLowerCase()} content={content} />
              );
            }
          },
        }}
      >
        {processedChatMessage}
      </Markdown>
    </div>
  );
};
