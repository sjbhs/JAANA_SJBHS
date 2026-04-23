type InlineEditableTextProps = {
  editable: boolean;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
};

export function InlineEditableText({
  editable,
  value,
  onChange,
  multiline = false,
  className = "",
  placeholder = ""
}: InlineEditableTextProps) {
  if (!editable) {
    return <>{value}</>;
  }

  if (multiline) {
    return (
      <textarea
        className={`inline-edit-field inline-edit-textarea ${className}`.trim()}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <input
      className={`inline-edit-field ${className}`.trim()}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
