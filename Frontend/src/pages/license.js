// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import { useState, useCallback, useRef, useEffect } from 'react';
import '../styles/license.css';
import DataTable from 'react-data-table-component';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import LicenseDetailForm from '../components/licenseDetailForm';
import { fetchLicenses } from '../api/api';
import CustomColorCell from '../components/CustomColorCell';
import '../styles/dataTable.css';
import '../styles/globalSearch.css';
import SortableColumnHeader from '../components/SortableColumnHeader';
import { GetTokenSync } from '../contexts/AuthContext';
import GlobalSearch from '../components/globalSearch';

const DEFAULT_PER_PAGE = 10;
const DEFAULT_PAGE = 1;

function License() {
	const riskToColorMapping = new Map([
		[0, 'white'],
		[1, 'aqua'],
		[2, 'green'],
		[3, 'yellow'],
		[4, 'orange'],
		[5, 'red'],
	]);
	const [licensePayload, setLicensePayload] = useState(null);
	const [page, setPage] = useState(DEFAULT_PAGE);
	const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
	const [sortField, setSortField] = useState('spdx_id');
	const [sortOrder, setSortOrder] = useState('asc');
	const isLoggedIn = GetTokenSync() !== null;
	const [tableData, setTableData] = useState([]);
	const [paginationData, setPaginationData] = useState();
	const [isSearchActive, setIsSearchActive] = useState(false);
	const filterRef = useRef(null);

	const { isPending, isError, error, data, isPreviousData } = useQuery({
		queryKey: ['licenses', page, perPage, sortField, sortOrder],
		queryFn: () =>
			fetchLicenses({ page, limit: perPage, sortField, sortOrder }),
		enabled: !isSearchActive,
		placeholderData: keepPreviousData,
	});

	// Update table data when query data changes
	useEffect(() => {
		if (!isSearchActive && data?.data) {
			filterRef.current = data.data;
			setTableData(data.data);
			setPaginationData(data.paginationmeta.resource_count);
		}
	}, [data, isSearchActive]);

	const handleColumnClick = (sortField, sortOrder) => {
		setSortField(sortField);
		setSortOrder(sortOrder);
	};

	const columns = [
		{
			name: (
				<SortableColumnHeader
					columnName="SPDX Expression"
					columnKey="spdx_id"
					handleColumnClick={handleColumnClick}
					sortField={sortField}
					sortOrder={sortOrder}
				/>
			),
			maxWidth: '20%',
			selector: row => row.spdx_id ?? '',
			sortField: 'spdx_id',
		},
		{
			name: (
				<SortableColumnHeader
					columnName="Short Name"
					columnKey="shortname"
					handleColumnClick={handleColumnClick}
					sortField={sortField}
					sortOrder={sortOrder}
				/>
			),
			maxWidth: '20%',
			selector: row => row.shortname ?? '',
			sortField: 'shortname',
		},
		{
			name: (
				<SortableColumnHeader
					columnName="Full Name"
					columnKey="fullname"
					handleColumnClick={handleColumnClick}
					sortField={sortField}
					sortOrder={sortOrder}
				/>
			),
			maxWidth: '20%',
			selector: row => row.fullname ?? '',
			sortField: 'fullname',
		},
		{
			name: 'Text',
			maxWidth: '30%',
			cell: row => (
				<div className="license-text">
					<span>{row.text?.substr(0, 50) ?? ''}...&nbsp</span>
				</div>
			),
		},
		{
			name: 'Risk',
			maxWidth: '10%',
			wrap: true,
			cell: row => (
				<CustomColorCell
					color={riskToColorMapping.get(row.risk)}
					text={row.risk}
				/>
			),
		},
	];

	const handleRowsChange = newPerPage => {
		setPerPage(newPerPage);
		if (!isSearchActive) {
			setPage(1); // Reset to the first page
		}
	};

	const handleRowClicked = row => {
		if (licensePayload && licensePayload.shortname === row.shortname) {
			setLicensePayload(null);
		} else {
			setLicensePayload(row);
		}
	};

	const handlePageChange = page => {
		setPage(page);
	};

	const handleHeaderData = useCallback(searchData => {
		if (searchData?.data) {
			setIsSearchActive(true);
			filterRef.current = searchData.data;
			setTableData(searchData.data);
			setPaginationData(searchData.paginationmeta.resource_count);
		} else {
			resetToDefault();
		}
	}, []);

	// Reset to default mode when clearing search
	const resetToDefault = () => {
		setIsSearchActive(false);
		setPage(1); // Reset page to the first one
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
							paginationDefaultPage={page}
							fixedHeader
							columns={columns}
							data={tableData}
							progressPending={isPreviousData}
							pagination
							paginationServer={!isSearchActive}
							paginationTotalRows={paginationData}
							striped
							highlightOnHover
							pointerOnHover
							onChangeRowsPerPage={handleRowsChange}
							subHeader={isLoggedIn}
							onRowClicked={handleRowClicked}
							onChangePage={handlePageChange}
							subHeaderComponent={
								<GlobalSearch
									response={handleHeaderData}
									reset={resetToDefault}
								/>
							}
						/>
					</div>
					{licensePayload && isLoggedIn && (
						<LicenseDetailForm
							licensePayload={licensePayload}
							setLicensePayload={setLicensePayload}
							page={page}
							perPage={perPage}
							sortField={sortField}
							sortOrder={sortOrder}
						/>
					)}
				</div>
			)}
		</div>
	);
}

export default License;
