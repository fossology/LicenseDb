// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import React, { useEffect } from 'react';
import './App.css';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';
import { fetchApiAuthSettings } from './api/api';

function App() {
	const { data } = useQuery({
		queryKey: ['apiCollection'],
		queryFn: () => fetchApiAuthSettings(),
	});

	useEffect(() => {
		if (data) {
			sessionStorage.setItem(
				'licensedb.authSettings',
				JSON.stringify(data.data),
			);
		}
	}, [data]);

	return (
		<ErrorBoundary>
			<Outlet />
		</ErrorBoundary>
	);
}

export default App;
