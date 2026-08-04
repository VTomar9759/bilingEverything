import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setItems } from "../store/slices/itemSlice";
import { getItems } from "../../services/itemService";
import { setCategories } from "../store/slices/itemsCategorySlices";

const useItemStore = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const items = useSelector((state) => state?.itemSlice);
  const { org_id, userId } = useSelector((state) => state?.authSlice || {});
  const activeOrgId = org_id || userId;

  useEffect(() => {
    const fetchCatalog = async () => {
      if (!activeOrgId) return;
      setLoading(true);
      try {
        const data = await getItems(activeOrgId);
        dispatch(setItems(data || []));
        const categories = [
          ...new Set(
            data?.filter((item) => item.category).map((item) => item.category),
          ),
        ];
        dispatch(setCategories(categories || []));
      } catch (err) {
        console.error("useItemStore error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (activeOrgId && items?.length === 0) {
      fetchCatalog();
    }
  }, [activeOrgId, items?.length, dispatch]);

  return [items, loading];
};

export default useItemStore;
