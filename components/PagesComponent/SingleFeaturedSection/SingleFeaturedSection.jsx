"use client";
import NoData from "@/components/EmptyStates/NoData";
import { allItemApi, FeaturedSectionApi } from "@/utils/api";
import { useEffect, useState } from "react";
import AllItemsSkeleton from "../Home/AllItemsSkeleton";
import HorizontalListSkeleton from "../../Common/HorizontalListSkeleton";
import ProductCard from "@/components/Common/ProductCard";
import ProductHorizontalCard from "@/components/Common/ProductHorizontalCard";
import { t } from "@/utils";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout/Layout";
import { CurrentLanguageData } from "@/redux/reducer/languageSlice";
import { useSelector } from "react-redux";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import ToggleView from "./ToggleView";
import { useSearchParams } from "next/navigation";

const SingleFeaturedSection = ({ slug }) => {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "grid";
  const CurrentLanguage = useSelector(CurrentLanguageData);
  const [featuredTitle, setFeaturedTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [itemsData, setItemsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [IsLoadMore, setIsLoadMore] = useState(false);

  const fetchFeaturedSectionData = async () => {
    try {
      const response = await FeaturedSectionApi.getFeaturedSections({
        slug: slug,
      });

      if (response?.data?.error === false) {
        setFeaturedTitle(
          response?.data?.data?.[0]?.translated_name ||
            response?.data?.data?.[0]?.title
        );
      } else {
        console.error(response?.data?.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchItemsData = async (page) => {
    try {
      const res = await allItemApi.getItems({
        featured_section_slug: slug,
        page: page,
      });
      if (res?.data?.error === false) {
        page === 1
          ? setItemsData(res?.data?.data?.data)
          : setItemsData((prevItems) => [
              ...prevItems,
              ...res?.data?.data?.data,
            ]);
        setCurrentPage(res?.data?.data?.current_page);
        setHasMore(
          Number(res?.data?.data?.current_page) <
            Number(res?.data?.data?.last_page)
        );
      } else {
        console.error(res?.data?.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoadMore(false);
    }
  };

  useEffect(() => {
    if (slug) {
      const fetchAllData = async () => {
        setIsLoading(true);
        try {
          await Promise.all([fetchFeaturedSectionData(), fetchItemsData(1)]);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAllData();
    }
  }, [slug, CurrentLanguage?.id]);

  const handleLike = (id) => {
    const updatedItems = itemsData.map((item) => {
      if (item.id === id) {
        return { ...item, is_liked: !item.is_liked };
      }
      return item;
    });
    setItemsData(updatedItems);
  };

  return (
    <Layout>
      <BreadCrumb title2={featuredTitle} />

      <div className="container">
        <div className="space-between gap-2 mt-8">
          <h1 className="text-xl sm:text-2xl font-medium">{featuredTitle}</h1>
          <ToggleView view={view} searchParams={searchParams} />
        </div>

        {isLoading ? (
          view === "grid" ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mt-8">
              <AllItemsSkeleton />
            </div>
          ) : (
            <HorizontalListSkeleton />
          )
        ) : itemsData && itemsData.length > 0 ? (
          view === "grid" ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mt-8">
              {itemsData?.map((item) => (
                <ProductCard
                  key={item?.id}
                  item={item}
                  handleLike={handleLike}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-4">
              {itemsData?.map((item) => (
                <ProductHorizontalCard
                  key={item?.id}
                  item={item}
                  handleLike={handleLike}
                />
              ))}
            </div>
          )
        ) : (
          <div className="col-span-full">
            <NoData name={t("advertisement")} />
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsLoadMore(true);
                fetchItemsData(currentPage + 1);
              }}
              disabled={isLoading || IsLoadMore}
              className="text-sm sm:text-base text-primary w-[256px]"
            >
              {IsLoadMore ? t("loading") : t("loadMore")}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SingleFeaturedSection;
