import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CurrentLanguageData } from "@/redux/reducer/languageSlice";
import {
  CategoryData,
  CurrentPage,
  IsLoading,
  IsLoadMore,
  LastPage,
  setCatCurrentPage,
  setCateData,
  setCatLastPage,
  setIsLoading,
  setIsLoadMore,
} from "@/redux/reducer/categorySlice";
import { categoryApi } from "@/utils/api"; // assume you have this
import { usePathname } from "next/navigation";

const useHomeCategories = ({ skipInitialLoad = false } = {}) => {
  
  const pathname = usePathname();
  const dispatch = useDispatch();
  const CurrentLanguage = useSelector(CurrentLanguageData);

  const cateData = useSelector(CategoryData);
  const isLoading = useSelector(IsLoading);
  const isLoadMore = useSelector(IsLoadMore);
  const lastPage = useSelector(LastPage);
  const currentPage = useSelector(CurrentPage);

  const isInitialMount = useRef(true);

  const getCategories = async (page = 1) => {
    if (page === 1) {
      dispatch(setIsLoading(true));
    } else {
      dispatch(setIsLoadMore(true));
    }

    try {
      const res = await categoryApi.getCategory({ page });
      if (res?.data?.error === false) {
        const data = res?.data?.data?.data;
        if (page === 1) {
          dispatch(setCateData(data));
        } else {
          dispatch(setCateData([...cateData, ...data]));
        }
        dispatch(setCatCurrentPage(res?.data?.data?.current_page));
        dispatch(setCatLastPage(res?.data?.data?.last_page));
      }
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setIsLoading(false));
      dispatch(setIsLoadMore(false));
    }
  };

  // Initial load only in the header or when skipInitialLoad is false
  useEffect(() => {
    if (pathname === "/") {
      // Home page: fetch if not skipping initial load
      if (!skipInitialLoad) {
        getCategories(1);
      }
    } else {
      // Other pages:
      // 1. Initial mount + cateData empty → fetch
      // 2. Subsequent language changes → fetch
      if (
        (isInitialMount.current && cateData.length === 0) ||
        !isInitialMount.current
      ) {
        getCategories(1);
      }
    }

    // Mark initial mount as done after first render
    isInitialMount.current = false;
  }, [CurrentLanguage?.id, pathname]);

  return {
    cateData,
    isLoading,
    isLoadMore,
    lastPage,
    currentPage,
    getCategories, // expose this for load more
  };
};

export default useHomeCategories;
