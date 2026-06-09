```text
___.   .__              .___              
\_ |__ |__|           __| _/____   _____  
 | __ \|  |  ______  / __ |/  _ \ /     \ 
 | \_\ \  | /_____/ / /_/ (  <_> )  Y Y  \
 |___  /__|         \____ |\____/|__|_|  /
     \/                  \/            \/ 
```

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="NextJS" />
  <img src="https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="React Query" />
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="ChartJS" />
</div>

## 📑 Table of Contents
- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License / Copyright](#license--copyright)

## 🚀 About The Project

**bi-dom-frontend** is the modern data visualization and management dashboard for the BI-DOM architecture. Built to handle complex Business Intelligence interactions, it transforms raw data models into highly interactive, insightful, and beautifully animated charts and tables. Leveraging the cutting-edge Next.js 16 App Router alongside React 19, this frontend client is highly optimized for performance, scalability, and ease of use.

By utilizing `@tanstack/react-query` for meticulous state management and data caching alongside `chart.js` for rendering complex data points, the application handles large datasets seamlessly. With a fully integrated `framer-motion` animation system and utility-first Tailwind CSS styling, this project provides a premium enterprise-level user experience from login to data exploration.

## ✨ Key Features
- **Data Visualization Mastery**: Interactive, responsive charting capabilities powered by `react-chartjs-2` and `chart.js`.
- **Advanced State & Caching**: Efficient API request handling, caching, and background synchronization via `@tanstack/react-query`.
- **Fluid User Experience**: Smooth component transitions and non-blocking interactions utilizing `framer-motion` and `sonner` for beautiful toast notifications.
- **Modern Architecture**: Full utilization of the Next.js 16 environment, allowing for enhanced server-side rendering and static site generation protocols.
- **Secure Handling**: Robust middleware integration with secure local state handling utilizing `js-cookie`.

## 🛠 Tech Stack
- **Framework:** Next.js (16.x)
- **Library:** React (19.x)
- **Data Fetching:** Axios, TanStack React Query
- **Charts:** Chart.js, react-chartjs-2
- **Styling:** Tailwind CSS (v4)
- **Animations / UI:** Framer Motion, Lucide React, Sonner

## 📂 Project Structure
```text
bi-dom-frontend/
├── app/                  # Application routing and root page structures
├── components/           # Reusable graphical and layout components
├── hooks/                # Custom React hooks (including React Query bindings)
├── lib/                  # External integrations and utility handlers
├── types/                # TypeScript interface and type declarations
├── middleware.ts         # Authentication and request middleware
└── package.json          # Dependencies and runtime scripts
```

## 🏁 Getting Started

### Prerequisites
- **Node.js**: v18.x or newer
- **npm**: v9.x or newer

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/fredyyfajarr/bi-dom-frontend.git
   ```
2. Navigate into the frontend directory:
   ```bash
   cd bi-dom-frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure environment properties:
   ```bash
   cp .env.example .env
   ```
   *Make sure to link the application to your backend API via `.env` variables.*

## 💻 Usage

To start up the local Next.js development server:

```bash
npm run dev
```

The application dashboard will be accessible via `http://localhost:3000`. Hot Module Replacement (HMR) is fully supported during development. To deploy for production:

```bash
npm run build
npm run start
```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License / Copyright

Copyright &copy; 2026 Fredy Fajar Adi Putra. All Rights Reserved.
