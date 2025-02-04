const statusColors = {
    PENDING: "#FFD700", 
    PROCESSING: "#FFA500", 
    SHIPPED_IN_SHIP_ROCKET: "#4CAF50", 
    SHIPPED_IN_WALMART: "#3F51B5", 
    CANCELLED: "#F44336",
};

export const getStatusColor = (status) => statusColors[status] || "#808080";
