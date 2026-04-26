import { useRef } from "react";
import type { ReactNode } from "react";

type InlineEditableTextProps = {
  editable: boolean;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  richText?: boolean;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
};

function renderInlineFormatting(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function RichTextDisplay({ value }: { value: string }) {
  const lines = value.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let bulletItems: string[] = [];

  const flushBullets = () => {
    if (!bulletItems.length) {
      return;
    }

    blocks.push(
      <ul className="rich-text-list" key={`list-${blocks.length}`}>
        {bulletItems.map((item, index) => (
          <li key={index}>{renderInlineFormatting(item)}</li>
        ))}
      </ul>
    );
    bulletItems = [];
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const bulletMatch = trimmedLine.match(/^[-*]\s+(.+)$/);

    if (bulletMatch) {
      bulletItems.push(bulletMatch[1]);
      return;
    }

    flushBullets();

    if (!trimmedLine) {
      return;
    }

    blocks.push(<p key={`line-${index}`}>{renderInlineFormatting(trimmedLine)}</p>);
  });

  flushBullets();

  return <>{blocks.length ? blocks : value}</>;
}

export function InlineEditableText({
  editable,
  value,
  onChange,
  multiline = false,
  richText = false,
  className = "",
  placeholder = "",
  ariaLabel
}: InlineEditableTextProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editableLabel = ariaLabel ?? (multiline ? "Editable multiline text" : "Editable text");

  const insertText = (before: string, after = "") => {
    const textarea = textareaRef.current;

    if (!textarea) {
      onChange(`${value}${before}${after}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end);
    const nextValue = `${value.slice(0, start)}${before}${selectedText}${after}${value.slice(end)}`;

    onChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea.focus();
      const cursorPosition = selectedText ? start + before.length + selectedText.length + after.length : start + before.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  if (!editable) {
    if (richText) {
      return <RichTextDisplay value={value} />;
    }

    return <>{value}</>;
  }

  if (multiline) {
    return (
      <span className="inline-edit-rich-wrap">
        {richText ? (
          <span className="inline-edit-toolbar" role="toolbar" aria-label="Rich text formatting">
            <button type="button" onClick={() => insertText("- ")}>
              Bullet
            </button>
            <button type="button" onClick={() => insertText("**", "**")}>
              Bold
            </button>
            <button type="button" onClick={() => insertText("*", "*")}>
              Italic
            </button>
          </span>
        ) : null}
        <textarea
          ref={textareaRef}
          className={`inline-edit-field inline-edit-textarea ${className}`.trim()}
          value={value}
          placeholder={placeholder}
          aria-label={editableLabel}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    );
  }

  return (
    <input
      className={`inline-edit-field ${className}`.trim()}
      value={value}
      placeholder={placeholder}
      aria-label={editableLabel}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
