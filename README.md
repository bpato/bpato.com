[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# 🌐 Personal Website — Astro + TailwindCSS + Headless WordPress

A fast, modern, and fully responsive personal website built using **Astro** and **TailwindCSS** on the frontend, and powered by a **headless WordPress** backend via **GraphQL API**.

![Project landing image](https://github.com/bpato/bpato.com/blob/master/public/images/projects/1_website.png?raw=true)

## 🚀 Features

- ⚡️ Built with **Astro** for optimal performance and modern development.
- 🎨 Styled with **TailwindCSS**.
- ✍️ Dynamic content powered by **WordPress (headless)**.
- 🔌 Fetches data using **GraphQL**.
- 🧩 Modular and maintainable structure.
- 📱 Fully responsive design.

## 🛠️ Technologies Used

[![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=fff)](#)
[![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](#)
[![GraphQL](https://camo.githubusercontent.com/c8f5e2858227939492f1d491065f3d2c32c97440745a7f219b2183de345e5a6d/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6772617068716c2d4531303039382e7376673f6c6f676f3d6772617068716c266c6f676f436f6c6f723d7768697465)](#)
[![WordPress](https://img.shields.io/badge/WordPress-%2321759B.svg?logo=wordpress&logoColor=white)](#)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](#)

- **Frontend**: Astro, TailwindCSS
- **Backend**: WordPress (headless)
- **Data Layer**: GraphQL API (via WPGraphQL plugin)
- **Deployment**: Github Actions

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/bpato/bpato.com.git
cd bpato.com
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following:

```env
WP_DOMAIN=https://yourwordpressdomain.com/

# Optional
WP_API_CUSTOM=graphql
```

> Ensure WPGraphQL plugin is active in your WordPress install.

### 4. Run the development server

```bash
npm run dev
```

Open `http://localhost:4321` to see the site in action.

## 🧪 GraphQL Queries

This project uses GraphQL to fetch dynamic content such as:

- Posts
- Pages

You can explore and test queries using the built-in WPGraphQL GraphiQL IDE at:

```
https://yourwordpressdomain.com/graphql
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).
