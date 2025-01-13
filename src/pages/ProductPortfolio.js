import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";

const StickyHeaderTableCell = styled(TableCell)({
  backgroundColor: "#f5f5f5",
  position: "sticky",
  top: 0,
  zIndex: 1,
  textAlign: "center",
  fontWeight: "bold",
});



const ProductPortfolio = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/walmart/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await axios.get("http://localhost:8080/walmart/items/sync");
      await fetchProducts();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  const handleEditableColumnUpdate = async (sku, columnId, newValue) => {
    try {
      const payload = { sku, [columnId]: newValue };
      await axios.post("http://localhost:8080/walmart/updateProduct", payload);
      await fetchProducts();
    } catch (error) {
      console.error(`Failed to update ${columnId} for SKU ${sku}:`, error);
    }
  };
  
  const handleEditableInputBlur = (event, selectedProduct, columnId, oldValue) => {
    const newValue = event.target.value;
    if (newValue !== '' &&newValue.trim() !== "" && newValue !== oldValue) {
      handleEditableColumnUpdate(selectedProduct.sku, columnId, newValue);
      setProducts(prevProduct =>
        prevProduct.map(product =>
          product.sku === selectedProduct.sku
                ? { ...selectedProduct,[columnId]: newValue }
                : product
        )
    );
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Box p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Product Portfolio</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSync}
          disabled={syncing || loading}
        >
          {syncing ? "Syncing..." : "Sync"}
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer
            component={Paper}
            sx={{ maxHeight: "60vh", overflow: "auto", overflowX: "scroll" }} // Ensure horizontal scroll
          >
            <Box sx={{ width: "max-content" }}> {/* Ensures table content determines width */}
              <Table stickyHeader>

                <TableHead>
                  <TableRow>
                    <StickyHeaderTableCell>SKU</StickyHeaderTableCell>
                    {/* <StickyHeaderTableCell>Condition</StickyHeaderTableCell> */}
                    <StickyHeaderTableCell>Availability</StickyHeaderTableCell>
                    {/* <StickyHeaderTableCell>WPID</StickyHeaderTableCell> */}
                    <StickyHeaderTableCell>Product Name</StickyHeaderTableCell>
                    <StickyHeaderTableCell>Type</StickyHeaderTableCell>
                    <StickyHeaderTableCell>Price</StickyHeaderTableCell>
                    <StickyHeaderTableCell>Price in INR</StickyHeaderTableCell>
                    {/* <StickyHeaderTableCell>Published Status</StickyHeaderTableCell>
                    <StickyHeaderTableCell>Lifecycle Status</StickyHeaderTableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((product) => (
                      <TableRow key={product.sku}>
                        <TableCell>{product.sku}</TableCell>
                        {/* <TableCell>{product.walmartCondition}</TableCell> */}
                        <TableCell>{product.availability}</TableCell>
                        {/* <TableCell>{product.wpid}</TableCell> */}
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>{product.productType}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <input
                            type="text"
                            defaultValue=""
                            placeholder="Enter Price"
                            onBlur={(e) =>
                              handleEditableInputBlur(e, product, "priceInINR", product.priceInINR)
                            }
                            style={{
                              width: "100%",
                              padding: "4px",
                              fontSize: "14px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          />
                        </TableCell>
                        {/* <TableCell>{product.publishedStatus}</TableCell>
                        <TableCell>{product.lifecycleStatus}</TableCell> */}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={products.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ProductPortfolio;
