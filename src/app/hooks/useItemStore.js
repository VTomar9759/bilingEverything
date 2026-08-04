import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setItems } from "../store/slices/itemSlice";
import { getItems } from "../../services/itemService";
import { setCategories } from "../store/slices/itemsCategorySlices";

const useItemStore = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const items = useSelector((state) => state?.itemSlice);
  const { org_id } = useSelector((state) => state?.authSlice || {});

  useEffect(() => {
    const fetchCatalog = async () => {
      if (!org_id) return;
      setLoading(true);
      try {
        const data = await getItems(org_id);
        dispatch(setItems(data || []));
      } catch (err) {
        console.error("useItemStore error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (org_id && items?.length === 0) {
      fetchCatalog();
    }
  }, [org_id, items?.length, dispatch]);

  return [items, loading];
};

export default useItemStore;
