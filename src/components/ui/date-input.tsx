
import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateInputProps {
  value?: string;
  onChange: (date: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, placeholder = "DD/MM/AAAA", className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    React.useEffect(() => {
      if (value) {
        // Converter de YYYY-MM-DD para DD/MM/YYYY
        const [year, month, day] = value.split('-');
        setDisplayValue(`${day}/${month}/${year}`);
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const formatDateInput = (input: string) => {
      // Remove tudo que não é número
      const numbers = input.replace(/\D/g, '');
      
      // Adiciona as barras automaticamente
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 4) {
        return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
      } else {
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const formatted = formatDateInput(input);
      setDisplayValue(formatted);

      // Se tem 10 caracteres (DD/MM/AAAA), tenta converter para YYYY-MM-DD
      if (formatted.length === 10) {
        const [day, month, year] = formatted.split('/');
        
        // Validação básica
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        
        if (dayNum >= 1 && dayNum <= 31 && 
            monthNum >= 1 && monthNum <= 12 && 
            yearNum >= 1900 && yearNum <= 2100) {
          const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          onChange(isoDate);
        } else {
          onChange(undefined);
        }
      } else {
        onChange(undefined);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permitir apenas números, backspace, delete, tab, escape, enter, setas
      if (!/[0-9]/.test(e.key) && 
          !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={10}
        className={cn("text-xs", className)}
        {...props}
      />
    );
  }
);

DateInput.displayName = "DateInput";
