import { useState, useCallback } from "react";
import useOrgData from "./useOrgData";
import {
  getOrderById,
  updateOrderItems,
  editOrderStatus,
  updateOrderDiscount,
  updateOrderPaymentMode,
} from "../../services/orderEditService";

const useOrderEdit = () => {
  const { org_id, userData } = useOrgData();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const hasGst = Boolean(
    userData?.gst_number && String(userData.gst_number).trim().length > 0,
  );

  /**
   * Fetch a single order by ID
   */
  const fetchOrder = useCallback(
    async (orderId) => {
      if (!org_id || !orderId) return null;
      setLoading(true);
      try {
        const data = await getOrderById(org_id, orderId);
        setOrder(data);
        return data;
      } catch (err) {
        console.error("useOrderEdit fetchOrder error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [org_id],
  );

  /**
   * Edit items on an existing order
   * @param {string} orderId
   * @param {Array} items - Array of { id, name, price, quantity, category, gst_status, tax }
   */
  const editItems = useCallback(
    async (orderId, items) => {
      if (!org_id || !orderId) return null;
      try {
        const subtotal = items.reduce(
          (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
          0,
        );

        const tax = items.reduce((acc, item) => {
          const isItemGst =
            hasGst &&
            item.gst_status !== false &&
            String(item.gst_status) !== "false";
          const itemSubtotal = Number(item.price || 0) * Number(item.quantity || 0);
          return acc + (isItemGst ? itemSubtotal * 0.05 : 0);
        }, 0);

        const total = subtotal + tax;

        const updatedOrder = await updateOrderItems(org_id, orderId, {
          items,
          subtotal,
          tax,
          total,
        });

        if (updatedOrder) {
          setOrder(updatedOrder);
        }
        return updatedOrder;
      } catch (err) {
        console.error("useOrderEdit editItems error:", err);
        throw err;
      }
    },
    [org_id, hasGst],
  );

  /**
   * Update order status
   */
  const updateStatus = useCallback(
    async (orderId, status) => {
      if (!org_id || !orderId) return null;
      try {
        const updatedOrder = await editOrderStatus(org_id, orderId, status);
        if (updatedOrder) {
          setOrder(updatedOrder);
        }
        return updatedOrder;
      } catch (err) {
        console.error("useOrderEdit updateStatus error:", err);
        throw err;
      }
    },
    [org_id],
  );

  /**
   * Update discount on an order and recalculate totals
   * @param {string} orderId
   * @param {number} discountPercent - e.g. 10 for 10%
   */
  const updateDiscount = useCallback(
    async (orderId, discountPercent) => {
      if (!org_id || !orderId || !order) return null;
      try {
        const subtotal = Number(order.subtotal || 0);
        const discount = subtotal * (Number(discountPercent || 0) / 100);
        const discountFactor = 1 - Number(discountPercent || 0) / 100;

        const tax = hasGst
          ? (order.items || []).reduce((sum, item) => {
              const isItemGst =
                item.gst_status !== false &&
                String(item.gst_status) !== "false";
              if (!isItemGst) return sum;
              const itemAmount =
                Number(item.price || 0) *
                Number(item.quantity || 0) *
                discountFactor;
              return sum + itemAmount * 0.05;
            }, 0)
          : 0;

        const total = subtotal - discount + tax;

        const updatedOrder = await updateOrderDiscount(org_id, orderId, {
          discount,
          subtotal,
          tax,
          total,
        });

        if (updatedOrder) {
          setOrder(updatedOrder);
        }
        return updatedOrder;
      } catch (err) {
        console.error("useOrderEdit updateDiscount error:", err);
        throw err;
      }
    },
    [org_id, order, hasGst],
  );

  /**
   * Update order payment mode and payment status
   * @param {string} orderId
   * @param {Object} paymentData - { payment_mode, payment_status, payment_method }
   */
  const updatePaymentMode = useCallback(
    async (orderId, { payment_mode, payment_status, payment_method }) => {
      if (!org_id || !orderId) return null;
      try {
        const updatedOrder = await updateOrderPaymentMode(org_id, orderId, {
          payment_mode,
          payment_status,
          payment_method,
        });
        if (updatedOrder) {
          setOrder(updatedOrder);
        }
        return updatedOrder;
      } catch (err) {
        console.error("useOrderEdit updatePaymentMode error:", err);
        throw err;
      }
    },
    [org_id],
  );

  return {
    order,
    loading,
    fetchOrder,
    editItems,
    updateStatus,
    updateDiscount,
    updatePaymentMode,
  };
};

export default useOrderEdit;
