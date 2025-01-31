import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  CircularProgress,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; 

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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        window.location.href = "/login";
      }
      const response = await axios.get(`${API_BASE_URL}/walmart/products`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
      },
      });
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
      const token = localStorage.getItem("token");
      await axios.get(`${API_BASE_URL}/walmart/items/sync`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
      },
      });
      await fetchProducts();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  const handleEditModalOpen = (product) => {
    setSelectedProduct({ ...product });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleEditableFieldChange = (field, value) => {
    setSelectedProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateProduct = async () => {
    try {
      const editableProductField = {
        sku: selectedProduct.sku,
        priceInInr: selectedProduct.priceInInr || "",
        deadWeight: selectedProduct.deadWeight || "",
        height: selectedProduct.height || "",
        length: selectedProduct.length || "",
        width: selectedProduct.width || "",
      }

      console.log("editableProductField", editableProductField)

      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_BASE_URL}/walmart/updateProduct`,
      editableProductField,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
      }});
      const result = response.data;
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.sku === result.sku ? { ...result } : product
        )
      );
    
      handleModalClose();
    } catch (error) {
      console.error("Failed to update product:", error);
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
          <TableContainer component={Paper} sx={{ maxHeight: "60vh", width: "100%", overflowX: "auto" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StickyHeaderTableCell
                    sx={{ textAlign: "left", minWidth: { xs: 100, sm: 150, md: 200 } }}
                  >
                    SKU
                  </StickyHeaderTableCell>
                  <StickyHeaderTableCell
                    sx={{ textAlign: "left", minWidth: { xs: 150, sm: 200, md: 300 } }}
                  >
                    Product Name
                  </StickyHeaderTableCell>
                  <StickyHeaderTableCell
                    sx={{ textAlign: "left", minWidth: { xs: 100, sm: 150, md: 200 } }}
                  >
                    Price
                  </StickyHeaderTableCell>
                  <StickyHeaderTableCell
                    sx={{ textAlign: "left", minWidth: { xs: 150, sm: 200, md: 250 } }}
                  >
                    Actions
                  </StickyHeaderTableCell>
                </TableRow>
              </TableHead>
              <TableBody style={{ textAlign: 'center' }}>
                {products
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product) => (
                    <TableRow key={product.sku}>
                      <TableCell sx={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                        {product.sku}
                      </TableCell>
                      <TableCell sx={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                        {product.productName}
                      </TableCell>
                      <TableCell>
                        ${product.price.toFixed(2)}
                        | ₹
                        {product.priceInInr}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleEditModalOpen(product)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
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

      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            width: 400,
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            mx: "auto",
            mt: 10,
          }}
        >
          <Typography variant="h6" mb={2} textAlign="center">
            Edit Product : {selectedProduct?.productName}
          </Typography>
          {selectedProduct && (
            <>
              <TextField
                fullWidth
                label="Price (INR)"
                value={selectedProduct.priceInInr || ""}
                onChange={(e) => handleEditableFieldChange("priceInInr", e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Dead Weight (gm)"
                value={selectedProduct.deadWeight || ""}
                onChange={(e) => handleEditableFieldChange("deadWeight", e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Height (cm)"
                value={selectedProduct.height || ""}
                onChange={(e) => handleEditableFieldChange("height", e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Length (cm)"
                value={selectedProduct.length || ""}
                onChange={(e) => handleEditableFieldChange("length", e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Width (cm)"
                value={selectedProduct.width || ""}
                onChange={(e) => handleEditableFieldChange("width", e.target.value)}
                margin="normal"
              />
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button variant="contained" onClick={handleUpdateProduct}>
                  Submit
                </Button>
                <Button variant="outlined" onClick={handleModalClose}>
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ProductPortfolio;
