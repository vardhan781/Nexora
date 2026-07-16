import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "../utils/utils";
import {
  formatDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  isSameDay,
  isDateInRange,
  isToday,
  addMonths,
  addYears,
} from "../utils/dateUtils";

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
  cursor-pointer
  focus:ring-0 text-foreground
`;

export const DatePicker = forwardRef(
  (
    {
      name,
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder = "Select date",
      disabled = false,
      required = false,
      requiredMessage = "This field is required",
      variant = "default",
      size = "md",
      fullWidth = true,
      className = "",
      label = null,
      hint = null,
      dateFormat = "DD-MM-YYYY",
      minDate = null,
      maxDate = null,
      clearable = true,
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
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState("days");
    const [activeYear, setActiveYear] = useState(currentMonth.getFullYear());

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    const displayValue = value ? formatDate(value, dateFormat) : "";

    const validateInput = (valueToValidate) => {
      if (required && !valueToValidate) {
        return requiredMessage;
      }

      if (
        valueToValidate &&
        minDate &&
        new Date(valueToValidate) < new Date(minDate)
      ) {
        return `Date must be after ${formatDate(minDate, dateFormat)}`;
      }

      if (
        valueToValidate &&
        maxDate &&
        new Date(valueToValidate) > new Date(maxDate)
      ) {
        return `Date must be before ${formatDate(maxDate, dateFormat)}`;
      }

      return "";
    };

    const handleBlur = (e) => {
      setTouched(true);
      const validationError = validateInput(value);
      setError(validationError);

      if (onBlur) onBlur(e);
    };

    const handleChange = (selectedDate) => {
      const dateValue = selectedDate ? new Date(selectedDate) : null;

      const syntheticEvent = {
        target: {
          name,
          value: dateValue,
        },
      };

      if (error) {
        setError("");
      }

      if (onChange) onChange(syntheticEvent);
      setIsOpen(false);
      setViewMode("days");
    };

    const handleClear = (e) => {
      e.stopPropagation();
      const syntheticEvent = {
        target: {
          name,
          value: null,
        },
      };
      if (onChange) onChange(syntheticEvent);
      setError("");
      setTouched(false);
      setIsOpen(false);
    };

    const calculateDropdownPosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownHeight = 340;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        let position = "down";
        let top = rect.bottom + 8;

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          position = "up";
          top = rect.top - dropdownHeight - 8;
        }

        setCoords({
          top,
          left: rect.left,
          width: 320,
          position,
        });
      }
    };

    const handleToggle = () => {
      if (!disabled) {
        if (!isOpen) {
          if (value) {
            setCurrentMonth(new Date(value));
            setActiveYear(new Date(value).getFullYear());
          }
          calculateDropdownPosition();
        }
        setIsOpen(!isOpen);
      }
    };

    const goToPreviousMonth = () => {
      const newDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
      );
      setCurrentMonth(newDate);
      setActiveYear(newDate.getFullYear());
    };

    const goToNextMonth = () => {
      const newDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
      );
      setCurrentMonth(newDate);
      setActiveYear(newDate.getFullYear());
    };

    const goToPreviousYear = () => {
      if (viewMode === "years") {
        setActiveYear(activeYear - 12);
      } else {
        const newDate = new Date(
          currentMonth.getFullYear() - 1,
          currentMonth.getMonth(),
        );
        setCurrentMonth(newDate);
        setActiveYear(newDate.getFullYear());
      }
    };

    const goToNextYear = () => {
      if (viewMode === "years") {
        setActiveYear(activeYear + 12);
      } else {
        const newDate = new Date(
          currentMonth.getFullYear() + 1,
          currentMonth.getMonth(),
        );
        setCurrentMonth(newDate);
        setActiveYear(newDate.getFullYear());
      }
    };

    const selectMonth = (monthIndex) => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex));
      setViewMode("days");
    };

    const selectYear = (year) => {
      setCurrentMonth(new Date(year, currentMonth.getMonth()));
      setActiveYear(year);
      setViewMode("months");
    };

    const renderDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      const days = [];

      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isSelected = value && isSameDay(date, new Date(value));
        const isDisabled = !isDateInRange(
          date,
          minDate ? new Date(minDate) : null,
          maxDate ? new Date(maxDate) : null,
        );
        const isToday = isSameDay(date, new Date());

        days.push(
          <button
            key={day}
            onClick={() => !isDisabled && handleChange(date)}
            disabled={isDisabled}
            className={cn(
              "h-9 w-9 rounded-md transition-colors text-sm cursor-pointer",
              isSelected && "bg-primary text-primary-foreground",
              !isSelected && !isDisabled && "hover:bg-muted text-foreground",
              isDisabled &&
                "opacity-50 cursor-not-allowed text-muted-foreground",
              isToday && !isSelected && "border border-primary",
            )}
          >
            {day}
          </button>,
        );
      }

      return days;
    };

    const renderMonths = () => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const currentYear = currentMonth.getFullYear();

      return months.map((month, index) => {
        const isCurrentMonth = currentMonth.getMonth() === index;
        const date = new Date(currentYear, index, 1);
        const isDisabled = !isDateInRange(
          date,
          minDate ? new Date(minDate) : null,
          maxDate ? new Date(maxDate) : null,
        );

        return (
          <button
            key={month}
            onClick={() => !isDisabled && selectMonth(index)}
            disabled={isDisabled}
            className={cn(
              "h-10 rounded-md transition-colors text-sm cursor-pointer",
              isCurrentMonth && "bg-primary/10 text-primary",
              !isDisabled && "hover:bg-muted text-foreground",
              isDisabled &&
                "opacity-50 cursor-not-allowed text-muted-foreground",
            )}
          >
            {month}
          </button>
        );
      });
    };

    const renderYears = () => {
      const startYear = activeYear - 5;
      const years = [];

      for (let i = 0; i < 12; i++) {
        const year = startYear + i;
        const isCurrentYear = currentMonth.getFullYear() === year;
        const date = new Date(year, 0, 1);
        const isDisabled = !isDateInRange(
          date,
          minDate ? new Date(minDate) : null,
          maxDate ? new Date(maxDate) : null,
        );

        years.push(
          <button
            key={year}
            onClick={() => !isDisabled && selectYear(year)}
            disabled={isDisabled}
            className={cn(
              "h-10 rounded-md transition-colors text-sm cursor-pointer",
              isCurrentYear && "bg-primary/10 text-primary",
              !isDisabled && "hover:bg-muted text-foreground",
              isDisabled &&
                "opacity-50 cursor-not-allowed text-muted-foreground",
            )}
          >
            {year}
          </button>,
        );
      }

      return years;
    };

    useEffect(() => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    }, [isOpen, viewMode, activeYear]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          (!triggerRef.current || !triggerRef.current.contains(event.target))
        ) {
          setIsOpen(false);
          setViewMode("days");
        }
      };

      const handleLayoutChange = () => {
        if (isOpen) {
          calculateDropdownPosition();
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
    }, [isOpen]);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          inputRef.current?.focus();
        },
        blur: () => {
          inputRef.current?.blur();
          setTouched(true);
          const validationError = validateInput(value);
          setError(validationError);
        },
        clear: () => {
          handleChange(null);
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
          handleChange(null);
          setError("");
          setTouched(false);
        },
      }),
      [value, required, requiredMessage, minDate, maxDate],
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
      sm: "w-4 h-4 text-foreground",
      md: "w-5 h-5 text-foreground",
      lg: "w-6 h-6 text-foreground",
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
          <div
            ref={triggerRef}
            className={combinedClassName}
            onClick={handleToggle}
            style={{ cursor: disabled ? "not-allowed" : "pointer" }}
          >
            <span
              className={cn(
                "block truncate",
                !value && "text-muted-foreground",
              )}
            >
              {displayValue || placeholder}
            </span>

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {clearable && value && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  <X
                    className={cn(
                      iconSize,
                      "text-muted-foreground hover:text-foreground",
                    )}
                  />
                </button>
              )}
              <Calendar className={cn(iconSize, "text-muted-foreground")} />
            </div>
          </div>

          {isOpen &&
            !disabled &&
            createPortal(
              <div
                ref={dropdownRef}
                className="fixed bg-card text-foreground border border-border rounded-lg shadow-xl overflow-hidden"
                style={{
                  top: `${coords.top}px`,
                  left: `${coords.left}px`,
                  width: `${coords.width}px`,
                  zIndex: 9999999,
                }}
              >
                <div className="p-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={
                        viewMode === "days"
                          ? goToPreviousMonth
                          : goToPreviousYear
                      }
                      className="p-1 hover:bg-muted rounded-md transition-colors cursor-pointer flex items-center justify-center text-foreground"
                    >
                      <ChevronLeft className={iconSize} />
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setViewMode("months")}
                        className="px-2 py-1 hover:bg-muted rounded-md transition-colors text-sm font-medium cursor-pointer text-foreground"
                      >
                        {currentMonth.toLocaleString("default", {
                          month: "long",
                        })}
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("years")}
                        className="px-2 py-1 hover:bg-muted rounded-md transition-colors text-sm font-medium cursor-pointer text-foreground"
                      >
                        {viewMode === "years"
                          ? activeYear
                          : currentMonth.getFullYear()}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={
                        viewMode === "days" ? goToNextMonth : goToNextYear
                      }
                      className="p-1 hover:bg-muted rounded-md transition-colors cursor-pointer flex items-center justify-center text-foreground"
                    >
                      <ChevronRight className={iconSize} />
                    </button>
                  </div>
                </div>

                <div className="p-3 text-foreground">
                  {viewMode === "days" && (
                    <>
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                          (day) => (
                            <div
                              key={day}
                              className="h-9 w-9 flex items-center justify-center text-xs font-medium text-muted-foreground"
                            >
                              {day}
                            </div>
                          ),
                        )}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {renderDays()}
                      </div>
                    </>
                  )}

                  {viewMode === "months" && (
                    <div className="grid grid-cols-3 gap-2">
                      {renderMonths()}
                    </div>
                  )}

                  {viewMode === "years" && (
                    <div className="grid grid-cols-3 gap-2">
                      {renderYears()}
                    </div>
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

DatePicker.displayName = "DatePicker";
