import clsx from "clsx";

type SegmentedControlProps<T extends string> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="flex items-center space-x-2 bg-neutral w-fit rounded-full">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={clsx("px-4 py-2 text-sm font-bold focus:outline-none rounded-full", {
            "bg-neutral-pressed": value === option,
            "text-high-emphesis": value !== option,
          })}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
