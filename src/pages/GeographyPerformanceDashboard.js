import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getPincodePerformance, getProblemAreas } from '../services/analyticsService';

// Analytics Service - API calls
const API_BASE_URL = 'http://localhost:8080';

// const analyticsService = {
//   getPincodePerformance: async (startDate, endDate, userId, limit = 50) => {
//     const response = await fetch(
//       `${API_BASE_URL}/shopify/orders/analytics/geography/pincode?startDate=${startDate}&endDate=${endDate}&userId=${userId}&limit=${limit}`
//     );
//     if (!response.ok) throw new Error('Failed to fetch pincode performance');
//     return response.json();
//   },
  
//   getProblemAreas: async (startDate, endDate, userId, minOrders = 10) => {
//     const response = await fetch(
//       `${API_BASE_URL}/shopify/orders/analytics/geography/problem-areas?startDate=${startDate}&endDate=${endDate}&userId=${userId}&minOrders=${minOrders}`
//     );
//     if (!response.ok) throw new Error('Failed to fetch problem areas');
//     return response.json();
//   }
// };

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(dateRange);

  useEffect(() => {
    fetchData();
  }, [dateRange, viewMode]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get userId from localStorage or replace with your auth method
      const userId = localStorage.getItem('userId') || 'default-user';
      
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
    setTempDateRange(prev => ({ ...prev, [field]: value }));
  };

  const applyDateFilter = () => {
    setDateRange(tempDateRange);
    setShowDatePicker(false);
  };

  const setQuickRange = (days) => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(new Date().setDate(new Date().getDate() - days)).toISOString().split('T')[0];
    setTempDateRange({ startDate: start, endDate: end });
  };

  const formatDateRange = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    return `${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
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
  const totalOrders = pincodeData.pincodeMetrics.reduce((sum, p) => sum + p.totalOrders, 0);
  const totalDelivered = pincodeData.pincodeMetrics.reduce((sum, p) => sum + p.deliveredOrders, 0);
  const totalRTO = pincodeData.pincodeMetrics.reduce((sum, p) => sum + p.rtoOrders, 0);
  const avgDeliveryDays = (pincodeData.pincodeMetrics.reduce((sum, p) => sum + p.avgDeliveryDays, 0) / pincodeData.pincodeMetrics.length).toFixed(1);
  const avgSuccessRate = (pincodeData.pincodeMetrics.reduce((sum, p) => sum + p.deliverySuccessRate, 0) / pincodeData.pincodeMetrics.length).toFixed(1);

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
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#6b7280' }}>
              📅 Date Range
            </label>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              style={{
                padding: '12px 20px',
                backgroundColor: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '320px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#3b82f6'}
              onMouseLeave={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <span>📆</span>
              <span>{formatDateRange()}</span>
              <span style={{ marginLeft: 'auto' }}>▼</span>
            </button>
          </div>
        </div>

        {/* Date Picker Dropdown */}
        {showDatePicker && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '20px',
            marginTop: '8px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '400px'
          }}>
            {/* Quick Select Buttons */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#6b7280', textTransform: 'uppercase' }}>
                Quick Select
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Last 7 days', days: 7 },
                  { label: 'Last 30 days', days: 30 },
                  { label: 'Last 60 days', days: 60 },
                  { label: 'Last 90 days', days: 90 }
                ].map((quick) => (
                  <button
                    key={quick.days}
                    onClick={() => setQuickRange(quick.days)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#374151',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#3b82f6';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.color = '#374151';
                    }}
                  >
                    {quick.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '16px 0' }}></div>

            {/* Custom Date Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: '#6b7280', textTransform: 'uppercase' }}>
                Custom Range
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={tempDateRange.startDate}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                    style={{ 
                      width: '100%',
                      padding: '10px 12px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tempDateRange.endDate}
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                    style={{ 
                      width: '100%',
                      padding: '10px 12px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setTempDateRange(dateRange);
                  setShowDatePicker(false);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}
              >
                Cancel
              </button>
              <button
                onClick={applyDateFilter}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white'
                }}
              >
                Apply
              </button>
            </div>
          </div>
        )}
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