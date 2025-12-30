import { cn } from "@/lib/utils";
import { Loader2, Minus, Plus } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { t } from "@/utils";
import CategoryNode from "./CategoryNode";
import { categoryApi } from "@/utils/api";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getCurrentLangCode } from "@/redux/reducer/languageSlice";
import { useNavigate } from "../Common/useNavigate";

const FilterTree = ({ extraDetails }) => {
  const { navigate } = useNavigate();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const langId = useSelector(getCurrentLangCode);
  const [categories, setCategories] = useState({
    data: [],
    currentPage: 1,
    hasMore: false,
    isLoading: false,
    isLoadMore: false,
    expanded: false,
  });
  const selectedSlug = searchParams.get("category") || "";
  const isSelected = !selectedSlug; // "All" category is selected when no category is selected

  useEffect(() => {
    fetchCategories();
  }, [langId]);

  const fetchCategories = async (page = 1) => {
    try {
      page > 1
        ? setCategories((prev) => ({ ...prev, isLoadMore: true }))
        : setCategories((prev) => ({ ...prev, isLoading: true }));

      const response = await categoryApi.getCategory({ page: page });
      const newData = response?.data?.data?.data ?? [];
      const currentPage = response?.data?.data?.current_page;
      const lastPage = response?.data?.data?.last_page;
      setCategories((prev) => ({
        ...prev,
        data: page > 1 ? [...prev.data, ...newData] : newData,
        currentPage,
        hasMore: lastPage > currentPage,
        expanded: true,
      }));
    } catch (error) {
      console.log(error);
    } finally {
      setCategories((prev) => ({
        ...prev,
        isLoading: false,
        isLoadMore: false,
      }));
    }
  };

  const handleToggleExpand = () => {
    setCategories((prev) => ({ ...prev, expanded: !prev.expanded }));
  };

  const handleClick = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    Object.keys(extraDetails || {})?.forEach((key) => {
      params.delete(key);
    });

    if (pathname.startsWith("/ads")) {
      window.history.pushState(null, "", `/ads?${params.toString()}`);
    } else {
      navigate(`/ads?${params.toString()}`);
    }
  };

  return (
    <ul>
      <li>
        <div className="flex items-center rounded text-sm">
          {categories?.isLoading ? (
            <Loader2 className="size-[14px] animate-spin text-muted-foreground" />
          ) : (
            <button
              className="text-sm p-1 hover:bg-muted rounded-sm"
              onClick={handleToggleExpand}
            >
              {categories.expanded ? <Minus size={14} /> : <Plus size={14} />}
            </button>
          )}

          <button
            onClick={handleClick}
            className={cn(
              "flex-1 ltr:text-left rtl:text-right py-1 px-2 rounded-sm",
              isSelected && "border bg-muted"
            )}
          >
            {t("allCategories")}
          </button>
        </div>
        {categories.expanded && categories.data.length > 0 && (
          <ul className="ltr:ml-3 rtl:mr-3 ltr:border-l rtl:border-r ltr:pl-2 rtl:pr-2 space-y-1">
            {categories.data.map((category) => (
              <CategoryNode
                key={category.id}
                category={category}
                extraDetails={extraDetails}
              />
            ))}

            {categories.hasMore && (
              <button
                onClick={() => fetchCategories(categories.currentPage + 1)}
                className="text-primary text-center text-sm py-1 px-2"
                disabled={categories.isLoadMore}
              >
                {categories.isLoadMore ? t("loading") : t("loadMore")}
              </button>
            )}
          </ul>
        )}
      </li>
    </ul>
  );
};

export default FilterTree;
