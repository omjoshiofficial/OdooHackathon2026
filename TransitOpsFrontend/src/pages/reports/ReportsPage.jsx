import { useEffect, useState } from 'react';
import { Download, FileText, TrendingUp, Activity, IndianRupee, Fuel } from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const [rawTrips, setRawTrips] = useState([]);
  const [rawFuel, setRawFuel] = useState([]);
  const [rawExpenses, setRawExpenses] = useState([]);
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
        setRawTrips(trips.data);
        setRawFuel(fuel.data);
        setRawExpenses(expenses.data);
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
      .catch((err) => { console.error(err); toast.error('Failed to load reports.'); })
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    const sections = [
      ['=== KPI SUMMARY ==='],
      ['Metric', 'Value'],
      ['Total Revenue', data.kpis.totalRevenue],
      ['Fuel Cost', data.kpis.totalFuel],
      ['Total Expenses', data.kpis.totalExpenses],
      ['Fuel Efficiency (km/L)', data.kpis.fuelEfficiency],
      ['Fleet Utilization (%)', data.stats?.fleetUtilization ?? 0],
      ['Vehicle ROI (%)', data.kpis.roi],
      ['Completed Trips', data.kpis.completedTrips],
      [],
      ['=== TRIPS ==='],
      ['ID', 'Source', 'Destination', 'Vehicle', 'Driver', 'Cargo (kg)', 'Distance (km)', 'Revenue', 'Status', 'Created At'],
      ...rawTrips.map((t) => [t.id, t.source, t.destination, t.vehicleId, t.driverId, t.cargoWeight, t.plannedDistance, t.revenue, t.status, t.createdAt]),
      [],
      ['=== FUEL LOGS ==='],
      ['ID', 'Vehicle', 'Date', 'Liters', 'Price/Liter', 'Total Cost', 'Vendor', 'Odometer'],
      ...rawFuel.map((f) => [f.id, f.vehicleId, f.date, f.liters, f.pricePerLiter, f.totalCost, f.vendor, f.odometer]),
      [],
      ['=== EXPENSES ==='],
      ['ID', 'Vehicle', 'Trip', 'Type', 'Amount', 'Description', 'Date'],
      ...rawExpenses.map((e) => [e.id, e.vehicleId, e.tripId ?? '—', e.type, e.amount, e.description, e.date]),
    ];

    const csv = sections.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TransitOps_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported.');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;

    const clean = (val) => String(val ?? '').replace(/[^\x00-\x7F]/g, '').trim();
    const money = (val) => `${Number(val ?? 0).toFixed(2)}`;

    doc.setFontSize(16).setFont('helvetica', 'bold');
    doc.text('TransitOps - Fleet Analytics Report', pageW / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(120);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageW / 2, y, { align: 'center' });
    doc.setTextColor(0);
    y += 8;

    doc.setFontSize(11).setFont('helvetica', 'bold');
    doc.text('KPI Summary', 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', money(data.kpis.totalRevenue)],
        ['Fuel Cost', money(data.kpis.totalFuel)],
        ['Total Expenses', money(data.kpis.totalExpenses)],
        ['Fuel Efficiency', `${data.kpis.fuelEfficiency} km/L`],
        ['Fleet Utilization', `${data.stats?.fleetUtilization ?? 0}%`],
        ['Vehicle ROI', `${data.kpis.roi}%`],
        ['Completed Trips', String(data.kpis.completedTrips)],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [149, 86, 0] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFontSize(11).setFont('helvetica', 'bold');
    doc.text('Trips', 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      head: [['ID', 'Route', 'Vehicle', 'Cargo (kg)', 'Revenue', 'Status']],
      body: rawTrips.map((t) => [
        clean(t.id?.toUpperCase()),
        `${clean(t.source)} -> ${clean(t.destination)}`,
        clean(t.vehicleId),
        String(t.cargoWeight ?? 0),
        money(t.revenue),
        clean(t.status),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [149, 86, 0] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFontSize(11).setFont('helvetica', 'bold');
    doc.text('Fuel Logs', 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      head: [['Vehicle', 'Date', 'Liters', 'Price/L', 'Total Cost', 'Vendor']],
      body: rawFuel.map((f) => [
        clean(f.vehicleId),
        clean(f.date),
        String(f.liters ?? 0),
        String(f.pricePerLiter ?? 0),
        money(f.totalCost),
        clean(f.vendor),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [149, 86, 0] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFontSize(11).setFont('helvetica', 'bold');
    doc.text('Expenses', 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      head: [['Vehicle', 'Type', 'Amount', 'Description', 'Date']],
      body: rawExpenses.map((e) => [
        clean(e.vehicleId),
        clean(e.type),
        money(e.amount),
        clean(e.description),
        clean(e.date),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [149, 86, 0] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    });

    doc.save(`TransitOps_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF exported.');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-container flex items-center justify-center py-24">
        <p className="text-gray-500 text-sm">Failed to load report data. Please refresh.</p>
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
        <StatCard title="Fleet Utilization" value={`${data.stats?.fleetUtilization ?? 0}%`} icon={Activity} color="indigo" />
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
