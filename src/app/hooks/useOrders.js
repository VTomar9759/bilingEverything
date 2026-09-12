import { useState, useEffect, useCallback } from "react";
import useOrgData from "./useOrgData";
import {
  getOrders,
  createOrder as apiCreateOrder,
  updateOrderStatus as apiUpdateOrderStatus,
  updateOrder as apiUpdateOrder,
} from "../../services";

const useOrders = ({
  page = 1,
  limit = 30,
  startDate,
  endDate,
  status,
} = {}) => {
  const { org_id } = useOrgData();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = useCallback(async () => {
    if (!org_id) return;
    setLoading(true);
    try {
      const data = await getOrders({ org_id, page, limit, startDate, endDate, status });
      setOrders(data || []);
      setTotal(data?.total || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error("useOrders error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [org_id, page, limit, startDate, endDate, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (orderData) => {
    if (!org_id) return;
    try {
      const newOrder = await apiCreateOrder(org_id, orderData);
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      console.error("useOrders error creating:", err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!org_id) return;
    try {
      const updatedOrder = await apiUpdateOrderStatus(org_id, orderId, status);
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

  const updateOrder = async (orderId, orderData) => {
    if (!org_id) return;
    try {
      const updatedOrder = await apiUpdateOrder(org_id, orderId, orderData);
      if (updatedOrder) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...updatedOrder } : o))
        );
      }
      return updatedOrder;
    } catch (err) {
      console.error("useOrders error updating order:", err);
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
    updateOrder,
  };
};

export default useOrders;
