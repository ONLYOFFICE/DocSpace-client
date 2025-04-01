import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";
// import CodeTabsComponent from "../../../../../../components/core/codeTabsComponent/ChatCodeTabComponent";

type MarkdownFieldProps = {
  chatMessage: string;
  editedFlag: React.ReactNode;
};

// Function to replace <think> tags with a placeholder before markdown processing
const preprocessChatMessage = (text: string): string => {
  // Replace <think> tags with `<span class="think-tag">think:</span>`
  return text
    .replace(/<think>/g, "`<think>`")
    .replace(/<\/think>/g, "`</think>`");
};

export const MarkdownField = ({
  chatMessage,
  editedFlag,
}: MarkdownFieldProps) => {
  // Process the chat message to handle <think> tags
  const processedChatMessage = preprocessChatMessage(chatMessage);

  return (
    <div className="w-full items-baseline gap-2">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p({ node, ...props }) {
            return <span className="w-fit max-w-full">{props.children}</span>;
          },
          ol({ node, ...props }) {
            return <ol className="max-w-full">{props.children}</ol>;
          },
          ul({ node, ...props }) {
            return <ul className="max-w-full">{props.children}</ul>;
          },
          pre({ node, ...props }) {
            return props.children;
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
                <SyntaxHighlighter
                  language={match?.[1].toLowerCase()}
                  style={tomorrow}
                  className="!mt-0 h-full w-full overflow-scroll !rounded-b-md !rounded-t-none border border-border text-left !custom-scroll"
                >
                  {content}
                </SyntaxHighlighter>
              );
            }
          },
        }}
      >
        {processedChatMessage}
      </Markdown>
      {editedFlag}
    </div>
  );
};
