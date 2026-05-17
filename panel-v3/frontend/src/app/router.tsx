import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';

// Lazy load modules
const InstancesIndex = React.lazy(() => import('./instances/index'));
const NodeIndex = React.lazy(() => import('./node/index'));
const UserIndex = React.lazy(() => import('./user/index'));
const RoleIndex = React.lazy(() => import('./role/index'));
const ThemeIndex = React.lazy(() => import('./theme/index'));
const TemplatesIndex = React.lazy(() => import('./templates/index'));
const TicketIndex = React.lazy(() => import('./ticket/index'));
const AuthIndex = React.lazy(() => import('./auth/index'));

const Placeholder = ({ name }: { name: string }) => (
  <div className="p-8 glass-dark rounded-3xl border border-white/5">
    <h1 className="text-2xl font-bold">{name} Module</h1>
    <p className="text-white/50">Standardizing core components...</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: '', element: <Navigate to="/instances" replace /> },
      {
        path: 'instances',
        children: [
          { path: '', element: <React.Suspense fallback={null}><InstancesIndex /></React.Suspense> }
        ]
      },
      {
        path: 'node',
        children: [
          { path: '', element: <React.Suspense fallback={null}><NodeIndex /></React.Suspense> },
          { path: 'create', element: <Placeholder name="Node Create" /> }
        ]
      },
      {
        path: 'user',
        children: [
          { path: '', element: <React.Suspense fallback={null}><UserIndex /></React.Suspense> },
          { path: 'create', element: <Placeholder name="User Create" /> }
        ]
      },
      {
        path: 'role',
        children: [
          { path: '', element: <React.Suspense fallback={null}><RoleIndex /></React.Suspense> },
          { path: 'create', element: <Placeholder name="Role Create" /> }
        ]
      },
      {
        path: 'theme',
        children: [
          { path: '', element: <React.Suspense fallback={null}><ThemeIndex /></React.Suspense> }
        ]
      },
      {
        path: 'templates',
        children: [
          { path: '', element: <React.Suspense fallback={null}><TemplatesIndex /></React.Suspense> },
          { path: 'create', element: <Placeholder name="Template Create" /> }
        ]
      },
      {
        path: 'ticket',
        children: [
          { path: '', element: <React.Suspense fallback={null}><TicketIndex /></React.Suspense> },
          { path: 'create', element: <Placeholder name="Ticket Create" /> },
          { path: 'chat', element: <Placeholder name="Ticket Chat" /> }
        ]
      },
      { path: 'settings', element: <Placeholder name="Settings" /> },
      { path: 'notifications', element: <Placeholder name="Notifications" /> }
    ]
  },
  { path: '/auth', element: <React.Suspense fallback={null}><AuthIndex /></React.Suspense> },
  { path: '/unauthorized', element: <Placeholder name="Unauthorized" /> }
]);
