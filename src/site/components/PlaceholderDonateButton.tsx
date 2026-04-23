type PlaceholderDonateButtonProps = {
  buttonClassName: string;
  label?: string;
  onClick: () => void;
};

export function PlaceholderDonateButton({
  buttonClassName,
  label = "Donate now",
  onClick
}: PlaceholderDonateButtonProps) {
  return (
    <button
      className={buttonClassName}
      type="button"
      onClick={onClick}
      aria-label={`${label}. Opens the Zeffy donation form.`}
      title="Open the Zeffy donation form"
    >
      {label}
    </button>
  );
}
