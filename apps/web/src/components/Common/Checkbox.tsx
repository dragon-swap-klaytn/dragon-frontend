import { Check } from '@phosphor-icons/react'
import { ChangeEventHandler } from 'react'

export default function Checkbox({
  id,
  checked,
  onChange,
}: {
  id: string
  checked: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
}) {
  return (
    <div className="relative w-5 h-5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="common-checkbox checked:accent-white bg-surface-container-highest w-full h-full rounded-[4px] cursor-pointer"
      />

      {checked && (
        <Check
          size={20}
          weight="bold"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-on-surface-orange pointer-events-none"
        />
      )}

      <style jsx global>{`
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
  )
}
