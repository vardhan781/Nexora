import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../utils/utils";

const variantStyles = {
  default: `
    bg-card border-border 
    focus:border-primary
    hover:border-primary/50
  `,
  error: `
    bg-card border-destructive 
    focus:border-destructive
    hover:border-destructive/70
  `,
  success: `
    bg-card border-success 
    focus:border-success
    hover:border-success/70
  `,
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-4 py-2 text-base rounded-lg",
  lg: "px-6 py-3 text-lg rounded-xl",
};

const labelSizeStyles = {
  sm: "text-sm mb-1",
  md: "text-base mb-1.5",
  lg: "text-lg mb-2",
};

const baseStyles = `
  w-full transition-all duration-200 outline-none border
  disabled:opacity-50 disabled:cursor-not-allowed
  disabled:bg-muted disabled:border-muted-foreground/20
  appearance-none cursor-pointer
  focus:ring-0 text-foreground
`;

export const Select = forwardRef(
  (
    {
      name,
      value,
      onChange,
      onBlur,
      onFocus,
      options = [],
      placeholder = "Select an option",
      disabled = false,
      required = false,
      requiredMessage = "This field is required",
      variant = "default",
      size = "md",
      fullWidth = true,
      className = "",
      label = null,
      hint = null,
      dropdownPosition = "auto",
      ...restProps
    },
    ref,
  ) => {
    const [error, setError] = useState("");
    const [touched, setTouched] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const [coords, setCoords] = useState({
      top: 0,
      left: 0,
      width: 0,
      position: "down",
    });

    const selectRef = useRef(null);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    const validateInput = (valueToValidate) => {
      if (required && (!valueToValidate || valueToValidate === "")) {
        return requiredMessage;
      }
      return "";
    };

    const handleBlur = (e) => {
      setTouched(true);
      const validationError = validateInput(value);
      setError(validationError);

      if (onBlur) onBlur(e);
    };

    const handleChange = (selectedValue) => {
      const syntheticEvent = {
        target: {
          name,
          value: selectedValue,
        },
      };

      if (error) {
        setError("");
      }

      if (onChange) onChange(syntheticEvent);
      setIsOpen(false);
    };

    const getSelectedLabel = () => {
      const selectedOption = options.find((opt) => opt.value === value);
      return selectedOption ? selectedOption.label : placeholder;
    };

    const updateDropdownCoordinates = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();

        const itemHeight = size === "sm" ? 32 : 40;
        const totalItemsHeight =
          options.length === 0 ? 40 : options.length * itemHeight;

        const dropdownHeight = Math.min(totalItemsHeight, 240);

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        let position = "down";
        let top = rect.bottom + 6;

        if (dropdownPosition === "up") {
          position = "up";
          top = rect.top - dropdownHeight - 6;
        } else if (dropdownPosition === "down") {
          position = "down";
          top = rect.bottom + 6;
        } else {
          if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            position = "up";
            top = rect.top - dropdownHeight - 8;
          }
        }

        setCoords({
          top,
          left: rect.left,
          width: rect.width,
          position,
        });
      }
    };

    const handleOpen = () => {
      if (!disabled) {
        if (!isOpen) {
          setTimeout(() => {
            updateDropdownCoordinates();
          }, 0);
        }
        setIsOpen(!isOpen);
      }
    };

    useEffect(() => {
      if (isOpen) {
        updateDropdownCoordinates();
      }
    }, [options.length, isOpen]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          (!triggerRef.current || !triggerRef.current.contains(event.target))
        ) {
          setIsOpen(false);
        }
      };

      const handleLayoutChange = () => {
        if (isOpen) {
          updateDropdownCoordinates();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleLayoutChange, true);
      window.addEventListener("resize", handleLayoutChange);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleLayoutChange, true);
        window.removeEventListener("resize", handleLayoutChange);
      };
    }, [isOpen, dropdownPosition]);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          selectRef.current?.focus();
        },
        blur: () => {
          selectRef.current?.blur();
        },
        clear: () => {
          handleChange("");
          setError("");
          setTouched(false);
        },
        validate: () => {
          const validationError = validateInput(value);
          setError(validationError);
          setTouched(true);
          return validationError === "";
        },
        setError: (errorMessage) => {
          setError(errorMessage);
          setTouched(true);
        },
        clearError: () => {
          setError("");
        },
        getValue: () => {
          return value;
        },
        setValue: (newValue) => {
          handleChange(newValue);
        },
        isValid: () => {
          return validateInput(value) === "";
        },
        reset: () => {
          handleChange("");
          setError("");
          setTouched(false);
        },
      }),
      [value, required, requiredMessage],
    );

    const showError = error && touched;
    const currentVariant = showError ? "error" : variant;

    const combinedClassName = cn(
      baseStyles,
      variantStyles[currentVariant],
      sizeStyles[size],
      fullWidth && "w-full",
      className,
      "pr-10",
    );

    const iconSize = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    }[size];

    return (
      <div className={cn(fullWidth && "w-full")}>
        {label && (
          <label
            className={cn(
              "block font-medium text-foreground",
              labelSizeStyles[size],
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={selectRef}
            name={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={onFocus}
            disabled={disabled}
            className="absolute opacity-0 pointer-events-none"
            tabIndex={-1}
            aria-hidden="true"
            {...restProps}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div
            ref={triggerRef}
            className={combinedClassName}
            onClick={handleOpen}
            style={{ cursor: disabled ? "not-allowed" : "pointer" }}
          >
            <span
              className={cn(
                "block truncate",
                !value && "text-muted-foreground",
              )}
            >
              {getSelectedLabel()}
            </span>

            <ChevronDown
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-200",
                iconSize,
                isOpen && "rotate-180",
              )}
            />
          </div>

          {isOpen &&
            !disabled &&
            createPortal(
              <div
                ref={dropdownRef}
                className="fixed bg-card border border-border rounded-lg shadow-xl overflow-hidden"
                style={{
                  top: `${coords.top}px`,
                  left: `${coords.left}px`,
                  width: `${coords.width}px`,
                  zIndex: 99999,
                }}
              >
                <div className="max-h-60 overflow-y-auto">
                  {options.length === 0 ? (
                    <div className="px-3 py-2 text-muted-foreground text-sm">
                      No options available
                    </div>
                  ) : (
                    options.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          "cursor-pointer transition-colors flex items-center justify-between",
                          size === "sm"
                            ? "px-3 py-1.5 text-sm"
                            : "px-3 py-2 text-base",
                          value === option.value
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted/50",
                        )}
                        onClick={() => handleChange(option.value)}
                      >
                        <span>{option.label}</span>
                        {value === option.value && (
                          <Check className={cn(iconSize, "text-primary")} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>,
              document.body,
            )}
        </div>

        {showError && error && (
          <div className="mt-1 text-destructive text-sm">
            <span>{error}</span>
          </div>
        )}

        {hint && !showError && (
          <div className="mt-1 text-muted-foreground text-sm">{hint}</div>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
