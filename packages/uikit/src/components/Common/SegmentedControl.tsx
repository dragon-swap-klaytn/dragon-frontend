import { useTranslation } from "@pancakeswap/localization";
import clsx from "clsx";

type SegmentedControlProps<T extends string> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  fullWidth?: boolean;
  useTranslationOption?: boolean;
  paddingX?: string;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  fullWidth,
  useTranslationOption = false,
  paddingX = "px-4",
  className,
}: SegmentedControlProps<T>) {
  const { t } = useTranslation();

  return (
    <div
      className={clsx("flex items-center space-x-2 bg-neutral w-fit rounded-full", className, {
        "w-full": fullWidth,
      })}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={clsx("py-2 text-sm focus:outline-none rounded-full w-full text-on-surface", paddingX, {
            "bg-neutral-pressed": value === option,
            "bg-transparent": value !== option,
          })}
        >
          {useTranslationOption ? t(option) : option}
        </button>
      ))}
    </div>
  );
}
