import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../utils/utils";

const variantStyles = {
  default: `
    bg-card border-border 
    focus:border-primary
    hover:border-primary/50
    focus:bg-card
  `,
  error: `
    bg-card border-destructive 
    focus:border-destructive
    hover:border-destructive/70
    focus:bg-card
  `,
  success: `
    bg-card border-success 
    focus:border-success
    hover:border-success/70
    focus:bg-card
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

const iconSizeStyles = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const baseStyles = `
  w-full text-foreground transition-all duration-200 outline-none border
  disabled:opacity-50 disabled:cursor-not-allowed
  disabled:bg-muted disabled:border-muted-foreground/20
  focus:ring-0
`;

export const Input = forwardRef(
  (
    {
      type = "text",
      name,
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder = "",
      disabled = false,
      readOnly = false,
      regex = null,
      regexMessage = "Invalid format",
      customValidation = null,
      required = false,
      requiredMessage = "This field is required",
      variant = "default",
      size = "md",
      fullWidth = true,
      className = "",
      leftIcon = null,
      rightIcon = null,
      isTextarea = false,
      rows = 3,
      disableWheel = true,
      autoComplete = "off",
      ...restProps
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [touched, setTouched] = useState(false);

    const inputRef = useRef(null);

    const isPasswordType = type === "password";
    const inputType = isPasswordType
      ? showPassword
        ? "text"
        : "password"
      : type;

    const validateInput = (valueToValidate) => {
      if (required && !valueToValidate) {
        return requiredMessage;
      }

      if (regex && valueToValidate && !regex.test(valueToValidate)) {
        return regexMessage;
      }

      if (customValidation && valueToValidate) {
        const customError = customValidation(valueToValidate);
        if (customError) return customError;
      }

      return "";
    };

    const handleBlur = (e) => {
      setTouched(true);
      const validationError = validateInput(e.target.value);
      setError(validationError);

      if (onBlur) onBlur(e);
    };

    const handleChange = (e) => {
      const newValue = e.target.value;

      if (error) {
        setError("");
      }

      if (onChange) onChange(e);
    };

    const handleWheel = (e) => {
      if (disableWheel && type === "number") {
        e.target.blur();
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          inputRef.current?.focus();
        },
        blur: () => {
          inputRef.current?.blur();
        },
        clear: () => {
          const syntheticEvent = { target: { value: "" } };
          handleChange(syntheticEvent);
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
          if (onChange) {
            const syntheticEvent = { target: { value: newValue, name } };
            onChange(syntheticEvent);
          }
        },
        isValid: () => {
          return validateInput(value) === "";
        },
        reset: () => {
          const syntheticEvent = { target: { value: "" } };
          handleChange(syntheticEvent);
          setError("");
          setTouched(false);
        },
      }),
      [
        value,
        required,
        regex,
        regexMessage,
        customValidation,
        requiredMessage,
        name,
        onChange,
      ],
    );

    const showError = error && touched;
    const currentVariant = showError ? "error" : variant;

    const combinedClassName = cn(
      baseStyles,
      variantStyles[currentVariant],
      sizeStyles[size],
      fullWidth && "w-full",
      leftIcon && "pl-10",
      (rightIcon || isPasswordType) && "pr-10",
      isTextarea && "resize-none",
      className,
    );

    const iconSize = iconSizeStyles[size];

    if (isTextarea) {
      return (
        <div className={cn(fullWidth && "w-full")}>
          {restProps.label && (
            <label
              className={cn(
                "block font-medium text-foreground",
                labelSizeStyles[size],
              )}
            >
              {restProps.label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}
          <div className="relative">
            {leftIcon && (
              <div
                className={cn(
                  "absolute left-3 top-3 text-muted-foreground",
                  iconSize,
                )}
              >
                {leftIcon}
              </div>
            )}
            <textarea
              ref={inputRef}
              name={name}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={onFocus}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              rows={rows}
              className={cn(combinedClassName, "no-scrollbar")}
              {...restProps}
            />
          </div>
          {showError && error && (
            <div className="mt-1 text-destructive text-sm">
              <span>{error}</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={cn(fullWidth && "w-full")}>
        {restProps.label && (
          <label
            className={cn(
              "block font-medium text-foreground",
              labelSizeStyles[size],
            )}
          >
            {restProps.label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
                iconSize,
              )}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={inputRef}
            type={inputType}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={onFocus}
            onWheel={handleWheel}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            className={combinedClassName}
            {...restProps}
          />

          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                iconSize,
              )}
            >
              {showPassword ? (
                <EyeOff className={iconSize} />
              ) : (
                <Eye className={iconSize} />
              )}
            </button>
          )}

          {rightIcon && !isPasswordType && (
            <div
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground",
                iconSize,
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {showError && error && (
          <div className="mt-1 text-destructive text-sm">
            <span>{error}</span>
          </div>
        )}

        {restProps.hint && !showError && (
          <div className="mt-1 text-muted-foreground text-sm">
            {restProps.hint}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
