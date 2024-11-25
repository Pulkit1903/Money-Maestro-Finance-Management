import CurrencyInput from "react-currency-input-field";
import { Info, MinusCircle, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

type Props = {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
};

export const AmountInput = ({
  value,
  onChange,
  placeholder,
  disabled,
}: Props) => {
  const parsedValue = parseFloat(value);
  const isIncome = parsedValue > 0;
  const isExpense = parsedValue < 0;

  const onReverseValue = () => {
    if (!value) return;
    onChange((parsedValue * -1).toString());
  };

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onReverseValue}
              className={cn("absolute top-2 right-2 p-2")}
            >
              {!value && <Info className="text-gray-500" />}
              {isIncome && <Info className="text-green-500" />}
              {isExpense && <Info className="text-red-500" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Use [+] to add income and [-] to add expenses
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CurrencyInput
        value={value}
        decimalsLimit={2}
        decimalScale={2}
        onValueChange={onChange}
        disabled={disabled}
        prefix="Rs. "
        placeholder={placeholder}
        className={cn(
          "block w-full px-4 py-2 text-gray-700 bg-white border rounded-md focus:border-blue-500 focus:outline-none focus:ring"
        )}
      />
      <p>
        {isIncome && <PlusCircle className="size-4 text-green-500" />}
        {isExpense && <MinusCircle className="size-4 text-red-500" />}
      </p>
    </div>
  );
};
