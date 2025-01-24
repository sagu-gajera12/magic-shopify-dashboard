import { useState } from 'react';

const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalType, setModalType] = useState('');

    return {
        orders,
        setOrders,
        loading,
        setLoading,
        selectedOrder,
        setSelectedOrder,
        modalType,
        setModalType,
    };
};

export default useOrders;
