import { X } from "@phosphor-icons/react";
import clsx from "clsx";

type ChipProps = {
  className?: string;
  label: string;
  selected: boolean;
  setSelected: (v: boolean) => void;
};

export function Chip({ className, label, selected, setSelected }: ChipProps) {
  return (
    <button
      type="button"
      className={clsx(
        className,
        "inline-flex items-center justify-center rounded-full space-x-2 py-2 text-white hover:opacity-70",
        selected ? "bg-neutral-hovered px-3" : "bg-neutral px-6"
      )}
      onClick={() => setSelected(!selected)}
    >
      <span className="text-sm">{label}</span>
      <X
        className={clsx("size-4", {
          hidden: !selected,
        })}
      />
    </button>
  );
}
