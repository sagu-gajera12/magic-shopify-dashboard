const dummyOrder =  {
    purchaseOrderId: '1234567890',
    customerOrderId: '0987654321',
    customerEmailId: 'dummy@walmart.com',
    orderType: 'PREORDER',
    orderDate: Date.now(),
    shippingInfo: {
      phone: '1234567890',
      postalAddress: {
        name: 'John Doe',
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      },
    },
    orderLines: {
      orderLine: [
        {
          lineNumber: '1',
          item: {
            productName: 'Dummy Product',
            sku: 'DUMMY123',
          },
          charges: {
            charge: [
              {
                chargeType: 'PRODUCT',
                chargeAmount: {
                  currency: 'USD',
                  amount: 20,
                },
              },
            ],
          },
          orderLineQuantity: {
            amount: '1',
          },
        },
      ],
    },
  };

export const getDummyOrders = () => [dummyOrder, dummyOrder, dummyOrder, dummyOrder, dummyOrder, dummyOrder];
  