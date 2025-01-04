import React from 'react';
import { TextField, Grid } from '@mui/material';

const AddressFields = ({ prefix, address, handleChange }) => (
    <Grid container spacing={2}>
        <Grid item xs={12}>
            <TextField
                label="name"
                value={address.name || ''}
                fullWidth
                onChange={(e) => handleChange('name', e.target.value)}
            />
        </Grid>
        <Grid item xs={12}>
            <TextField
                label="Address Line 1"
                value={address.address1 || ''}
                fullWidth
                onChange={(e) => handleChange(`address1`, e.target.value)}
            />
        </Grid>
        <Grid item xs={12}>
            <TextField
                label="Address Line 2"
                value={address.address2 || ''}
                fullWidth
                onChange={(e) => handleChange(`address2`, e.target.value)}
            />
        </Grid>
        <Grid item xs={6}>
            <TextField
                label="City"
                value={address.city || ''}
                fullWidth
                onChange={(e) => handleChange(`city`, e.target.value)}
            />
        </Grid>
        <Grid item xs={3}>
            <TextField
                label="State"
                value={address.state || ''}
                fullWidth
                onChange={(e) => handleChange(`state`, e.target.value)}
            />
        </Grid>
        <Grid item xs={3}>
            <TextField
                label="Postal Code"
                value={address.postalCode || ''}
                fullWidth
                onChange={(e) => handleChange(`postalCode`, e.target.value)}
            />
        </Grid>
        <Grid item xs={12}>
            <TextField
                label="Country"
                value={address.country || ''}
                fullWidth
                onChange={(e) => handleChange(`country`, e.target.value)}
            />
        </Grid>
    </Grid>
);

export default AddressFields;
