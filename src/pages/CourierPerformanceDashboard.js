import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getCourierPerformance } from '../services/analyticsService';

// Analytics Service - API calls
const API_BASE_URL = 'http://localhost:8080';

// const analyticsService = {
//   getCourierPerformance: async (startDate, endDate, userId) => {
//     const response = await fetch(
//       `${API_BASE_URL}/shopify/orders/analytics/courier/performance?startDate=${startDate}&endDate=${endDate}`
//     );
//     if (!response.ok) throw new Error('Failed to fetch courier performance');
//     return response.json();
//   }
// };

const CourierPerformanceDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(dateRange);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get userId from localStorage or replace with your auth method
      const userId = localStorage.getItem('userId') || 'default-user';
      
      const response = await getCourierPerformance(
        dateRange.startDate,
        dateRange.endDate
      );
      setData(response);
    } catch (err) {
      setError('Failed to load courier performance data');
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading courier performance data...</div>
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

  const successRateData = data.courierMetrics.map(c => ({
    name: c.courierName,
    successRate: c.deliveryMetrics.successRate,
    rtoRate: c.rtoMetrics.rtoRate
  }));

  const deliveryTimeData = data.courierMetrics.map(c => ({
    name: c.courierName,
    avgDeliveryDays: c.deliveryMetrics.avgDeliveryDays,
    avgRTODays: c.rtoMetrics.avgRTODays
  }));

  const volumeData = data.courierMetrics.map(c => ({
    name: c.courierName,
    delivered: c.deliveryMetrics.deliveredOrders,
    rto: c.rtoMetrics.rtoCount
  }));

  const financialData = data.courierMetrics.map(c => ({
    name: c.courierName,
    shippingCharges: c.financialMetrics.totalShippingCharges,
    rtoCharges: c.financialMetrics.totalRTOCharges
  }));

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Courier Performance Dashboard
        </h1>
        <p style={{ color: '#6b7280' }}>Analyze courier delivery metrics, RTO rates, and financial impact</p>
      </div>

      {/* Date Range Filter */}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Orders', value: data.overallSummary.totalOrders, color: '#3b82f6' },
          { label: 'Total Delivered', value: data.overallSummary.totalDelivered, color: '#10b981' },
          { label: 'Total RTO', value: data.overallSummary.totalRTO, color: '#ef4444' },
          { label: 'Avg Success Rate', value: `${data.overallSummary.avgSuccessRate.toFixed(1)}%`, color: '#8b5cf6' },
          { label: 'Avg Delivery Time', value: `${data.overallSummary.avgDeliveryDays.toFixed(1)} days`, color: '#f59e0b' }
        ].map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${card.color}`
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{card.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        
        {/* Success Rate vs RTO Rate */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Success Rate vs RTO Rate
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={successRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="successRate" fill="#10b981" name="Success Rate %" />
              <Bar dataKey="rtoRate" fill="#ef4444" name="RTO Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Delivery & RTO Time Comparison */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Avg Delivery & RTO Time (Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={deliveryTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgDeliveryDays" stroke="#3b82f6" strokeWidth={2} name="Avg Delivery Days" />
              <Line type="monotone" dataKey="avgRTODays" stroke="#f59e0b" strokeWidth={2} name="Avg RTO Days" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Distribution */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Order Volume Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: 'Orders', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="delivered" fill="#10b981" name="Delivered" stackId="a" />
              <Bar dataKey="rto" fill="#ef4444" name="RTO" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Impact */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Financial Impact (₹)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="shippingCharges" fill="#3b82f6" name="Shipping Charges" />
              <Bar dataKey="rtoCharges" fill="#ef4444" name="RTO Charges" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginTop: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
          Detailed Courier Metrics
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Courier</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Total Orders</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Delivered</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Success %</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>RTO Count</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>RTO %</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Avg Delivery Days</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Shipping ₹</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>RTO Charges ₹</th>
            </tr>
          </thead>
          <tbody>
            {data.courierMetrics.map((courier, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', fontWeight: '500' }}>{courier.courierName}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{courier.deliveryMetrics.totalOrders}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#10b981' }}>{courier.deliveryMetrics.deliveredOrders}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{courier.deliveryMetrics.successRate.toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#ef4444' }}>{courier.rtoMetrics.rtoCount}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{courier.rtoMetrics.rtoRate.toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{courier.deliveryMetrics.avgDeliveryDays.toFixed(1)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>₹{courier.financialMetrics.totalShippingCharges.toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>₹{courier.financialMetrics.totalRTOCharges.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourierPerformanceDashboard;