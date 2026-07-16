import { useState } from "react";
import { Search, X } from "lucide-react";

export const SearchBar = ({
  onSearch,
  placeholder = "Search",
  width = "w-72",
  fullWidth = false,
  className = "",
}) => {
  const [query, setQuery] = useState("");

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const widthClass = fullWidth ? "w-full" : width;

  return (
    <div className={`relative ${widthClass} ${className}`}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-9 rounded-md border border-border bg-background pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-muted rounded-sm cursor-pointer p-0.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
