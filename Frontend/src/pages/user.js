// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { GoPlusCircle } from 'react-icons/go';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import UserDetailForm from './userDetailForm';
import '../styles/dataTable.css';
import { fetchUsers } from '../api/api';

const DEFAULT_PER_PAGE = 10;
const DEFAULT_PAGE = 1;

function User() {
	const [userPayload, setUserPayload] = useState(null);
	const [page, setPage] = useState(DEFAULT_PAGE);
	const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

	const { isPending, isError, error, data, isPreviousData } = useQuery({
		queryKey: ['users', page, perPage],
		queryFn: () => fetchUsers({ page, limit: perPage }),
		placeholderData: keepPreviousData,
	});

	const handleRowsChange = newPerPage => {
		setPerPage(newPerPage);
	};

	const handleRowClicked = row => {
		if (userPayload && userPayload.user_name === row.user_name) {
			setUserPayload(null);
		} else {
			setUserPayload(row);
		}
	};

	const handlePageChange = page => {
		setPage(page);
	};

	const columns = [
		{
			name: 'User Name',
			selector: row => row.user_name ?? '',
			sortable: true,
			wrap: true,
		},
		{
			name: 'Display Name',
			selector: row => row.display_name ?? '',
			sortable: true,
			wrap: true,
		},
		{
			name: 'User Email',
			selector: row => row.user_email ?? '',
			sortable: true,
			wrap: true,
		},
		{
			name: 'Access Level',
			selector: row => row.user_level ?? '',
			sortable: true,
			wrap: true,
		},
	];

	return (
		<div className="content">
			{isPending ? (
				<div
					className="d-flex position-relative"
					style={{ height: '68vh' }}
				>
					<div
						className="z-1 position-absolute top-50 start-50 translate-middle border d-flex justify-content-center align-items-center shadow-sm"
						style={{
							backgroundColor: '#fff',
							height: '55px',
							width: '140px',
						}}
					>
						<div>Loading...</div>
					</div>
				</div>
			) : isError ? (
				<div
					className="d-flex justify-content-center align-items-center"
					style={{ height: '68vh' }}
				>
					<p>Something went wrong: {error.message}</p>
				</div>
			) : (
				<div>
					<div className="my-3 shadow-sm border position-relative">
						<DataTable
							paginationDefaultPage={page}
							fixedHeader
							columns={columns}
							data={data.data}
							progressPending={isPreviousData}
							pagination
							paginationTotalRows={
								data.paginationmeta.resource_count
							}
							striped
							highlightOnHover
							pointerOnHover
							onChangeRowsPerPage={handleRowsChange}
							onRowClicked={handleRowClicked}
							onChangePage={handlePageChange}
							subHeader
							paginationServer
							subHeaderComponent={
								<div className="table-header my-2">
									<Link to="/user/create">
										<Button
											variant={'primary'}
											icon={<GoPlusCircle />}
										>
											<GoPlusCircle className="me-1 mb-1" />
											Create User
										</Button>
									</Link>
								</div>
							}
						/>
					</div>
					{userPayload && (
						<UserDetailForm
							userPayload={userPayload}
							setUserPayload={setUserPayload}
							page={page}
							perPage={perPage}
						/>
					)}
				</div>
			)}
		</div>
	);
}

export default User;
