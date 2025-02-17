import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, error, ...props }, ref) => {
    return (
      <div className={cn(`relative w-full`)}>
        {!!leftIcon && (
          <div className="absolute left-3 top-[55%] -translate-y-[55%]">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            `flex h-[68px] w-full items-center justify-center gap-3 rounded-md border border-neutral-300 bg-white px-3 py-2 ${leftIcon ? "pl-10" : ""
            } ${rightIcon ? "pr-14" : ""} ${error
              ? "border-red-500 ring-1 ring-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
              : ""
            }
            text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:font-light placeholder:text-[#454545]/20 focus-visible:border-none focus-visible:outline-none focus-visible:ring-1 
            focus-visible:ring-[#4545451A]/20 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4545451A]/20
            dark:bg-white dark:ring-offset-[#4545451A]/20 dark:placeholder:text-neutral-400 dark:focus-visible:ring-[#4545451A]/20`,
            className
          )}
          ref={ref}
          {...props}
        />
        {!!rightIcon && (
          <div className="absolute right-3 top-[55%] -translate-y-[55%]">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

type ClassValue =
  | string
  | Record<string, boolean>
  | ClassValue[]
  | null
  | undefined;

function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  // Helper function to process each input
  function processInput(input: ClassValue): void {
    if (!input) return;

    if (typeof input === "string") {
      classes.push(input);
    } else if (Array.isArray(input)) {
      input.forEach(processInput);
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }

  // Process all inputs
  inputs.forEach(processInput);

  // Merge Tailwind classes
  const mergedClasses = mergeTailwindClasses(classes);

  return mergedClasses.join(" ");
}

function mergeTailwindClasses(classes: string[]): string[] {
  const classMap: Record<string, string> = {};

  classes.forEach((cls) => {
    // Extract the prefix (e.g., "border", "ring", "focus-visible", etc.)
    const prefix = cls.split("-")[0];

    // Only overwrite if the class is a direct conflict (e.g., border-neutral-300 and border-red-500)
    if (
      prefix === "border" ||
      prefix === "ring" ||
      prefix === "focus-visible"
    ) {
      classMap[prefix] = cls;
    } else {
      // Otherwise, add the class as-is
      classMap[cls] = cls;
    }
  });

  // Return the merged classes
  return Object.values(classMap);
}

