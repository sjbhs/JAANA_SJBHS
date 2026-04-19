type PlaceholderDonateButtonProps = {
  buttonClassName: string;
  label?: string;
};

export function PlaceholderDonateButton({
  buttonClassName,
  label = "Donate now"
}: PlaceholderDonateButtonProps) {
  return (
    <button
      className={buttonClassName}
      type="button"
      disabled
      aria-label={`${label} available soon`}
      title="Online giving available soon"
    >
      {label}
    </button>
  );
}
