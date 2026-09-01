// src/routing/auth-routing.tsx

import { BrandedLayout } from '@/features/auth/layouts/branded';
import { LoginPage } from '@/pages/LoginPage';
import RequestResetPasswordPage from '@/pages/RequestResetPasswordPage';
import type { RouteObject } from 'react-router-dom';

export const authRoutes: RouteObject[] = [
  {
    path: '',
    element: <BrandedLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      {
        path: 'reset-password/request',
        element: <RequestResetPasswordPage />,
      },
    ],
  },
];
