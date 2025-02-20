import React, { useState } from "react";
import { Box,Paper, TablePagination } from "@mui/material";
import OrderCard from "./OrderCard";

const OrderList = ({ orders, setOrders, handleOpenEmailModal, setEmailData }) => {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (<>
        <Box>
            {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => {
                return <OrderCard key={order.purchaseOrderId} order={order} setOrders={setOrders} handleOpenEmailModal={handleOpenEmailModal} setEmailData={setEmailData} />
            })}
        </Box>

        <Paper elevation={0} sx={{ mt: 2 }}>
            <TablePagination
                component="div"
                count={orders.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[20, 50, 100]}
            />
        </Paper>
    </>
    );
};

export default OrderList;
