import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Tabs, Tab, Box, IconButton, Drawer
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ShopifyProductImporter from './ShopifyProductImporter';
import ShopifyOrders from './ShopifyOrders';
import GeographyPerformanceDashboard from './GeographyPerformanceDashboard';
import CourierPerformanceDashboard from './CourierPerformanceDashboard';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function MainLayout() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Detects mobile screens

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    if (isMobile) {
      setMobileOpen(false); // Close sidebar after selecting a tab on mobile
    }
  };

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const sidebarContent = (
    <Box
      sx={{
        bgcolor: '#f5f5f5',
        height: '100%',
        pt: 2,
        width: '100%',
        mt: isMobile ? '50px' : 0,
      }}
    >
      <Tabs
        orientation="vertical"
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="Sidebar Tabs"
        TabIndicatorProps={{ style: { backgroundColor: '#1976d2' } }}
        sx={{ height: '100%', alignItems: "flex-start" }} // Aligns tabs to the left
      >
       
                <Tab
          label="Shopify Importer"
          sx={{ textAlign: "left", justifyContent: "flex-start", display: "flex" }}
        />
        <Tab
          label="Shopify Orders"
          sx={{ textAlign: "left", justifyContent: "flex-start", display: "flex" }}
        />
        <Tab
          label="Courier Performance Dashboard"
          sx={{ textAlign: "left", justifyContent: "flex-start", display: "flex" }}
        />
        <Tab
          label="Geography Performance Dashboard"
          sx={{ textAlign: "left", justifyContent: "flex-start", display: "flex" }}
        />
      </Tabs>
    </Box>
  );



  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top NavBar */}
      <AppBar position="fixed" sx={{ bgcolor: '#1976d2', zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Walmart / Shiprocket Integration
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Adjust layout to account for fixed AppBar */}
      <Box sx={{ display: 'flex', flex: 1, mt: 8 }}>
        {/* Sidebar for Desktop and Tablet */}
        {!isMobile && (
          <Box sx={{ width: '20%', bgcolor: '#f5f5f5', borderRight: 1, borderColor: 'divider', height: '100%' }}>
            {sidebarContent}
          </Box>
        )}

        {/* Sidebar for Mobile (Drawer) */}
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={toggleDrawer}
          sx={{ zIndex: theme.zIndex.drawer }}
        >
          {sidebarContent}
        </Drawer>

        {/* Right Content Area */}
        <Box sx={{ flex: 1, bgcolor: '#fff', width: isMobile ? '100%' : '80%' }}>
          <TabPanel value={selectedTab} index={0}>
            <ShopifyProductImporter />
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <ShopifyOrders />
          </TabPanel>
          <TabPanel value={selectedTab} index={2}>
            <CourierPerformanceDashboard/>
          </TabPanel>
          <TabPanel value={selectedTab} index={3}>
            <GeographyPerformanceDashboard/>
          </TabPanel>
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
