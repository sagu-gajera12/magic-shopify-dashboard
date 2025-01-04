import React from 'react';
import { Typography } from '@mui/material';

const EditableField = ({ data }) => {
    // Check if data is null or has no keys
    if (!data || Object.keys(data).length === 0) {
        return <></>;
    }

    return (
        <>
            {data.productNameForShiprocket && (
                <Typography>ProductName for shipment: {data.productNameForShiprocket}</Typography>
            )}
            {data.hsn && <Typography>HSN: {data.hsn}</Typography>}
            {data.unitPrice && <Typography>UnitPrice: {data.unitPrice}</Typography>}
            {data.deadWeight && <Typography>DeadWeight: {data.deadWeight}</Typography>}
            {data.length && <Typography>Length: {data.length}</Typography>}
            {data.height && <Typography>Height: {data.height}</Typography>}
            {data.width && <Typography>Width: {data.width}</Typography>}
        </>
    );
};

export default EditableField;
