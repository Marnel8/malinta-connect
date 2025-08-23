import * as React from "react";

import { cn } from "@/lib/utils";

// Create a stable key generator
let textareaCounter = 0;
const generateTextareaKey = () => `textarea-${++textareaCounter}`;

const Textarea = React.forwardRef<
	HTMLTextAreaElement,
	React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
	// Generate a stable key to prevent hydration mismatches
	const [textareaKey] = React.useState(generateTextareaKey);

	return (
		<textarea
			key={textareaKey}
			className={cn(
				"flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				className
			)}
			ref={ref}
			suppressHydrationWarning
			{...props}
		/>
	);
});
Textarea.displayName = "Textarea";

export { Textarea };
