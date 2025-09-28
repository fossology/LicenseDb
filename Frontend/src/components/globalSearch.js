// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2024 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React, { useState } from 'react';
import { ImSearch } from 'react-icons/im';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { GoPlusCircle } from 'react-icons/go';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import { searchLicenseByShortname } from '../api/api';

function GlobalSearch({ response }) {
	const [query, setQuery] = useState('');

	const handleSearch = () => {
		if (query.trim() === '') {
			response(null); // Notify the parent to reset the table to default
			return;
		}

		const licenseData = {
			field: 'shortname',
			search: 'fuzzy',
			search_term: query,
		};

		mutation.mutate({ queryPayload: licenseData }); // Trigger search function with the entered query
	};

	const handleKeyPress = e => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	const mutation = useMutation({
		mutationFn: searchLicenseByShortname,
		onError: error => {
			toast.error(`Search failed: ${error.response.data.error}`, {
				position: 'top-right',
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'dark',
			});
		},
		onSuccess: data => {
			response(data);
		},
	});

	return (
		<div className="table-header my-2">
			<Link to="/license/create">
				<Button variant="primary">
					<GoPlusCircle className="me-1 mb-1" />
					Create License
				</Button>
			</Link>
			<div className="search-container">
				<div className="search-icon" onClick={handleSearch}>
					<ImSearch />
				</div>
				<div className="search-input-wrapper">
					<input
						type="text"
						placeholder="Enter short name"
						className="search-input"
						value={query}
						onChange={e => setQuery(e.target.value)}
						onKeyDown={handleKeyPress}
					/>
				</div>
			</div>
		</div>
	);
}

GlobalSearch.propTypes = {
	response: PropTypes.func.isRequired,
};

export default GlobalSearch;
