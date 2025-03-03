import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { TFunction } from "@pancakeswap/localization";
import { CaretDown, Check } from "@phosphor-icons/react";
import clsx from "clsx";

export type SelectOption = {
  label: string;
  value: string;
};

type BaseSelectProps = {
  options: SelectOption[];
  prefix?: string;
  prefixClassName?: string;
  placeholder?: string;
  t?: TFunction;
};

type SingleSelectProps = BaseSelectProps & {
  selectedOption: SelectOption | null;
  onSelect: (option: SelectOption) => void;
  multiple?: false;
};

type MultipleSelectProps = BaseSelectProps & {
  selectedOption: SelectOption[] | null;
  onSelect: (option: SelectOption[]) => void;
  multiple: true;
};

type CustomSelectProps = SingleSelectProps | MultipleSelectProps;
const defaultT: TFunction = ((key: string) => key) as TFunction;
export function CustomSelect({
  options,
  prefix,
  prefixClassName,
  placeholder,
  selectedOption,
  onSelect,
  multiple,
  t = defaultT,
}: CustomSelectProps) {
  return (
    <Listbox value={selectedOption} onChange={onSelect} multiple={multiple}>
      <ListboxButton
        className={clsx(
          "relative w-full h-9 flex justify-between items-center space-x-2 rounded-full bg-neutral px-4 py-2 text-sm text-on-surface",
          "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
          "hover:bg-overlay-surface-hover-light"
        )}
      >
        <span className="flex-shrink truncate">
          {multiple ? (
            selectedOption && selectedOption?.length > 0 ? (
              <>
                {prefix ? <span className={prefixClassName}>{prefix}: </span> : ""}
                <span>{selectedOption.map((s) => t(s.label)).join(", ")}</span>
              </>
            ) : (
              placeholder || "Select..."
            )
          ) : selectedOption && "label" in selectedOption ? (
            <>
              {prefix ? <span className={prefixClassName}>{prefix}: </span> : ""}
              <span>{t(selectedOption?.label)}</span>
            </>
          ) : (
            placeholder || "Select..."
          )}
        </span>
        <CaretDown className="group pointer-events-none size-4 text-on-surface" aria-hidden="true" />
      </ListboxButton>
      <ListboxOptions
        anchor="bottom"
        transition
        className={clsx(
          "w-[var(--button-width)] rounded-3xl border border-white/20 bg-gray-800 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
          "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 z-modal !top-[185px]"
        )}
      >
        {options.map((opt) => (
          <ListboxOption
            key={opt.label}
            value={opt}
            className="group flex cursor-pointer items-center gap-2 rounded-3xl py-1.5 px-3 select-none data-[focus]:bg-white/10"
          >
            <Check className="invisible size-4 text-on-surface group-data-[selected]:visible" />
            <div className="text-sm/6 text-on-surface">{t(opt.label)}</div>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
