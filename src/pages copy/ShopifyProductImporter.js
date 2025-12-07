import React, { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ShopifyProductImporter = () => {
  const [productUrl, setProductUrl] = useState("");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      // Shopify stores expose public product JSON at /products/<handle>.json
      const jsonUrl = productUrl.includes(".json")
        ? productUrl
        : `${productUrl}.json`;
      const response = await axios.get(jsonUrl);
      const shopifyProduct = response.data.product;

      // Map into editable format
      setProduct({
        title: shopifyProduct.title,
        description: shopifyProduct.body_html,
        vendor: shopifyProduct.vendor,
        product_type: shopifyProduct.product_type,
        tags: shopifyProduct.tags,
        price: shopifyProduct.variants[0]?.price,
        compare_at_price: shopifyProduct.variants[0]?.compare_at_price,
        images: shopifyProduct.images.map((img) => img.src),
        variants: shopifyProduct.variants.map((v) => ({
          title: v.title,
          price: v.price,
          sku: v.sku,
          inventory_quantity: v.inventory_quantity,
        })),
      });
    } catch (error) {
      console.error("Failed to fetch product data:", error);
      alert("❌ Could not fetch product. Check the URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handlePostToShopify = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_BASE_URL}/shopify/api/products/publish`, product,
      {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
      alert("✅ Product successfully created on Shopify!");
    } catch (error) {
      console.error("Failed to post product:", error);
      alert("❌ Failed to create product on Shopify!");
    }
  };

  return (
    <Box className="p-6 max-w-4xl mx-auto">
      <Typography variant="h4" gutterBottom fontWeight="bold">
        🚀 Smart Product Importer
      </Typography>

      {/* Search Bar */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Enter Shopify Product URL"
          variant="outlined"
          fullWidth
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={fetchProductData}
          disabled={!productUrl || loading}
        >
          {loading ? "Loading..." : "Fetch Product"}
        </Button>
      </Box>

      {/* Product Details Card */}
      {product && (
        <Card sx={{ boxShadow: 4, borderRadius: 3, mt: 2 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              📝 Edit Product Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Title"
                  variant="outlined"
                  fullWidth
                  value={product.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={4}
                  value={product.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Price"
                  variant="outlined"
                  fullWidth
                  value={product.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Compare At Price"
                  variant="outlined"
                  fullWidth
                  value={product.compare_at_price || ""}
                  onChange={(e) =>
                    handleChange("compare_at_price", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Vendor"
                  variant="outlined"
                  fullWidth
                  value={product.vendor}
                  onChange={(e) => handleChange("vendor", e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Product Type"
                  variant="outlined"
                  fullWidth
                  value={product.product_type}
                  onChange={(e) =>
                    handleChange("product_type", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Tags</Typography>
                {product.tags ? (
                  <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                    {product.tags.split(",").map((tag, i) => (
                      <Chip key={i} label={tag.trim()} color="primary" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No tags found
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Images
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  {product.images?.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt="product"
                      width={140}
                      style={{
                        borderRadius: "12px",
                        border: "1px solid #ddd",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  size="large"
                  onClick={handlePostToShopify}
                >
                  ✅ Post to Shopify
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ShopifyProductImporter;
