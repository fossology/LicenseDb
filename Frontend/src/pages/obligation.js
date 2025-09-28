// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import { useState } from 'react';
import DataTable from 'react-data-table-component';
import '../styles/obligation.css';
import { FcSearch } from 'react-icons/fc';
import { Link } from 'react-router-dom';
import { GoPlusCircle } from 'react-icons/go';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import Button from 'react-bootstrap/Button';
import ToolTipTruncate from '../components/tooltipWithTruncate';
import { fetchObligations } from '../api/api';
import ObligationDetailForm from './obligationDetailForm';
import CustomColorCell from '../components/CustomColorCell';
import '../styles/dataTable.css';
import '../styles/globalSearch.css';
import SortableColumnHeader from '../components/SortableColumnHeader';
import { GetTokenSync } from '../contexts/AuthContext';

const DEFAULT_PER_PAGE = 10;
const DEFAULT_PAGE = 1;

const TableHeader = () => {
	return (
		<div className="table-header my-2">
			<Link to="/obligation/create">
				<Button variant="primary">
					<GoPlusCircle className="me-1 mb-1" />
					Create Obligation
				</Button>
			</Link>
			<div className="search-container">
				<div className="search-icon">
					<FcSearch />
				</div>
				<input
					type="text"
					placeholder="Search"
					className="search-input"
				/>
			</div>
		</div>
	);
};

function Obligation() {
	const [page, setPage] = useState(DEFAULT_PAGE);
	const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
	const [obligationPayload, setObligationPayload] = useState(null);
	const [sortOrder, setSortOrder] = useState('asc');
	const isLoggedIn = GetTokenSync() !== null;

	const { isPending, isError, error, data, isPreviousData } = useQuery({
		queryKey: ['obligations', page, perPage, sortOrder],
		queryFn: () => fetchObligations({ page, limit: perPage, sortOrder }),
		placeholderData: keepPreviousData,
	});

	const handleColumnClick = sortOrder => {
		setSortOrder(sortOrder);
	};

	const columns = [
		{
			name: 'Type',
			maxWidth: '15%',
			selector: row => row.type,
			wrap: true,
		},
		{
			name: (
				<SortableColumnHeader
					columnName="Obligation/Risk Topic"
					handleColumnClick={handleColumnClick}
					sortOrder={sortOrder}
				/>
			),
			maxWidth: '20%',
			selector: row => row.topic,
			wrap: true,
		},
		{
			name: 'Full Text',
			wrap: true,
			maxWidth: '30%',
			style: {
				textAlign: 'left',
			},
			cell: row => <ToolTipTruncate text={row.text ?? ''} />,
		},
		{
			name: 'Associated Licenses',
			wrap: true,
			maxWidth: '25%',
			cell: row => (
				<ToolTipTruncate
					text={row.shortnames ? row.shortnames.join(', ') : ''}
				/>
			),
		},
		{
			name: 'Classification',
			wrap: true,
			maxWidth: '10%',
			cell: row => <CustomColorCell color={row.classification} />,
		},
	];

	const handlePageChange = page => {
		setPage(page);
	};

	const handleRowsChange = newPerPage => {
		setPerPage(newPerPage);
	};

	const handleRowClicked = row => {
		if (obligationPayload && obligationPayload.topic === row.topic) {
			setObligationPayload(null);
		} else {
			setObligationPayload(row);
		}
	};

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
							fixedHeader
							columns={columns}
							data={data.data}
							progressPending={isPreviousData}
							pagination
							paginationServer
							paginationTotalRows={
								data.paginationmeta.resource_count
							}
							striped
							highlightOnHover
							pointerOnHover
							onChangeRowsPerPage={handleRowsChange}
							subHeader={isLoggedIn}
							onRowClicked={handleRowClicked}
							onChangePage={handlePageChange}
							subHeaderComponent={<TableHeader />}
						/>
					</div>
					{obligationPayload && isLoggedIn && (
						<ObligationDetailForm
							obligationPayload={obligationPayload}
							setObligationPayload={setObligationPayload}
							page={page}
							perPage={perPage}
							sortOrder={sortOrder}
						/>
					)}
				</div>
			)}
		</div>
	);
}

export default Obligation;
