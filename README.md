# Firebase Studio - Schema Switcher

This is a Next.js application built in Firebase Studio that allows conversion between XML, JSON, and basic XSD formats. It utilizes Genkit for potential future AI features.

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm

### Installation

1.  **Clone the repository (or download the source code):**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    Choose your preferred package manager:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Environment Variables

The application uses Google's Generative AI via Genkit. You'll need an API key for this.

1.  **Get an API Key:** Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  **Create a local environment file:** Copy the example file:
    ```bash
    cp .env.local.example .env.local
    ```
3.  **Edit `.env.local`:** Replace `YOUR_API_KEY_HERE` with your actual Google AI API key.
    ```.env.local
    GOOGLE_GENAI_API_KEY=YOUR_ACTUAL_API_KEY
    ```
    **Important:** Do not commit the `.env.local` file with your actual key to version control. The `.gitignore` file is already configured to prevent this.

### Running the Application

#### Development Mode

This mode provides hot-reloading and detailed error messages, ideal for development.

1.  **Start the Next.js development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    This will typically start the server on `http://localhost:9002`.

2.  **(Optional) Start the Genkit development flow server:**
    If you are developing or testing Genkit flows, run this in a separate terminal:
    ```bash
    npm run genkit:dev
    # or
    yarn genkit:dev
    # or
    pnpm genkit:dev
    ```
    This allows you to inspect and interact with Genkit flows locally, usually via `http://localhost:4000`.

#### Production Mode

This mode optimizes the application for performance.

1.  **Build the application:**
    ```bash
    npm run build
    # or
    yarn build
    # or
    pnpm build
    ```

2.  **Start the production server:**
    ```bash
    npm run start
    # or
    yarn start
    # or
    pnpm start
    ```
    This will start the optimized server, usually on `http://localhost:3000` (or the port specified by the `PORT` environment variable if set).

## Application Structure

*   `src/app/`: Contains the main application pages and layouts (using Next.js App Router).
*   `src/components/`: Reusable UI components, including ShadCN UI components.
*   `src/lib/`: Utility functions, including the conversion logic (`conversion.ts`).
*   `src/hooks/`: Custom React hooks.
*   `src/ai/`: Contains Genkit related code (instance configuration, flows, etc.).
*   `public/`: Static assets.
*   `components.json`: ShadCN UI configuration.
*   `next.config.ts`: Next.js configuration.
*   `tailwind.config.ts`: Tailwind CSS configuration.
*   `tsconfig.json`: TypeScript configuration.
*   `package.json`: Project dependencies and scripts.
```