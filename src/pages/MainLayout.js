import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material';
import Dashboard from '../pages/Dashboard';
import ProductPortfolio from '../pages/ProductPortfolio';
import ShippedOrderTracking from '../pages/ShippedOrderTracking';
import OrderManagement from '../pages/OrderManagement';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function MainLayout() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top NavBar */}
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Walmart / Shiprocket Integration
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Layout */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar Tabs */}
        <Box sx={{ width: '20%', bgcolor: '#f5f5f5', borderRight: 1, borderColor: 'divider', height: '100%', alignContent:'center' }}>
          <Tabs
            orientation="vertical"
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="Sidebar Tabs"
            sx={{ height: '100%' }}
            TabIndicatorProps={{ style: { backgroundColor: '#1976d2' } }}
          >
            <Tab label="Unshipped Order" />
            <Tab label="Product Portfolio" />
            <Tab label="Shipped Order Tracking" />
            <Tab label="Order Management" />
          </Tabs>
        </Box>

        {/* Right Content Area */}
        <Box sx={{ flex: 1, bgcolor: '#fff' , width:'80%'}}>
          <TabPanel value={selectedTab} index={0}>
            <Dashboard />
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <ProductPortfolio />
          </TabPanel>
          <TabPanel value={selectedTab} index={2}>
            <ShippedOrderTracking />
          </TabPanel>
          <TabPanel value={selectedTab} index={3}>
            <OrderManagement />
          </TabPanel>
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
