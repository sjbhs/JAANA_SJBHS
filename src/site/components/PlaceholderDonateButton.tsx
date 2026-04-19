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
      aria-label={`${label}. Online giving will be available soon.`}
      title="Online giving will be available soon."
    >
      {label}
    </button>
  );
}
