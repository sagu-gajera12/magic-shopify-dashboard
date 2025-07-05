import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Divider,
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
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [asPerShippingDate, setAsPerShippingDate] = useState(false);


  const handleSync = async () => {
    if (!startDate || !endDate) return alert("Please select both dates");
    setSyncing(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/walmart/analytics/sync?startDate=${startDate.format("YYYY-MM-DD")}&endDate=${endDate.format("YYYY-MM-DD")}`,
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
    if (startDate > endDate) {
      alert("Start date cannot be after end date");
      return;
    }

    if (!startDate || !endDate) return;
    setLoadingAnalytics(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/walmart/analytics?startDate=${startDate.format("YYYY-MM-DD")}&endDate=${endDate.format("YYYY-MM-DD")}&asPerShippingDate=${asPerShippingDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAnalytics(response.data);
      setSelectedOrders([]); // Reset selection
    } catch (error) {
      console.error(error);
      alert("Failed to load analytics.");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const toggleOrderSelection = (order) => {
    const isSelected = selectedOrders.some(o => o.purchaseOrderId === order.purchaseOrderId);
    if (isSelected) {
      setSelectedOrders(prev => prev.filter(o => o.purchaseOrderId !== order.purchaseOrderId));
    } else {
      setSelectedOrders(prev => [...prev, order]);
    }
  };

  const selectAllOrders = () => {
    if (analytics?.walmartOrderAnalyticsEntityList) {
      setSelectedOrders(analytics.walmartOrderAnalyticsEntityList);
    }
  };

  const clearAllSelections = () => {
    setSelectedOrders([]);
  };

  const calculateSelectedSummary = () => {
    const total = selectedOrders.reduce(
      (acc, order) => {
        acc.amount += order.totalAmount || 0;
        acc.count += 1;
        acc.quantity += order.quantity || 0;
        return acc;
      },
      { amount: 0, count: 0, quantity: 0 }
    );
    return total;
  };

  const selectedSummary = calculateSelectedSummary();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={4}>
        <Typography variant="h4" gutterBottom>
          Walmart Analytics Dashboard
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <DatePicker label="Start Date" value={startDate} onChange={setStartDate} />
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
    <FormControlLabel
      control={
        <Checkbox
          checked={asPerShippingDate}
          onChange={(e) => setAsPerShippingDate(e.target.checked)}
        />
      }
      label="Search as per Shipping Date"
    />
  </Grid>
          <Grid item>
            <Button variant="contained" onClick={fetchAnalytics} disabled={loadingAnalytics}>
              {loadingAnalytics ? "Searching..." : "Search Analytics"}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={handleSync} disabled={syncing}>
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
              <>
                {/* Summary Cards */}
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">Total Orders</Typography>
                        <Typography>{analytics.totalOrders}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">WFS Orders</Typography>
                        <Typography>{analytics.wfsFulfilled}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">Seller Fulfilled</Typography>
                        <Typography>{analytics.sellerFulfilled}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">Total Revenue</Typography>
                        <Typography>{analytics.totalRevenue} USD</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Selected Orders Summary */}
                {selectedOrders.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="h6" gutterBottom>
                      Selected Orders Summary
                    </Typography>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography>Total Selected Orders: {selectedSummary.count}</Typography>
                        <Typography>Total Quantity: {selectedSummary.quantity}</Typography>
                        <Typography>Total Amount: ${selectedSummary.amount.toFixed(2)}</Typography>
                      </CardContent>
                    </Card>
                  </Box>
                )}

                {/* Selection Actions */}
                <Box mb={2}>
                  <Button variant="outlined" onClick={selectAllOrders} sx={{ mr: 2 }}>
                    Select All
                  </Button>
                  <Button variant="outlined" color="error" onClick={clearAllSelections}>
                    Clear Selection
                  </Button>
                </Box>

                {/* Order Cards */}
                <Grid container spacing={2}>
                  {analytics.walmartOrderAnalyticsEntityList?.map((order) => {
                    const isChecked = selectedOrders.some(o => o.purchaseOrderId === order.purchaseOrderId);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={order.purchaseOrderId}>
                        <Card variant="outlined" sx={{ height: "100%" }}>
                          <CardContent>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isChecked}
                                  onChange={() => toggleOrderSelection(order)}
                                />
                              }
                              label="Select"
                            />
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" color="textSecondary">
                              Purchase Order ID:
                            </Typography>
                            <Typography>{order.purchaseOrderId}</Typography>

                            <Typography variant="subtitle2" color="textSecondary" mt={1}>
                              Customer Order ID:
                            </Typography>
                            <Typography>{order.customerOrderId}</Typography>

                            <Typography variant="subtitle2" color="textSecondary" mt={1}>
                              SKU:
                            </Typography>
                            <Typography>{order.sku || "-"}</Typography>

                            <Typography variant="subtitle2" color="textSecondary" mt={1}>
                              Status:
                            </Typography>
                            <Typography>{order.status}</Typography>

                            <Typography variant="subtitle2" color="textSecondary" mt={1}>
                              Total Amount:
                            </Typography>
                            <Typography>${order.totalAmount?.toFixed(2) || "0.00"}</Typography>

                            <Typography variant="subtitle2" color="textSecondary" mt={1}>
                              Quantity:
                            </Typography>
                            <Typography>{order.quantity}</Typography>

                            <Typography variant="subtitle2" color="textSecondary" mt={1}>
                              Fulfillment Type:
                            </Typography>
                            <Typography>{order.fulfillmentType}</Typography>

                            <Typography variant="subtitle2" color="textSecondary" mt={1}>
                              Order Date:
                            </Typography>
                            <Typography>
                              {order.orderDate?.join("-")}
                            </Typography>
                            <Typography variant="subtitle2" color="textSecondary" mt={1}>
                              Shipping Date:
                            </Typography>
                            <Typography>
                              {order.shippingDate?.join("-")}
                            </Typography>
                            
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </>
            )
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
