import { AtomBox, SwapCSS, Text } from "@pancakeswap/uikit";

import clsx from "clsx";
import { NumericalInput, NumericalInputProps } from "./NumericalInput";

interface CurrencyInputPanelProps extends Omit<NumericalInputProps, "onBlur"> {
  onInputBlur?: () => void;
  id: string;
  top?: React.ReactNode;
  bottom?: React.ReactNode;
  showBridgeWarning?: boolean;
}
export function CurrencyInputPanel({
  value,
  onUserInput,
  onInputBlur,
  top,
  bottom,
  id,
  disabled,
  error,
  loading,
  showBridgeWarning,
}: CurrencyInputPanelProps) {
  return (
    <AtomBox position="relative" id={id} display="grid" gap="4px">
      <AtomBox display="flex" alignItems="center" justifyContent="space-between">
        {top}
      </AtomBox>
      <AtomBox
        display="flex"
        flexDirection="column"
        flexWrap="nowrap"
        position="relative"
        backgroundColor="formBackground"
        zIndex="1"
        className="bg-surface-container-highest rounded-2xl"
      >
        <AtomBox
          as="label"
          className={clsx(
            SwapCSS.inputContainerVariants({
              showBridgeWarning: !!showBridgeWarning,
              error: Boolean(error),
            }),
            "bg-surface-container-highest"
          )}
        >
          <AtomBox
            display="flex"
            flexDirection="row"
            flexWrap="nowrap"
            color="text"
            fontSize="12px"
            lineHeight="16px"
            px="16px"
            pt="12px"
          >
            <NumericalInput
              error={Boolean(error)}
              disabled={disabled}
              loading={loading}
              className="token-amount-input text-white text-lg"
              value={value}
              onBlur={onInputBlur}
              onUserInput={(val) => {
                onUserInput(val);
                console.log("__origin?", val);
              }}
            />
          </AtomBox>
          {bottom}
        </AtomBox>

        {error ? (
          <Text pb="8px" fontSize="12px" color="red">
            {error}
          </Text>
        ) : null}

        {disabled && (
          <AtomBox role="presentation" position="absolute" inset="0px" backgroundColor="backgroundAlt" opacity="0.6" />
        )}
      </AtomBox>
    </AtomBox>
  );
}
