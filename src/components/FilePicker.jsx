import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import { UploadCloud, X, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "../utils/utils";

const variantStyles = {
  default: `
    bg-card border-border 
    focus-within:border-primary
    hover:border-primary/50
  `,
  error: `
    bg-card border-destructive 
    focus-within:border-destructive
    hover:border-destructive/70
  `,
  success: `
    bg-card border-success 
    focus-within:border-success
    hover:border-success/70
  `,
};

const sizeStyles = {
  sm: "p-3 text-sm rounded-md",
  md: "p-4 text-base rounded-lg",
  lg: "p-6 text-lg rounded-xl",
};

const labelSizeStyles = {
  sm: "text-sm mb-1",
  md: "text-base mb-1.5",
  lg: "text-lg mb-2",
};

const iconSizeStyles = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const baseStyles = `
  w-full text-foreground transition-all duration-200 outline-none border border-dashed
  relative flex flex-col items-center justify-center text-center cursor-pointer
  disabled:opacity-50 disabled:cursor-not-allowed
  disabled:bg-muted disabled:border-muted-foreground/20
`;

export const FilePicker = forwardRef(
  (
    {
      name,
      value,
      onChange,
      accept = "image/*",
      maxSizeInMB = 5,
      disabled = false,
      required = false,
      requiredMessage = "Please select or drop a valid file",
      variant = "default",
      size = "md",
      fullWidth = true,
      className = "",
      ...restProps
    },
    ref,
  ) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isDragActive, setIsDragActive] = useState(false);
    const [error, setError] = useState("");
    const [touched, setTouched] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
      if (!value) {
        setFile(null);
        setPreviewUrl("");
        return;
      }

      if (value instanceof File) {
        setFile(value);
        const objectUrl = URL.createObjectURL(value);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
      } else if (typeof value === "string") {
        setFile(null);
        setPreviewUrl(value);
      }
    }, [value]);

    const validateFile = (currentFile, hasUrl) => {
      if (required && !currentFile && !hasUrl) {
        return requiredMessage;
      }
      if (currentFile && currentFile.size > maxSizeInMB * 1024 * 1024) {
        return `File size is too large. Maximum size is ${maxSizeInMB}MB`;
      }
      return "";
    };

    const processFile = (selectedFile) => {
      if (disabled) return;

      setError("");
      setTouched(true);

      const validationError = validateFile(selectedFile, false);
      if (validationError) {
        setError(validationError);
        return;
      }

      if (onChange) {
        const syntheticEvent = {
          target: {
            name,
            value: selectedFile,
          },
        };
        onChange(syntheticEvent);
      }
    };

    const handleInputChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) processFile(selectedFile);
    };

    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setIsDragActive(true);
      } else if (e.type === "dragleave") {
        setIsDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (disabled) return;

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        const mimeSelector = accept.replace("*", "");
        if (accept !== "*/*" && !droppedFile.type.startsWith(mimeSelector)) {
          setError("Invalid file format type assigned");
          return;
        }
        processFile(droppedFile);
      }
    };

    const handleClearFile = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      setFile(null);
      setPreviewUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (onChange) {
        onChange({ target: { name, value: null } });
      }
    };

    const triggerInputClick = () => {
      if (!disabled) fileInputRef.current?.click();
    };

    useImperativeHandle(
      ref,
      () => ({
        validate: () => {
          const validationError = validateFile(file, !!previewUrl);
          setError(validationError);
          setTouched(true);
          return validationError === "";
        },
        clear: () => {
          setFile(null);
          setPreviewUrl("");
          setError("");
          setTouched(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        setError: (errorMessage) => {
          setError(errorMessage);
          setTouched(true);
        },
        clearError: () => setError(""),
        getValue: () => file,
        isValid: () => validateFile(file, !!previewUrl) === "",
      }),
      [file, previewUrl, required, maxSizeInMB, requiredMessage],
    );

    const showError = error && touched;
    const currentVariant = showError ? "error" : variant;

    const isImageFile =
      accept.startsWith("image/") ||
      previewUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ||
      previewUrl.startsWith("data:image") ||
      previewUrl.includes("cloudinary");

    return (
      <div className={cn(fullWidth && "w-full", "flex flex-col")}>
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

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInputClick}
          className={cn(
            baseStyles,
            variantStyles[currentVariant],
            sizeStyles[size],
            isDragActive && "border-primary bg-primary/5 scale-[0.99]",
            disabled && "bg-muted cursor-not-allowed",
            className,
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            name={name}
            accept={accept}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />

          {previewUrl ? (
            <div className="relative w-full flex flex-col items-center justify-center group gap-2">
              {isImageFile ? (
                <div className="relative max-w-35 max-h-35 rounded-lg overflow-hidden border border-border bg-background shadow-sm">
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-xl flex items-center justify-center border border-border">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
              )}

              <div className="text-xs text-muted-foreground max-w-xs truncate font-medium">
                {file ? file.name : "Current File Attached"}
              </div>

              {!disabled && (
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-foreground" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <UploadCloud
                className={cn("text-muted-foreground", iconSizeStyles[size])}
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  <span className="text-primary font-semibold">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  {accept === "image/*"
                    ? "PNG, JPG, GIF up to "
                    : "Files up to "}{" "}
                  {maxSizeInMB}MB
                </p>
              </div>
            </div>
          )}
        </div>

        {showError && error && (
          <div className="mt-1 text-destructive text-sm">
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  },
);

FilePicker.displayName = "FilePicker";
