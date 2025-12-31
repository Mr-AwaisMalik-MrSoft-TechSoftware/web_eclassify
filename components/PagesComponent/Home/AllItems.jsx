import ProductCard from "@/components/Common/ProductCard";
import NoData from "@/components/EmptyStates/NoData";
import AllItemsSkeleton from "@/components/PagesComponent/Home/AllItemsSkeleton";
import { Button } from "@/components/ui/button";
import { resetBreadcrumb } from "@/redux/reducer/breadCrumbSlice";
import { CurrentLanguageData } from "@/redux/reducer/languageSlice";
import { t } from "@/utils";
import { allItemApi } from "@/utils/api";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const AllItems = ({ cityData, KmRange }) => {
  const dispatch = useDispatch();
  const CurrentLanguage = useSelector(CurrentLanguageData);

  const [AllItem, setAllItem] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);

  const getAllItemData = async (page) => {
    if (page === 1) setIsLoading(true);

    try {
      const params = { page };

      if (Number(KmRange) > 0) {
        params.radius = KmRange;
        params.latitude = cityData.lat;
        params.longitude = cityData.long;
      } else {
        if (cityData?.areaId) params.area_id = cityData.areaId;
        else if (cityData?.city) params.city = cityData.city;
        else if (cityData?.state) params.state = cityData.state;
        else if (cityData?.country) params.country = cityData.country;
      }

      const response = await allItemApi.getItems(params);

      const items = response?.data?.data?.data || [];
      if (!items || items.length === 0) {
        if (page === 1) setAllItem([]);
        setHasMore(false);
        return;
      }

      if (page === 1) setAllItem(items);
      else setAllItem((prevData) => [...prevData, ...items]);

      const current = response?.data?.data?.current_page;
      const last = response?.data?.data?.last_page;
      setHasMore(current < last);
      setCurrentPage(current);
    } catch (error) {
      console.error("Error fetching all items:", error);
    } finally {
      setIsLoading(false);
      setIsLoadMore(false);
    }
  };

  useEffect(() => {
    getAllItemData(1);
  }, [cityData.lat, cityData.long, KmRange, CurrentLanguage?.id]);

  useEffect(() => {
    dispatch(resetBreadcrumb());
  }, []);

  const handleLoadMore = () => {
    setIsLoadMore(true);
    getAllItemData(currentPage + 1);
  };

  const handleLikeAllData = (id) => {
    setAllItem((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_liked: !item.is_liked } : item))
    );
  };

  return (
    <section className="container mt-12">
      <h5 className="text-xl sm:text-2xl font-medium">{t("allItems")}</h5>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mt-6">
        {isLoading ? (
          <AllItemsSkeleton />
        ) : AllItem && AllItem.length > 0 ? (
          AllItem.map((item) => (
            <ProductCard key={item.id} item={item} handleLike={handleLikeAllData} />
          ))
        ) : (
          <div className="col-span-full">
            <NoData name={t("advertisement")} />
          </div>
        )}
      </div>

      {AllItem.length > 0 && hasMore && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            className="text-sm sm:text-base text-primary w-[256px]"
            disabled={isLoading || isLoadMore}
            onClick={handleLoadMore}
          >
            {isLoadMore ? t("loading") : t("loadMore")}
          </Button>
        </div>
      )}
    </section>
  );
};

export default AllItems;
