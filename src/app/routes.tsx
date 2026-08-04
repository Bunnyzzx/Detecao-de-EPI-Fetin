import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';

import { RouteFallback } from '@/components/feedback';
import { HomePage } from '@/pages/HomePage';
import { ResultPage } from '@/pages/ResultPage';
import { ScanPage } from '@/pages/ScanPage';

/**
 * O painel administrativo carrega sob demanda: só ele depende da biblioteca de
 * gráficos, que não faz sentido baixar no fluxo de quem apenas se verifica.
 */
const AdminLayout = lazy(() =>
  import('@/pages/admin/AdminLayout').then((module) => ({ default: module.AdminLayout })),
);
const AdminLoginPage = lazy(() =>
  import('@/pages/admin/AdminLoginPage').then((module) => ({ default: module.AdminLoginPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/admin/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const EpisPage = lazy(() =>
  import('@/pages/admin/EpisPage').then((module) => ({ default: module.EpisPage })),
);
const HistoryPage = lazy(() =>
  import('@/pages/admin/HistoryPage').then((module) => ({ default: module.HistoryPage })),
);
const UsersPage = lazy(() =>
  import('@/pages/admin/UsersPage').then((module) => ({ default: module.UsersPage })),
);

const withSuspense = (element: ReactNode): ReactNode => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/verificacao', element: <ScanPage /> },
  { path: '/resultado/:id', element: <ResultPage /> },
  { path: '/admin', element: withSuspense(<AdminLoginPage />) },
  {
    path: '/admin/painel',
    element: withSuspense(<AdminLayout />),
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'usuarios', element: withSuspense(<UsersPage />) },
      { path: 'epis', element: withSuspense(<EpisPage />) },
      { path: 'historico', element: withSuspense(<HistoryPage />) },
    ],
  },
  // Qualquer rota desconhecida devolve o terminal à tela inicial.
  { path: '*', element: <Navigate to="/" replace /> },
]);
