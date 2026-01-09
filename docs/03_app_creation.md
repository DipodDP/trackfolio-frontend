# 03. Application Creation

### Purpose
To generate the initial Next.js application scaffold. This step uses the tools set up in the previous stage to create the foundational file structure and boilerplate code for the project.

### What is covered in this document?
-   Running the `create-next-app` command with the correct configuration.
-   Initializing the project within the `trackfolio_frontend` directory.
-   Starting the development server for the first time to verify the setup.

### Why this step exists
This is the first concrete step in building the application. It transforms the environment setup into a tangible, running Next.js project. Having a standardized, automated scaffolding process ensures that all developers start with the exact same project baseline.

### Exact Actions to Take

1.  **Navigate to the Project Directory**
    Open your terminal and navigate into the `trackfolio_frontend` directory. This is where the new application will live.
    ```bash
    cd /path/to/your/projects/trackfolio_frontend
    ```

2.  **Run the `create-next-app` Scaffolding Command**
    Execute the following command using `pnpm`. The `.` at the end tells the script to create the project in the current directory.
    ```bash
    pnpm create next-app@latest .
    ```

3.  **Answer the Prompts as Follows**
    You will be prompted with several questions. Use these exact settings to ensure consistency:

    ```
    ✔ Would you like to use TypeScript? … Yes
    ✔ Would you like to use ESLint? … Yes
    ✔ Would you like to use Tailwind CSS? … Yes
    ✔ Would you like to use `src/` directory? … Yes
    ✔ Would you like to use App Router? (recommended) … Yes
    ✔ Would you like to customize the default import alias (@/*)? … No
    ```

    This configuration gives us:
    -   **TypeScript**: For type safety.
    -   **ESLint**: For code quality.
    -   **Tailwind CSS**: For styling, as required by the design system.
    -   **`src/` directory**: For a clean project structure.
    -   **App Router**: The modern, recommended routing system for Next.js.

4.  **Verify the Installation**
    Once the installation is complete, start the development server:
    ```bash
    pnpm dev
    ```

    This will launch the application on `http://localhost:3000`.

### What should work at the end?
-   The `trackfolio_frontend` directory should now be populated with the Next.js project files and a `node_modules` directory.
-   When you run `pnpm dev`, the application should compile successfully.
-   Opening `http://localhost:3000` in your browser should display the default Next.js welcome page.

### What is intentionally NOT done yet?
-   The default boilerplate content from the `create-next-app` template has not been removed or modified.
-   No custom pages, components, or styling have been added.
-   The project has not been initialized as a Git repository yet.

### Verification & Open Questions
-   **Verified**: This step confirms that the Node.js and `pnpm` environment is correctly configured. A successful run proves the toolchain is functional.
-   **Assumed**: The local machine has an active internet connection to download the necessary packages. Port 3000 is available.
-   **To Be Confirmed**: No open questions at this stage. This is a standard, deterministic process.
