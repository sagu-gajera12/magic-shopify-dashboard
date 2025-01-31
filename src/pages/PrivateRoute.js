import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Paper } from "@mui/material";
import { validateToken } from "../services/api.js";



const PrivateRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsValid(false);
        return;
      }
      const valid = await validateToken(token);
      setIsValid(valid);
    };

    checkToken();
  }, [token]);

  // Show a loading spinner while checking token validity
  if (isValid === null ) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Paper elevation={3} sx={{ padding: 4, textAlign: "center" }}>
          <CircularProgress color="primary" />
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Authenticating...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return isValid ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
