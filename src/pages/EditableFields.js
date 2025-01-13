import React from 'react';
import { Typography } from '@mui/material';

const EditableField = ({ data, flag }) => {
    // Check if data is null or has no keys
    if (!data || Object.keys(data).length === 0) {
        return <></>;
    }
    console.log("data", data, flag)

    if (flag === "editableOrderInfoData") {
        return <>
            {/* {data.productNameForShiprocket && (
                <Typography>ProductName for shipment: {data.productNameForShiprocket}</Typography>
            )} */}
            {data.hsn && <Typography>HSN: {data.hsn}</Typography>}
            {data.unitPrice && <Typography>SR UnitPrice: {data.unitPrice}</Typography>}
        </>
    } else {
        return <>
            {data.deadWeight && <Typography>DeadWeight: {data.deadWeight}</Typography>}
            {data.length && <Typography>Length: {data.length}</Typography>}
            {data.height && <Typography>Height: {data.height}</Typography>}
            {data.width && <Typography>Width: {data.width}</Typography>}
        </>
    }
};

export default EditableField;
