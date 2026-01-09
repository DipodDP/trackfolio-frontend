# 02. Project Setup

### Purpose
To establish a consistent, reproducible development environment for every developer on the project. This guide ensures that all team members are using the same core toolchain, which is the first step in minimizing environment-specific issues.

### What is covered in this document?
-   Specifying the exact Node.js version.
-   Installing and configuring the project's package manager.
-   Recommended editor settings and extensions.
-   Cloning the starter repository (if one exists).

### Why this step exists
A standardized development environment is crucial for team productivity. It reduces the time spent on troubleshooting setup problems ("it works on my machine") and allows developers to get straight to building features. It also ensures that dependencies and tool versions are consistent, which is critical for avoiding subtle bugs.

### Exact Actions to Take

1.  **Install a Node.js Version Manager**
    We recommend using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) to handle different Node.js versions.
    -   **macOS/Linux**: Follow the installation instructions [here](https://github.com/nvm-sh/nvm#installing-and-updating).
    -   **Windows**: Use [nvm-windows](https://github.com/coreybutler/nvm-windows).

2.  **Install and Use the Correct Node.js Version**
    This project will use the current Long-Term Support (LTS) version of Node.js.
    ```bash
    # Install the latest LTS version
    nvm install --lts

    # Set it as the version to use
    nvm use --lts

    # Verify the version (e.g., v20.x.x)
    node -v
    ```

3.  **Install `pnpm` as the Package Manager**
    We will use [pnpm](https://pnpm.io/) for its performance and efficient disk space usage.
    ```bash
    # Install pnpm globally using npm (which comes with Node.js)
    npm install -g pnpm

    # Verify the installation
    pnpm -v
    ```

4.  **Set Up Visual Studio Code (Recommended)**
    While you can use any editor, we recommend [VS Code](https://code.visualstudio.com/) with the following extensions for an optimal development experience:
    -   [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint): Integrates ESLint into the editor to show linting errors.
    -   [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode): Automatically formats code on save.
    -   [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss): Provides autocompletion, syntax highlighting, and linting for Tailwind CSS.

    **Recommended VS Code Settings (`.vscode/settings.json`):**
    It is recommended to create a `.vscode/settings.json` file in the project root with the following content to enable format-on-save:
    ```json
    {
      "editor.formatOnSave": true,
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
    ```

### What should work at the end?
-   You should have the correct versions of `node` and `pnpm` installed and available in your terminal.
-   Your code editor should be configured with the recommended extensions.
-   You are now ready to proceed to the next step: creating the application scaffold.

### What is intentionally NOT done yet?
-   No project repository has been cloned or initialized.
-   No project-specific dependencies have been installed.
-   No application code has been written.

### Verification & Open Questions
-   **Verified**: The need for a standardized toolchain is a standard best practice.
-   **Assumed**: Developers have the necessary permissions on their machines to install the required software. The choice of `pnpm` is an architectural decision favoring efficiency.
-   **To Be Confirmed**:
    -   Is there a central repository to clone, or should we initialize a new one from scratch? For this guide, we will assume we are starting from an empty directory.
