import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function WalmartAnalytics() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const handleSync = async () => {
    if (!startDate || !endDate) return alert("Please select both dates");
    setSyncing(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/walmart/analytics/sync?startDate=${startDate.format(
          "YYYY-MM-DD"
        )}&endDate=${endDate.format("YYYY-MM-DD")}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchAnalytics();
    } catch (error) {
      console.error(error);
      alert("Failed to sync orders.");
    } finally {
      setSyncing(false);
    }
  };

  const fetchAnalytics = async () => {
    if( startDate > endDate) {
        alert("Start date cannot be after end date");
        return;
    }

    if (!startDate || !endDate) return;
    setLoadingAnalytics(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/walmart/analytics?startDate=${startDate.format(
          "YYYY-MM-DD"
        )}&endDate=${endDate.format("YYYY-MM-DD")}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAnalytics(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load analytics.");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={4}>
        <Typography variant="h4" gutterBottom>
          Walmart Analytics Dashboard
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
            />
          </Grid>
          <Grid item>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => {
                
                if (!startDate) {
                  alert("Please select a start date first");
                  return;
                }
                setEndDate(newValue);
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={fetchAnalytics}
              disabled={loadingAnalytics}
            >
              {loadingAnalytics ? "Searching..." : "Search Analytics"}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? "Syncing..." : "Sync Orders"}
            </Button>
          </Grid>
          
        </Grid>

        <Box mt={4}>
          {loadingAnalytics ? (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress />
            </Box>
          ) : (
            analytics && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Total Orders</Typography>
                      <Typography>{analytics.totalOrders}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">WFS Orders</Typography>
                      <Typography>{analytics.wfsFulfilled}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">
                        Seller Fulfilled Orders
                      </Typography>
                      <Typography>{analytics.sellerFulfilled}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Total Revenue</Typography>
                      <Typography>{analytics.totalRevenue} USD</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
