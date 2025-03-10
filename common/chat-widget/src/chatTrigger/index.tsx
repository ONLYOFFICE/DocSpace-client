import { MessageSquare, X } from "lucide-react";
export default function ChatTrigger({
  isOpen,
  setIsOpen,
  triggerRef,
}: {
  isOpen: boolean;
  setIsOpen: Function;
  triggerRef: React.RefObject<HTMLButtonElement> | null;
}) {
  return (
    <button
      ref={triggerRef}
      onClick={() => setIsOpen(!isOpen)}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      className="cl-trigger"
    >
      <X
        className={
          "cl-trigger-icon " + (isOpen ? "cl-scale-100" : "cl-scale-0")
        }
      />
      <MessageSquare
        className={
          "cl-trigger-icon " + (isOpen ? "cl-scale-0" : "cl-scale-100")
        }
      />
    </button>
  );
}
