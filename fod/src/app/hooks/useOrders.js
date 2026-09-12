import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getOrders, createOrder, updateOrderStatus, settleOrder, deleteOrder } from "../../services";

const useOrders = () => {
  const { userId } = useSelector((state) => state?.authSlice || {});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getOrders(userId);
      setOrders(data || []);
    } catch (err) {
      console.error("useOrders error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateOrder = async (orderPayload) => {
    if (!userId) return;
    try {
      const created = await createOrder(userId, orderPayload);
      setOrders((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      console.error("useOrders error creating:", err);
      throw err;
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus) => {
    if (!userId) return;
    try {
      const updated = await updateOrderStatus(userId, orderId, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return updated;
    } catch (err) {
      console.error("useOrders error updating status:", err);
      throw err;
    }
  };

  const handleSettleOrder = async (orderId, paymentMethod, financialDetails = {}) => {
    if (!userId) return;
    try {
      const updated = await settleOrder(userId, orderId, paymentMethod, financialDetails);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return updated;
    } catch (err) {
      console.error("useOrders error settling order:", err);
      throw err;
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!userId) return;
    try {
      await deleteOrder(userId, orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error("useOrders error deleting order:", err);
      throw err;
    }
  };

  return {
    orders,
    loading,
    refetch: fetchOrders,
    createOrder: handleCreateOrder,
    updateOrderStatus: handleUpdateStatus,
    settleOrder: handleSettleOrder,
    deleteOrder: handleDeleteOrder,
  };
};

export default useOrders;
