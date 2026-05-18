import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';

// Lazy load modules
const InstancesIndex = React.lazy(() => import('./instances/index'));
const InstancesCreate = React.lazy(() => import('./instances/create'));
const InstancesEdit = React.lazy(() => import('./instances/edit'));

const NodeIndex = React.lazy(() => import('./node/index'));
const NodeCreate = React.lazy(() => import('./node/create'));
const NodeEdit = React.lazy(() => import('./node/edit'));

const UserIndex = React.lazy(() => import('./user/index'));
const UserCreate = React.lazy(() => import('./user/create'));
const UserEdit = React.lazy(() => import('./user/edit'));

const RoleIndex = React.lazy(() => import('./role/index'));
const RoleCreate = React.lazy(() => import('./role/create'));
const RoleEdit = React.lazy(() => import('./role/edit'));

const ThemeIndex = React.lazy(() => import('./theme/index'));
const ThemeCreate = React.lazy(() => import('./theme/create'));
const ThemeEdit = React.lazy(() => import('./theme/edit'));

const DatabaseIndex = React.lazy(() => import('./database/index'));

const TemplatesIndex = React.lazy(() => import('./templates/index'));
const TemplatesCreate = React.lazy(() => import('./templates/create'));
const TemplatesEdit = React.lazy(() => import('./templates/edit'));

const TicketIndex = React.lazy(() => import('./ticket/index'));
const TicketCreate = React.lazy(() => import('./ticket/create'));
const TicketChat = React.lazy(() => import('./ticket/chat'));
const NotificationsIndex = React.lazy(() => import('./notifications/index'));
const NotificationsSent = React.lazy(() => import('./notifications/sent'));
const AuthIndex = React.lazy(() => import('./auth/index'));
const AccountIndex = React.lazy(() => import('./account/index'));

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
          { path: '', element: <React.Suspense fallback={null}><InstancesIndex /></React.Suspense> },
          { path: 'create', element: <React.Suspense fallback={null}><InstancesCreate /></React.Suspense> },
          { path: 'edit/:id', element: <React.Suspense fallback={null}><InstancesEdit /></React.Suspense> }
        ]
      },
      {
        path: 'node',
        children: [
          { path: '', element: <React.Suspense fallback={null}><NodeIndex /></React.Suspense> },
          { path: 'create', element: <React.Suspense fallback={null}><NodeCreate /></React.Suspense> },
          { path: 'edit/:id', element: <React.Suspense fallback={null}><NodeEdit /></React.Suspense> }
        ]
      },
      {
        path: 'user',
        children: [
          { path: '', element: <React.Suspense fallback={null}><UserIndex /></React.Suspense> },
          { path: 'create', element: <React.Suspense fallback={null}><UserCreate /></React.Suspense> },
          { path: 'edit/:id', element: <React.Suspense fallback={null}><UserEdit /></React.Suspense> }
        ]
      },
      {
        path: 'role',
        children: [
          { path: '', element: <React.Suspense fallback={null}><RoleIndex /></React.Suspense> },
          { path: 'create', element: <React.Suspense fallback={null}><RoleCreate /></React.Suspense> },
          { path: 'edit/:id', element: <React.Suspense fallback={null}><RoleEdit /></React.Suspense> }
        ]
      },
      {
        path: 'theme',
        children: [
          { path: '', element: <React.Suspense fallback={null}><ThemeIndex /></React.Suspense> },
          { path: 'create', element: <React.Suspense fallback={null}><ThemeCreate /></React.Suspense> },
          { path: 'edit/:id', element: <React.Suspense fallback={null}><ThemeEdit /></React.Suspense> }
        ]
      },
      { path: 'database', element: <React.Suspense fallback={null}><DatabaseIndex /></React.Suspense> },
      {
        path: 'templates',
        children: [
          { path: '', element: <React.Suspense fallback={null}><TemplatesIndex /></React.Suspense> },
          { path: 'create', element: <React.Suspense fallback={null}><TemplatesCreate /></React.Suspense> },
          { path: 'edit/:id', element: <React.Suspense fallback={null}><TemplatesEdit /></React.Suspense> }
        ]
      },
      {
        path: 'ticket',
        children: [
          { path: '', element: <React.Suspense fallback={null}><TicketIndex /></React.Suspense> },
          { path: 'create', element: <React.Suspense fallback={null}><TicketCreate /></React.Suspense> },
          { path: 'chat/:id', element: <React.Suspense fallback={null}><TicketChat /></React.Suspense> }
        ]
      },
      { path: 'settings', element: <Placeholder name="Settings" /> },
      {
        path: 'notifications',
        children: [
          { path: '', element: <React.Suspense fallback={null}><NotificationsIndex /></React.Suspense> },
          { path: 'sent', element: <React.Suspense fallback={null}><NotificationsSent /></React.Suspense> }
        ]
      },
      { path: 'account', element: <React.Suspense fallback={null}><AccountIndex /></React.Suspense> }
    ]
  },
  { path: '/auth', element: <React.Suspense fallback={null}><AuthIndex /></React.Suspense> },
  { path: '/unauthorized', element: <Placeholder name="Unauthorized" /> }
]);
