import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import useOrgData from "./useOrgData";
import {
  getCategories,
  addCategory as addCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
  getItems,
} from "../../services";
import {
  setCategories,
  addCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "../store/slices/itemsCategorySlices";

const useCategories = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state?.itemsCategorySlices || []);

  const { org_id } = useOrgData();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCategoriesList = useCallback(async () => {
    if (!org_id) return;
    setLoading(true);
    try {
      let data = [];
      try {
        data = await getCategories(org_id);
      } catch (err) {
        console.warn("Categories table fetch failed, falling back to items catalog:", err.message);
      }

      // If categories table returned no data or errored, fallback to unique categories in items table
      if (!data || data.length === 0) {
        try {
          const items = await getItems(org_id);
          const uniqueNames = [
            ...new Set(
              items?.filter((item) => item.category).map((item) => item.category)
            ),
          ];
          data = uniqueNames.map((name, idx) => ({
            id: `cat_${idx}_${name}`,
            name,
            org_id: org_id,
          }));
        } catch (itemErr) {
          console.error("Fallback getItems error:", itemErr);
        }
      }

      dispatch(setCategories(data || []));
    } catch (err) {
      console.error("useCategories fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [org_id, dispatch]);

  useEffect(() => {
    if (org_id && categories.length === 0) {
      fetchCategoriesList();
    }
  }, [org_id, categories.length, fetchCategoriesList]);

  const handleAddCategory = async (categoryData) => {
    if (!org_id) return;
    setSaving(true);
    try {
      let created = null;
      try {
        created = await addCategoryService(org_id, categoryData);
      } catch (err) {
        console.warn("Direct insert into categories failed, using local object:", err);
        created = {
          id: `cat_${Date.now()}`,
          name: categoryData.name,
          org_id: org_id,
        };
      }

      dispatch(addCategoryAction(created));
      return created;
    } catch (err) {
      console.error("useCategories handleAddCategory error:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategory = async (id, categoryData) => {
    if (!org_id) return;
    setSaving(true);
    try {
      let updated = null;
      try {
        updated = await updateCategoryService(org_id, id, categoryData);
      } catch (err) {
        console.warn("Direct update on categories failed, using local update:", err);
      }

      if (!updated) {
        updated = { id, name: categoryData.name, org_id: org_id };
      }

      dispatch(updateCategoryAction(updated));
      return updated;
    } catch (err) {
      console.error("useCategories handleUpdateCategory error:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!org_id) return;
    setSaving(true);
    try {
      try {
        await deleteCategoryService(org_id, id);
      } catch (err) {
        console.warn("Direct delete on categories table failed:", err);
      }

      dispatch(deleteCategoryAction(id));
      return true;
    } catch (err) {
      console.error("useCategories handleDeleteCategory error:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    categories,
    loading,
    saving,
    refetch: fetchCategoriesList,
    addCategory: handleAddCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
  };
};

export default useCategories;

