export const calculateCartTotals = (items, discount = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const totalAmount = Math.max(subtotal - discount, 0);

    return { subtotal, totalAmount };
};
