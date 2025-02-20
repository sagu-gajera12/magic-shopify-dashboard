import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";

const OrderStats = ({ orders }) => {
  const getOrderStats = () => {
    return orders.reduce((acc, order) => {
        if(order.status === undefined)
        console.log(order, orders); 
      const status = order.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  };

  const orderStats = getOrderStats();

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} md={3}>
        <Card sx={{ bgcolor: "primary.dark", color: "white" }}>
          <CardContent>
            <Typography variant="h6">Total Orders</Typography>
            <Typography variant="h4">{orders.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card sx={{ bgcolor: "warning.main", color: "white" }}>
          <CardContent>
            <Typography variant="h6">New Orders</Typography>
            <Typography variant="h4">{orderStats.created || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card sx={{ bgcolor: "primary.main", color: "white" }}>
          <CardContent>
            <Typography variant="h6">Shipped Orders</Typography>
            <Typography variant="h4">{orderStats.shipped || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card sx={{ bgcolor: "success.main", color: "white" }}>
          <CardContent>
            <Typography variant="h6">Delivered Orders</Typography>
            <Typography variant="h4">{orderStats.delivered || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default OrderStats;
