import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  getOrders,
  createOrder as apiCreateOrder,
  updateOrderStatus as apiUpdateOrderStatus,
} from "../../services";

const useOrders = ({
  page = 1,
  limit = 30,
  startDate,
  endDate,
  status,
} = {}) => {
  const { userId } = useSelector((state) => state?.authSlice || {});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getOrders({ userId, page, limit, startDate, endDate, status });
      setOrders(data || []);
      setTotal(data?.total || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error("useOrders error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, page, limit, startDate, endDate, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (orderData) => {
    if (!userId) return;
    try {
      const newOrder = await apiCreateOrder(userId, orderData);
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      console.error("useOrders error creating:", err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!userId) return;
    try {
      const updatedOrder = await apiUpdateOrderStatus(userId, orderId, status);
      if (updatedOrder) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...updatedOrder } : o))
        );
      }
      return updatedOrder;
    } catch (err) {
      console.error("useOrders error updating status:", err);
      throw err;
    }
  };


  return {
    orders,
    loading,
    total,
    totalPages,
    refetch: fetchOrders,
    createOrder,
    updateOrderStatus,

  };
};

export default useOrders;
