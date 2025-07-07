
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
    const [isValid, setIsValid] = React.useState(true);
    const timeoutRef = React.useRef<NodeJS.Timeout>();

    React.useEffect(() => {
      if (value) {
        // Converter de YYYY-MM-DD para DD/MM/YYYY
        const [year, month, day] = value.split('-');
        setDisplayValue(`${day}/${month}/${year}`);
        setIsValid(true);
      } else {
        setDisplayValue("");
        setIsValid(true);
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

    const validateDate = (formatted: string) => {
      if (formatted.length !== 10) return false;
      
      const [day, month, year] = formatted.split('/');
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      // Validação básica de ranges
      if (dayNum < 1 || dayNum > 31 || 
          monthNum < 1 || monthNum > 12 || 
          yearNum < 1900 || yearNum > 2100) {
        return false;
      }

      // Validação mais específica de dias por mês
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      
      // Verificar ano bissexto
      if (monthNum === 2 && ((yearNum % 4 === 0 && yearNum % 100 !== 0) || yearNum % 400 === 0)) {
        daysInMonth[1] = 29;
      }
      
      return dayNum <= daysInMonth[monthNum - 1];
    };

    const debouncedOnChange = React.useCallback((date: string | undefined) => {
      // Limpar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Definir novo timeout de 500ms
      timeoutRef.current = setTimeout(() => {
        onChange(date);
      }, 500);
    }, [onChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const formatted = formatDateInput(input);
      setDisplayValue(formatted);

      // Se tem 10 caracteres (DD/MM/AAAA), valida e converte
      if (formatted.length === 10) {
        const isDateValid = validateDate(formatted);
        setIsValid(isDateValid);
        
        if (isDateValid) {
          const [day, month, year] = formatted.split('/');
          const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          debouncedOnChange(isoDate);
        } else {
          debouncedOnChange(undefined);
        }
      } else {
        setIsValid(true); // Não mostrar erro enquanto está digitando
        // Só limpar se estava com valor antes
        if (value) {
          debouncedOnChange(undefined);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permitir apenas números, backspace, delete, tab, escape, enter, setas
      if (!/[0-9]/.test(e.key) && 
          !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };

    // Limpar timeout ao desmontar componente
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={10}
        className={cn(
          "text-xs",
          !isValid && "border-red-500 focus:border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      />
    );
  }
);

DateInput.displayName = "DateInput";
