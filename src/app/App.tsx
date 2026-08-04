import { RouterProvider } from 'react-router';

import { AdminAuthProvider } from '@/features/admin/hooks/AdminAuthProvider';

import { router } from './routes';

export const App = () => (
  <AdminAuthProvider>
    <RouterProvider router={router} />
  </AdminAuthProvider>
);
