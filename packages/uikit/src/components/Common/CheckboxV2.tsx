import { Check } from "@phosphor-icons/react";
import clsx from "clsx";
import { ChangeEventHandler } from "react";

export function CheckboxV2({
  id,
  checked,
  onChange,
  label,
  labelClassName,
}: {
  id?: string;
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  label?: string;
  labelClassName?: string;
}) {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative w-4 h-4">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="common-checkbox checked:accent-white bg-surface-container-highest w-full h-full rounded-[4px] cursor-pointer mb-1"
        />

        {checked && (
          <Check
            size={12}
            weight="bold"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-on-surface-orange pointer-events-none"
          />
        )}
      </div>

      {label && (
        <label htmlFor={id} className={clsx("cursor-pointer hover:opacity-70", labelClassName)}>
          {label}
        </label>
      )}

      <style>{`
        .common-checkbox {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }
        .common-checkbox:checked {
          background-color: #fff;
          border-color: #fff;
        }
      `}</style>
    </div>
  );
}
