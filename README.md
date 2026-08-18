# Metronic 9 | All-in-One Tailwind based HTML/React/Next.js Template for Modern Web Applications

## Getting Started

Refer to the [Metronic Vite Documentation](https://docs.keenthemes.com/metronic-react)
for comprehensive guidance on setting up and getting started your project with Metronic.

## ReUI Components

Metronic now leverages [ReUI](https://reui.io), our open-source React component library.

Star the [ReUI on GitHub](https://github.com/keenthemes/reui) to help us grow the project and stay updated on new features!

## Login with Supabase Auth

This project uses Supabase for authentication. Follow these steps to set up and test the login functionality:

### Prerequisites

- Node.js 16.x or higher
- Npm or Yarn
- Tailwind CSS 4.x
- React 19.x
- A Supabase account and project

### Installation

To set up the project dependencies, including those required for React 19, use the `--force` flag to resolve any dependency conflicts:

Execute:

```bash
npm install --force
```

### Environment Setup

1. Make sure your `.env` file is configured with Supabase credentials:

```

VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-for-admin-functions

```

### Creating a Demo User

For testing purposes, you can create a demo user with:

```bash
npm run create-demo-user
```

This will create a user with the following credentials:

- Email: demo@kt.com
- Password: demo123

### Login Features

The login implementation includes:

- Email/Password authentication
- Google OAuth integration
- Password reset flow
- Error handling
- Token management
- Protected routes

### Setting Up the Demo Layout

Follow the [Metronic Vite Documentation](https://docs.keenthemes.com/metronic-vite/guides/layouts) to configure and use the demo layout of your choice.

### Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` to access the application.

## Docker

### Prerequisites

- Docker
- Docker Compose

### Environment Setup

Copy the example environment file for each environment:

```bash
cp .env.example .env.dev
cp .env.example .env.uat
cp .env.example .env.prod
```

Edit each file with the appropriate values for `VITE_API_BASE_URL`.

### Development

```bash
docker-compose up
```

Access: http://localhost:5173

Hot-reload is enabled - changes in `src/` are reflected automatically.

### UAT

```bash
docker-compose -f docker-compose.uat.yml up
```

Access: http://localhost:8080

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Access: http://localhost:80

### Useful Commands

```bash
# Rebuild after package.json changes
docker-compose up --build

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Clean rebuild
docker-compose down -v && docker-compose up --build
```

### Testing Login

You can test login using:

1. The demo account credentials
2. Register a new account (when implemented)
3. Google Sign-in (requires proper OAuth setup in Supabase)

### Reporting Issues

If you encounter any issues or have suggestions for improvement, please contact us at [support@keenthemes.com](mailto:support@keenthemes.com).
Include a detailed description of the issue or suggestion, and we will work to address it in the next stable release.
