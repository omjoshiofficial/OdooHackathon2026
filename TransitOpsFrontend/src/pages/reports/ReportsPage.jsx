import { useEffect, useState } from 'react';
import { Download, FileText, TrendingUp, Activity, IndianRupee, Fuel } from 'lucide-react';
import { toast } from 'react-toastify';
import { dashboardApi } from '../../api/dashboardApi';
import { expenseApi } from '../../api/expenseApi';
import { fuelApi } from '../../api/fuelApi';
import { tripApi } from '../../api/tripApi';
import { RevenueAreaChart, TripBarChart, CostLineChart, FleetPieChart } from '../../components/charts/DashboardCharts';
import StatCard from '../../components/cards/StatCard';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { SkeletonCard } from '../../components/common/Loader';
import { formatCurrency } from '../../utils';

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getChartData(),
      expenseApi.getExpenses(),
      fuelApi.getFuelLogs(),
      tripApi.getTrips(),
    ])
      .then(([stats, charts, expenses, fuel, trips]) => {
        const completedTrips = trips.data.filter((t) => t.status === 'Completed');
        const totalRevenue = completedTrips.reduce((s, t) => s + t.revenue, 0);
        const totalFuel = fuel.data.reduce((s, f) => s + f.totalCost, 0);
        const totalExpenses = expenses.data.reduce((s, e) => s + Number(e.amount), 0);
        const totalDistance = completedTrips.reduce((s, t) => s + t.plannedDistance, 0);
        const totalLiters = fuel.data.reduce((s, f) => s + f.liters, 0);
        const fuelEfficiency = totalLiters > 0 ? (totalDistance / totalLiters).toFixed(2) : 0;
        const roi = totalRevenue > 0 ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1) : 0;

        setData({
          stats: stats.data,
          charts: charts.data,
          kpis: { totalRevenue, totalFuel, totalExpenses, fuelEfficiency, roi, completedTrips: completedTrips.length },
        });
      })
      .catch(() => toast.error('Failed to load reports.'))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => toast.info('CSV export will be available with the .NET API integration.');
  const handleExportPDF = () => toast.info('PDF export will be available with the .NET API integration.');

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Fleet performance insights"
        breadcrumbs={[{ label: 'Reports' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Download} onClick={handleExportCSV} size="sm">Export CSV</Button>
            <Button variant="secondary" icon={FileText} onClick={handleExportPDF} size="sm">Export PDF</Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(data.kpis.totalRevenue)} icon={IndianRupee} color="green" />
        <StatCard title="Fuel Cost" value={formatCurrency(data.kpis.totalFuel)} icon={Fuel} color="yellow" />
        <StatCard title="Total Expenses" value={formatCurrency(data.kpis.totalExpenses)} icon={IndianRupee} color="red" />
        <StatCard title="Fuel Efficiency" value={`${data.kpis.fuelEfficiency} km/L`} icon={TrendingUp} color="blue" />
        <StatCard title="Fleet Utilization" value={`${data.stats.fleetUtilization}%`} icon={Activity} color="indigo" />
        <StatCard title="Vehicle ROI" value={`${data.kpis.roi}%`} icon={TrendingUp} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Revenue vs Fuel Cost</h3>
          <RevenueAreaChart data={data.charts.monthly} />
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Monthly Trips</h3>
          <TripBarChart data={data.charts.monthly} />
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Cost Breakdown</h3>
          <CostLineChart data={data.charts.monthly} />
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Fleet Status Distribution</h3>
          <FleetPieChart data={data.charts.fleetUtilization} />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
