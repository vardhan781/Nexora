import React from "react";

const Loader = ({ variant = "primary", fullScreen = true, className = "" }) => {
  const colors = {
    primary: {
      outer: "border-t-primary/80",
      inner: "border-t-primary",
    },
    secondary: {
      outer: "border-t-secondary/80",
      inner: "border-t-secondary",
    },
    accent: {
      outer: "border-t-success/80",
      inner: "border-t-success",
    },
  };

  const color = colors[variant];

  const Spinner = () => (
    <div className="flex-col gap-4 w-full flex items-center justify-center">
      <div
        className={`w-20 h-20 border-4 border-transparent text-4xl animate-spin flex items-center justify-center rounded-full ${color.outer} ${className}`}
      >
        <div
          className={`w-16 h-16 border-4 border-transparent text-2xl animate-spin flex items-center justify-center rounded-full ${color.inner}`}
        ></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs">
        <Spinner />
      </div>
    );
  }

  return <Spinner />;
};

export default Loader;
