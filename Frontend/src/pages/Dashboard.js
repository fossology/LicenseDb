// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import { TbLicense } from 'react-icons/tb';
import { MdGroupAdd, MdOutlineAssignmentTurnedIn } from 'react-icons/md';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import CardWithLogo from '../components/cardWithLogo';
import PieChart from '../components/pieChart';
import Log from '../components/log';
import '../styles/dashboard.css';
import { fetchDashboardData } from '../api/api';

function Dashboard() {
	const { data: dashboardData } = useQuery({
		queryKey: ['dashboard'],
		queryFn: () => fetchDashboardData(),
		placeholderData: keepPreviousData,
	});

	return (
		<div className="mt-4 content">
			<div className="row">
				<div className="col-12 col-md-6 col-xl-3 mb-2">
					<CardWithLogo
						icon={<TbLicense color="#31c76c" size={40} />}
						subText={dashboardData?.data?.licenses_count}
						mainText="Licenses"
						routeName={'/license'}
					/>
				</div>
				<div className="col-12 col-md-6 col-xl-3 mb-2">
					<CardWithLogo
						icon={
							<MdOutlineAssignmentTurnedIn
								color="rgb(219 136 104)"
								size={40}
							/>
						}
						subText={dashboardData?.data?.obligations_count}
						mainText="Obligations"
						routeName={'/obligation'}
					/>
				</div>
				<div className="col-12 col-md-6 col-xl-3 mb-2">
					<CardWithLogo
						icon={<MdGroupAdd color="rgb(49 171 199)" size={40} />}
						subText={dashboardData?.data?.users_count}
						mainText="Users"
						routeName={'/user'}
					/>
				</div>
				<div className="col-12 col-md-6 col-xl-3 mb-2">
					<CardWithLogo
						icon={<TbLicense color="rgb(235 220 36)" size={40} />}
						subText={
							dashboardData?.data?.monthly_license_changes_count
						}
						mainText="New License changes (last month)"
						routeName={'/license'}
					/>
				</div>
			</div>
			<div className="row log-pie">
				<div className="col-12 col-md-7">
					<Log />
				</div>
				<div className="col-12 col-md-5 pie-chart-container">
					<PieChart
						chartData={dashboardData?.data?.risk_license_frequency}
					/>
				</div>
			</div>
		</div>
	);
}

export default Dashboard;
