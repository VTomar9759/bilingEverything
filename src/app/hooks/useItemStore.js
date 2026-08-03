import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setItems } from "../store/slices/itemSlice";
import { getItems } from "../../services/itemService";
import { setCategories } from "../store/slices/itemsCategorySlices";

const useItemStore = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const items = useSelector((state) => state?.itemSlice);
  const { userId } = useSelector((state) => state?.authSlice);

  useEffect(() => {
    const fetchCatalog = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await getItems(userId);
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

    if (userId && items?.length === 0) {
      fetchCatalog();
    }
  }, [userId, items?.length, dispatch]);

  return [items, loading];
};

export default useItemStore;
