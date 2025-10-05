// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React, { useState, useEffect, useRef } from 'react';
import { FcAdvertising } from 'react-icons/fc';
import '../styles/dashboard.css';
import Select from 'react-select';
import { TfiTime } from 'react-icons/tfi';
import { BiLoaderCircle } from 'react-icons/bi';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import Button from 'react-bootstrap/Button';
import Spinner from './spinner';
import { fetchAudits } from '../api/api';
import DiffModal from './auditDiffModal';

const DEFAULT_PER_PAGE = 10;
const DEFAULT_PAGE = 1;

function Log() {
	const [selectedType, setSelectedType] = useState('all');
	const [logsToShow, setLogsToShow] = useState([]);
	const [filteredLogs, setFilteredLogs] = useState([]);
	const pageSize = 10;
	const [showLoadMore, setShowLoadMore] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [page, setPage] = useState(DEFAULT_PAGE);
	const [selectedAudit, setSelectedAudit] = useState({
		auditId: null,
		auditType: '',
	});
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { data, isFetching } = useQuery({
		queryKey: ['audits', page, DEFAULT_PER_PAGE],
		queryFn: () => fetchAudits({ page, limit: pageSize }),
		placeholderData: keepPreviousData,
		staleTime: 300000, // 5 minutes
		cacheTime: 900000, // 15 minutes
		refetchOnWindowFocus: false,
		enabled: !isLoading, // Only fetch if not already loading
	});

	// filter log data
	const typeFilterOptions = [
		{ value: 'all', label: 'All Types' },
		{ value: 'License', label: 'License' },
		{ value: 'Obligation', label: 'Obligation' },
	];

	const handleScroll = () => {
		if (logsContainerRef.current) {
			const { scrollTop, clientHeight, scrollHeight } =
				logsContainerRef.current;
			if (scrollTop + clientHeight >= scrollHeight - 20 && !isLoading) {
				if (data.length > 0) {
					// calls only when data is available from API
					setPage(prevPage => prevPage + 1); // Increment page for the next API call
				}

				// removes the scroll event when no data to show
				// logsContainerRef.current?.removeEventListener("scroll", handleScroll)
			}
		}
	};

	const logsContainerRef = useRef(null);

	// Load logs when data changes
	useEffect(() => {
		if (data && !isFetching) {
			setLogsToShow(prevLogs => [...prevLogs, ...data]);
			setFilteredLogs(prevLogs => [...prevLogs, ...data]);
			setIsLoading(false);
		}
	}, [data]);

	// Attach and detach scroll event listener
	useEffect(() => {
		const container = logsContainerRef.current;
		if (container) {
			container.addEventListener('scroll', handleScroll);
		}
		return () => {
			container?.removeEventListener('scroll', handleScroll);
		};
	}, [logsToShow, isLoading, page]);

	const handleLoadMore = () => {
		// Execute only if the "Load More" button is visible and not in a loading state
		if (showLoadMore === true && !isLoading) {
			setIsLoading(true);
			setShowLoadMore(false);
			setTimeout(() => {
				setIsLoading(false);
			}, 500);

			logsContainerRef.current?.addEventListener('scroll', handleScroll);
		}
	};

	const handleTypeFilterChange = selectedOption => {
		setSelectedType(selectedOption.value);
		if (selectedOption.value === 'all') {
			setFilteredLogs(logsToShow);
		} else {
			setFilteredLogs(
				logsToShow.filter(
					log =>
						log.type.toLowerCase() ===
						selectedOption.value.toLowerCase(),
				),
			);
		}
	};

	const handleLogClick = log => {
		setSelectedAudit({ auditId: log.id, auditType: log.type, audit: log });
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedAudit(null);
	};

	return (
		<div className="logs shadow-sm p-3" ref={logsContainerRef}>
			<div className="d-flex justify-content-between align-items-center">
				<h5 className="fw-bold mb-3">Recent Changes</h5>
				<Select
					options={typeFilterOptions}
					value={typeFilterOptions.find(
						option => option.value === selectedType,
					)}
					onChange={handleTypeFilterChange}
				/>
			</div>
			{filteredLogs.map((log, index) => (
				<div
					className="single-log d-flex justify-content-between align-items-center p-3"
					key={index}
					onClick={() => handleLogClick(log)}
				>
					<span className="log-icon">
						<FcAdvertising />
					</span>
					<div className="flex-grow-1">
						<h6 className="fw-bold">{log.user?.display_name}</h6>
						<p className="m-0">
							made changes for <b>{log.type}:</b>
							{log.type.toLowerCase() === 'license' && (
								<span>&nbsp;{log.entity?.shortname}</span>
							)}
							{log.type.toLowerCase() === 'obligation' && (
								<span>&nbsp;{log.entity?.topic}</span>
							)}
							{log.type.toLowerCase() === 'classification' && (
								<span>&nbsp;{log.entity?.classification}</span>
							)}
							{log.type.toLowerCase() === 'type' && (
								<span>&nbsp;{log.entity?.type}</span>
							)}
						</p>
					</div>
					<p>
						{' '}
						<span className="time-icon">
							<TfiTime />
						</span>{' '}
						{formatDate(log.timestamp)}
					</p>
				</div>
			))}
			{isLoading && (
				<div style={{ textAlign: 'center' }}>
					<Spinner />
				</div>
			)}{' '}
			{showLoadMore && (
				<div style={{ textAlign: 'center' }}>
					<Button type="primary" onClick={handleLoadMore}>
						<BiLoaderCircle className="me-1" />
						Load More
					</Button>
				</div>
			)}
			<DiffModal
				show={isModalOpen}
				handleClose={closeModal}
				audit={selectedAudit}
			/>
		</div>
	);
}

// Function to format the date from timestamp
function formatDate(timestamp) {
	const date = new Date(timestamp);
	const formattedDate = date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
	const formattedTime = date.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
	});
	return `${formattedDate} ${formattedTime}`;
}

export default Log;
