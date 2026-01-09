# 05. Design System Integration

### Purpose
To configure the Next.js application with the "Cosmic Frontier Design System." This involves translating the design tokens (colors, fonts, etc.) from the prototypes into a working Tailwind CSS configuration and setting up global styles.

### What is covered in this document?
-   Updating `tailwind.config.ts` with the project's specific theme.
-   Setting up global CSS for fonts, base styles, and decorative elements.
-   Loading the required custom fonts.
-   Cleaning up the default Next.js boilerplate.

### Why this step exists
This step is critical for ensuring that the application's UI is visually consistent with the design prototypes. By embedding the design system directly into the Tailwind configuration, we create a single source of truth for all styling, making it easier to build and maintain components that adhere to the brand's visual identity.

### Exact Actions to Take

1.  **Clean Up Default Boilerplate**
    -   Delete the contents of `src/app/globals.css` but keep the file.
    -   Replace the content of `src/app/page.tsx` with minimal "Hello World" boilerplate.
    -   Delete `src/app/favicon.ico`.
    -   Delete the default assets in the `public` directory (`next.svg`, `vercel.svg`).

2.  **Update `tailwind.config.ts`**
    Replace the content of `tailwind.config.ts` with the configuration below. This is derived directly from the `dashboard.html` prototype.

    ```typescript
    import type { Config } from "tailwindcss";

    const config: Config = {
      content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
      ],
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            primary: "var(--color-primary)",
            "primary-hover": "var(--color-primary-hover)",
            "primary-text": "var(--color-primary-text)",
            "secondary-text": "var(--color-secondary-text)",
            "background-dark": "var(--color-background-dark)",
            "card-dark": "var(--color-card-dark)",
            "border-dark": "var(--color-border-dark)",
            coral: "var(--color-coral)",
            success: "var(--color-success)",
            error: "var(--color-error)",
          },
          fontFamily: {
            display: ["Bebas Neue", "sans-serif"],
            body: ["var(--font-manrope)", "system-ui", "sans-serif"],
          },
          borderRadius: {
            DEFAULT: "4px",
            lg: "8px",
            xl: "12px",
            "2xl": "16px",
            full: "9999px",
          },
        },
      },
      plugins: [],
    };
    export default config;
    ```

3.  **Update Global Styles (`src/app/globals.css`)**
    Add the following CSS to `src/app/globals.css`. This file defines the CSS variables for colors and sets up base styles.

    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    @layer base {
      :root {
        /* Colors from prototype */
        --color-primary: #d72c2c;
        --color-primary-hover: #b52424;
        --color-primary-text: #f2e3c2;
        --color-secondary-text: #a9a9b4;
        --color-background-dark: #121828;
        --color-card-dark: #1a2238;
        --color-border-dark: #3a4466;
        --color-coral: #e86854;
        --color-success: #4caf50;
        --color-error: #d72c2c;
      }

      body {
        @apply bg-background-dark font-body text-secondary-text;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    }
    ```

4.  **Load Fonts in Root Layout (`src/app/layout.tsx`)**
    Update the root layout to load the `Bebas Neue` and `Manrope` fonts from Google Fonts and apply the dark mode class.

    ```tsx
    import type { Metadata } from "next";
    import { Bebas_Neue, Manrope } from "next/font/google";
    import "./globals.css";

    const bebasNeue = Bebas_Neue({
      subsets: ["latin"],
      weight: "400",
      variable: "--font-bebas-neue",
    });

    const manrope = Manrope({
      subsets: ["latin"],
      variable: "--font-manrope",
    });

    export const metadata: Metadata = {
      title: "Trackfolio",
      description: "Your portfolio's command center.",
    };

    export default function RootLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return (
        <html lang="en" className={`dark ${bebasNeue.variable} ${manrope.variable}`}>
          <body>{children}</body>
        </html>
      );
    }
    ```
    *Note: We use `next/font` for automatic optimization.*

### What should work at the end?
-   The application should now have a dark background (`bg-background-dark`).
-   Text should use the `Manrope` font by default.
-   The custom colors (e.g., `primary`, `coral`) and font families (`display`, `body`) should be available as Tailwind utility classes (e.g., `bg-primary`, `font-display`).
-   The default Next.js styling should be gone.

### What is intentionally NOT done yet?
-   No components (like buttons or cards) have been created.
-   The decorative background elements (stars, grain) are not yet implemented. This can be added later to the main layout.
-   No pages other than the root `page.tsx` have been styled.

### Verification & Open Questions
-   **Verified**: The design tokens for colors, fonts, and border-radius have been extracted directly from the provided `dashboard.html` prototype.
-   **Assumed**: The `next/font` optimization for Google Fonts is the desired approach.
-   **To Be Confirmed**: Are there any other global styles or decorative elements from the prototype (e.g., grain overlay, starfield) that should be applied to the root layout? For now, we have deferred this.
