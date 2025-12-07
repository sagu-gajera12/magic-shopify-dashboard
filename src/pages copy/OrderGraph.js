import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, CircularProgress } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const OrderGraph = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyData();
    fetchDailyData();
  }, []);

  const fetchMonthlyData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/dashboard/monthly-summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMonthlyData(response.data);
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyData = async () => {
    try {
        const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/dashboard/daily-summary`, { headers: { Authorization: `Bearer ${token}` } });
      setDailyData(response.data);
    } catch (error) {
      console.error("Error fetching daily data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#fff", borderRadius: 2, boxShadow: 2 }}>
      <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)} centered>
        <Tab label="Last 12 Months" />
        <Tab label="Last 30 Days" />
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ mt: 2, height: 400 }}>
          {tabIndex === 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orderCount" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          )}
          {tabIndex === 1 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orderCount" stroke="#1976d2" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Box>
      )}
    </Box>
  );
};

export default OrderGraph;
