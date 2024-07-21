# Project README

## Overview

This repository contains two projects:

1. **Backend**: A Node.js backend server.
2. **Login App**: An Angular application with server-side rendering (SSR) support.

---

## Backend

### Description

The backend project is a Node.js application using Express.js to provide RESTful APIs. It includes authentication, session management, and MySQL database integration.

### Installation

1. **Clone the Repository**:

    ```bash
    git clone <repository-url>
    cd backend
    ```

2. **Install Dependencies**:

    ```bash
    npm install
    ```

### Usage

1. **Start the Server**:

    ```bash
    node index.js
    ```

2. **Run with Nodemon** (for development):

    ```bash
    npx nodemon index.js
    ```

### Dependencies

- `body-parser`: Middleware for parsing incoming request bodies.
- `cors`: Middleware for enabling Cross-Origin Resource Sharing.
- `express`: Web framework for Node.js.
- `express-session`: Session management middleware.
- `jsonwebtoken`: JSON Web Token implementation.
- `mysql2`: MySQL database client.

### Development Dependencies

- `autoprefixer`: PostCSS plugin to parse CSS and add vendor prefixes.
- `nodemon`: Utility that monitors for changes and restarts the server.
- `postcss`: Tool for transforming CSS with JavaScript plugins.
- `tailwindcss`: Utility-first CSS framework.

---

## Login App

### Description

The login-app is an Angular application that provides user login functionality and utilizes server-side rendering for improved performance and SEO.

### Installation

1. **Clone the Repository**:

    ```bash
    git clone <repository-url>
    cd login-app
    ```

2. **Install Dependencies**:

    ```bash
    npm install
    ```

### Usage

1. **Start the Development Server**:

    ```bash
    npm start
    ```

2. **Build the Application**:

    ```bash
    npm run build
    ```

3. **Serve the Application with SSR**:

    ```bash
    npm run serve:ssr:login-app
    ```

### Dependencies

- `@angular/*`: Core Angular libraries and modules.
- `ag-grid-angular`: Angular component for AG Grid.
- `express`: Web framework for Node.js.
- `ngx-cookie-service`: Service for handling cookies.

### Development Dependencies

- `@angular-devkit/build-angular`: Tools for building Angular applications.
- `@angular/cli`: Command-line interface for Angular.
- `@angular/compiler-cli`: Angular compiler CLI.
- `@types/express`: TypeScript types for Express.
- `typescript`: TypeScript language support.
- `autoprefixer`, `postcss`, `tailwindcss`: Tools for CSS processing and styling.
- `jasmine-core`, `karma`, `karma-chrome-launcher`, `karma-coverage`, `karma-jasmine`, `karma-jasmine-html-reporter`: Tools for Angular testing.

---

## Contributing

Contributions are welcome! Please follow the guidelines below:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a new Pull Request.

---

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

---

## Contact

For any inquiries or issues, please contact [your-email@example.com](mailto:your-email@example.com).
