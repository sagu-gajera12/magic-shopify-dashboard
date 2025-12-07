import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getPincodePerformance, getProblemAreas } from '../services/analyticsService';

// Mock service - replace with actual import
const analyticsService = {
  getPincodePerformance: async (startDate, endDate, limit) => {
    return {
      pincodeMetrics: [
        { pincode: '560001', city: 'Bangalore', state: 'Karnataka', totalOrders: 85, deliveredOrders: 78, rtoOrders: 7, deliverySuccessRate: 91.8, rtoRate: 8.2, avgDeliveryDays: 2.8, performanceCategory: 'Fast' },
        { pincode: '110001', city: 'New Delhi', state: 'Delhi', totalOrders: 92, deliveredOrders: 83, rtoOrders: 9, deliverySuccessRate: 90.2, rtoRate: 9.8, avgDeliveryDays: 3.1, performanceCategory: 'Fast' },
        { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', totalOrders: 105, deliveredOrders: 94, rtoOrders: 11, deliverySuccessRate: 89.5, rtoRate: 10.5, avgDeliveryDays: 3.4, performanceCategory: 'Average' },
        { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu', totalOrders: 78, deliveredOrders: 71, rtoOrders: 7, deliverySuccessRate: 91.0, rtoRate: 9.0, avgDeliveryDays: 3.2, performanceCategory: 'Fast' },
        { pincode: '700001', city: 'Kolkata', state: 'West Bengal', totalOrders: 68, deliveredOrders: 58, rtoOrders: 10, deliverySuccessRate: 85.3, rtoRate: 14.7, avgDeliveryDays: 4.5, performanceCategory: 'Slow' },
        { pincode: '500001', city: 'Hyderabad', state: 'Telangana', totalOrders: 72, deliveredOrders: 65, rtoOrders: 7, deliverySuccessRate: 90.3, rtoRate: 9.7, avgDeliveryDays: 3.3, performanceCategory: 'Average' },
        { pincode: '411001', city: 'Pune', state: 'Maharashtra', totalOrders: 64, deliveredOrders: 59, rtoOrders: 5, deliverySuccessRate: 92.2, rtoRate: 7.8, avgDeliveryDays: 2.9, performanceCategory: 'Fast' },
        { pincode: '380001', city: 'Ahmedabad', state: 'Gujarat', totalOrders: 55, deliveredOrders: 48, rtoOrders: 7, deliverySuccessRate: 87.3, rtoRate: 12.7, avgDeliveryDays: 4.1, performanceCategory: 'Average' },
        { pincode: '560095', city: 'Bangalore', state: 'Karnataka', totalOrders: 48, deliveredOrders: 38, rtoOrders: 10, deliverySuccessRate: 79.2, rtoRate: 20.8, avgDeliveryDays: 5.2, performanceCategory: 'High Risk' },
        { pincode: '201301', city: 'Noida', state: 'Uttar Pradesh', totalOrders: 58, deliveredOrders: 50, rtoOrders: 8, deliverySuccessRate: 86.2, rtoRate: 13.8, avgDeliveryDays: 3.8, performanceCategory: 'Average' }
      ]
    };
  },
  getProblemAreas: async (startDate, endDate, minOrders) => {
    return {
      highRTOPincodes: [
        { pincode: '560095', city: 'Bangalore', state: 'Karnataka', rtoRate: 20.8, totalOrders: 48, rtoOrders: 10 },
        { pincode: '700001', city: 'Kolkata', state: 'West Bengal', rtoRate: 14.7, totalOrders: 68, rtoOrders: 10 },
        { pincode: '201301', city: 'Noida', state: 'Uttar Pradesh', rtoRate: 13.8, totalOrders: 58, rtoOrders: 8 },
        { pincode: '380001', city: 'Ahmedabad', state: 'Gujarat', rtoRate: 12.7, totalOrders: 55, rtoOrders: 7 }
      ],
      slowDeliveryPincodes: [
        { pincode: '560095', city: 'Bangalore', state: 'Karnataka', avgDeliveryDays: 5.2, totalOrders: 48 },
        { pincode: '700001', city: 'Kolkata', state: 'West Bengal', avgDeliveryDays: 4.5, totalOrders: 68 },
        { pincode: '380001', city: 'Ahmedabad', state: 'Gujarat', avgDeliveryDays: 4.1, totalOrders: 55 },
        { pincode: '201301', city: 'Noida', state: 'Uttar Pradesh', avgDeliveryDays: 3.8, totalOrders: 58 }
      ]
    };
  }
};

const GeographyPerformanceDashboard = () => {
  const [pincodeData, setPincodeData] = useState(null);
  const [problemAreas, setProblemAreas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('pincode'); // 'pincode', 'city', 'state'
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [dateRange, viewMode]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pincodeResponse, problemResponse] = await Promise.all([
        getPincodePerformance(dateRange.startDate, dateRange.endDate, 50),
        getProblemAreas(dateRange.startDate, dateRange.endDate, 10)
      ]);
      setPincodeData(pincodeResponse);
      setProblemAreas(problemResponse);
    } catch (err) {
      setError('Failed to load geography performance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Fast': '#10b981',
      'Average': '#f59e0b',
      'Slow': '#ef4444',
      'High Risk': '#dc2626'
    };
    return colors[category] || '#6b7280';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading geography performance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#991b1b' }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  // Prepare data for charts
  const fastestPincodes = [...pincodeData.pincodeMetrics]
    .sort((a, b) => a.avgDeliveryDays - b.avgDeliveryDays)
    .slice(0, 10);

  const slowestPincodes = [...pincodeData.pincodeMetrics]
    .sort((a, b) => b.avgDeliveryDays - a.avgDeliveryDays)
    .slice(0, 10);

  const performanceCategoryData = pincodeData.pincodeMetrics.reduce((acc, item) => {
    acc[item.performanceCategory] = (acc[item.performanceCategory] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(performanceCategoryData).map(([name, value]) => ({
    name,
    value,
    color: getCategoryColor(name)
  }));

  const scatterData = pincodeData.pincodeMetrics.map(item => ({
    x: item.avgDeliveryDays,
    y: item.rtoRate,
    z: item.totalOrders,
    name: item.pincode,
    city: item.city
  }));

  // Calculate summary statistics
  const summary = pincodeData.summary;
  const totalOrders = summary.totalOrders;
  const totalDelivered = summary.totalDelivered;
  const totalRTO = summary.totalRTO;
  const avgDeliveryDays = summary.avgDeliveryDays;
  const avgSuccessRate = summary.overallSuccessRate;

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Geography Performance Dashboard
        </h1>
        <p style={{ color: '#6b7280' }}>Analyze delivery performance by pincode, city, and state</p>
      </div>

      {/* Filters */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              style={{ 
                padding: '8px 12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              style={{ 
                padding: '8px 12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          <button
            onClick={fetchData}
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Orders', value: totalOrders, color: '#3b82f6' },
          { label: 'Total Delivered', value: totalDelivered, color: '#10b981' },
          { label: 'Total RTO', value: totalRTO, color: '#ef4444' },
          { label: 'Avg Success Rate', value: `${avgSuccessRate}%`, color: '#8b5cf6' },
          { label: 'Avg Delivery Days', value: avgDeliveryDays, color: '#f59e0b' },
          { label: 'Analyzed Pincodes', value: pincodeData.pincodeMetrics.length, color: '#06b6d4' }
        ].map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${card.color}`
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{card.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Problem Areas Section */}
      <div style={{ 
        backgroundColor: '#fef2f2', 
        border: '1px solid #fecaca',
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️</span> Problem Areas Requiring Attention
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#7f1d1d' }}>High RTO Pincodes</h4>
            <div style={{ backgroundColor: 'white', borderRadius: '6px', padding: '12px' }}>
              {problemAreas.highRTOPincodes.map((area, idx) => (
                <div key={idx} style={{ 
                  padding: '8px', 
                  borderBottom: idx < problemAreas.highRTOPincodes.length - 1 ? '1px solid #fee2e2' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{area.pincode} - {area.city}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{area.totalOrders} orders, {area.rtoOrders} RTO</div>
                  </div>
                  <div style={{ 
                    backgroundColor: '#fecaca', 
                    color: '#991b1b', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {area.rtoRate.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#7f1d1d' }}>Slow Delivery Zones</h4>
            <div style={{ backgroundColor: 'white', borderRadius: '6px', padding: '12px' }}>
              {problemAreas.slowDeliveryPincodes.map((area, idx) => (
                <div key={idx} style={{ 
                  padding: '8px', 
                  borderBottom: idx < problemAreas.slowDeliveryPincodes.length - 1 ? '1px solid #fee2e2' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{area.pincode} - {area.city}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{area.totalOrders} orders</div>
                  </div>
                  <div style={{ 
                    backgroundColor: '#fed7aa', 
                    color: '#92400e', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {area.avgDeliveryDays.toFixed(1)} days
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Fastest Delivery Pincodes */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            🚀 Top 10 Fastest Delivery Pincodes
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={fastestPincodes} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
              <YAxis type="category" dataKey="pincode" width={80} />
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px' }}>
                      <div style={{ fontWeight: '600' }}>{data.pincode} - {data.city}</div>
                      <div>Avg Delivery: {data.avgDeliveryDays.toFixed(1)} days</div>
                      <div>Orders: {data.totalOrders}</div>
                      <div>Success: {data.deliverySuccessRate.toFixed(1)}%</div>
                    </div>
                  );
                }
                return null;
              }} />
              <Bar dataKey="avgDeliveryDays" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Slowest Delivery Pincodes */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            🐌 Top 10 Slowest Delivery Pincodes
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={slowestPincodes} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
              <YAxis type="category" dataKey="pincode" width={80} />
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px' }}>
                      <div style={{ fontWeight: '600' }}>{data.pincode} - {data.city}</div>
                      <div>Avg Delivery: {data.avgDeliveryDays.toFixed(1)} days</div>
                      <div>Orders: {data.totalOrders}</div>
                      <div>RTO Rate: {data.rtoRate.toFixed(1)}%</div>
                    </div>
                  );
                }
                return null;
              }} />
              <Bar dataKey="avgDeliveryDays" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Category Distribution */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Performance Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {categoryChartData.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: cat.color, borderRadius: '2px' }}></div>
                <span>{cat.name}: {cat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scatter: Delivery Time vs RTO Rate */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Delivery Time vs RTO Rate Correlation
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="Avg Delivery Days" label={{ value: 'Avg Delivery Days', position: 'insideBottom', offset: -5 }} />
              <YAxis type="number" dataKey="y" name="RTO Rate %" label={{ value: 'RTO Rate %', angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px' }}>
                      <div style={{ fontWeight: '600' }}>{data.name} - {data.city}</div>
                      <div>Avg Delivery: {data.x.toFixed(1)} days</div>
                      <div>RTO Rate: {data.y.toFixed(1)}%</div>
                      <div>Orders: {data.z}</div>
                    </div>
                  );
                }
                return null;
              }} />
              <Scatter name="Pincodes" data={scatterData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', fontStyle: 'italic' }}>
            Pincodes in top-right quadrant need immediate attention (slow delivery + high RTO)
          </p>
        </div>
      </div>

      {/* Detailed Pincode Table */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
          Detailed Pincode Performance
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Pincode</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>City</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>State</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Orders</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Delivered</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>RTO</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Success %</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>RTO %</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Avg Days</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Category</th>
            </tr>
          </thead>
          <tbody>
            {pincodeData.pincodeMetrics.map((pin, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', fontWeight: '600' }}>{pin.pincode}</td>
                <td style={{ padding: '12px' }}>{pin.city}</td>
                <td style={{ padding: '12px' }}>{pin.state}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{pin.totalOrders}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#10b981' }}>{pin.deliveredOrders}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#ef4444' }}>{pin.rtoOrders}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{pin.deliverySuccessRate.toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{pin.rtoRate.toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{pin.avgDeliveryDays.toFixed(1)}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: `${getCategoryColor(pin.performanceCategory)}20`,
                    color: getCategoryColor(pin.performanceCategory)
                  }}>
                    {pin.performanceCategory}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GeographyPerformanceDashboard;