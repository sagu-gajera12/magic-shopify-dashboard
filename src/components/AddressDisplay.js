import React from 'react';
import { Typography } from '@mui/material';

const AddressDisplay = ({ address, addressType }) => {
    // Check if the address is null or undefined
    if (!address || Object.keys(address).length === 0) {
        return <Typography>No Address Available</Typography>;
    }

    return (
        <>
            <Typography variant="h6" gutterBottom mt={2}>
               {addressType}
            </Typography>
            {address.name && <Typography>{address.name}</Typography>}
            {address.address1 && <Typography>{address.address1}</Typography>}
            {(address.city || address.state) && (
                <Typography>
                    {address.city && `${address.city}, `}
                    {address.state}
                </Typography>
            )}
            {(address.postalCode || address.country) && (
                <Typography>
                    {address.postalCode && `${address.postalCode}, `}
                    {address.country}
                </Typography>
            )}
        </>
    );
};

export default AddressDisplay;
