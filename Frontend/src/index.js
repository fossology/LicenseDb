// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Dashboard from './pages/Dashboard';
import License from './pages/license';
import User from './pages/user';
import Obligation from './pages/obligation';
import Signin from './pages/signin';
import CreateLicense from './pages/createLicense';
import CreateObligation from './pages/createObligation';
import CreateUser from './pages/createUser';
import Operation from './pages/operations';
import ObligationSettings from './pages/settings/obligationSettings';
import { AuthProvider } from './contexts/AuthContext';
import OAuthRedirect from './pages/oAuthRedirect';
import ProtectedRoute from './components/protectedRoute';
import Forbidden from './components/forbidden';
import NotFound from './components/NotFound';
import MainLayout from './components/MainLayout';

const router = createBrowserRouter(
	[
		{
			path: '/',
			element: <App />,
			children: [
				{
					path: '',
					element: (
						<MainLayout>
							<ProtectedRoute
								access={['ADMIN', 'SUPER_ADMIN', 'USER']}
							>
								<Dashboard />
							</ProtectedRoute>
						</MainLayout>
					),
				},
				{
					path: 'user',
					element: (
						<MainLayout>
							<ProtectedRoute access={['ADMIN', 'SUPER_ADMIN']}>
								<User />
							</ProtectedRoute>
						</MainLayout>
					),
				},
				{
					path: 'obligation',
					element: (
						<MainLayout>
							<ProtectedRoute
								access={['ADMIN', 'SUPER_ADMIN', 'USER']}
							>
								<Obligation />
							</ProtectedRoute>
						</MainLayout>
					),
				},
				{
					path: 'operation',
					element: (
						<MainLayout>
							<ProtectedRoute access={['ADMIN', 'SUPER_ADMIN']}>
								<Operation />
							</ProtectedRoute>
						</MainLayout>
					),
				},
				{
					path: 'license',
					element: (
						<MainLayout>
							<ProtectedRoute
								access={['ADMIN', 'SUPER_ADMIN', 'USER']}
							>
								<License />
							</ProtectedRoute>
						</MainLayout>
					),
				},
				{
					path: 'license/create',
					element: (
						<MainLayout>
							<ProtectedRoute
								access={['ADMIN', 'SUPER_ADMIN', 'USER']}
							>
								<CreateLicense />
							</ProtectedRoute>
						</MainLayout>
					),
				},
				{
					path: 'obligation/create',
					element: (
						<MainLayout>
							<ProtectedRoute
								access={['ADMIN', 'SUPER_ADMIN', 'USER']}
							>
								<CreateObligation />
							</ProtectedRoute>
						</MainLayout>
					),
				},
				{
					path: 'user/create',
					element: (
						<MainLayout>
							<ProtectedRoute access={['ADMIN', 'SUPER_ADMIN']}>
								<CreateUser />
							</ProtectedRoute>
						</MainLayout>
					),
				},
				{
					path: 'obligation/settings',
					element: (
						<MainLayout>
							<ProtectedRoute access={['ADMIN', 'SUPER_ADMIN']}>
								<ObligationSettings />
							</ProtectedRoute>
						</MainLayout>
					),
				},
				{
					path: '/signin',
					element: <Signin />,
				},
				{
					path: '/redirect',
					element: <OAuthRedirect />,
				},
				{
					path: '/forbidden',
					element: <Forbidden />,
				},
				{
					path: '*',
					element: <NotFound />,
				},
			],
		},
	],
	{
		basename: `/${process.env.REACT_APP_DOMAIN_SUBDIRECTORY}`,
	},
);

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<AuthProvider>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</AuthProvider>
	</React.StrictMode>,
);
