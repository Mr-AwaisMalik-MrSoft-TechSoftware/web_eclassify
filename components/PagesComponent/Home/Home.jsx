"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AllItems from "./AllItems";
import FeaturedSections from "./FeaturedSections";
import OfferSlider from "./OfferSlider";
import OfferSliderSkeleton from "./OfferSliderSkeleton";
import FeaturedSectionsSkeleton from "./FeaturedSectionsSkeleton";
import PopularCategories from "./PopularCategories";
import { FeaturedSectionApi, sliderApi } from "@/utils/api";
import { getCurrentLangCode } from "@/redux/reducer/languageSlice";
import { getCityData, getKilometerRange } from "@/redux/reducer/locationSlice";

const Home = () => {
  const KmRange = useSelector(getKilometerRange);
  const cityData = useSelector(getCityData);
  const currentLanguageCode = useSelector(getCurrentLangCode);

  const [IsFeaturedLoading, setIsFeaturedLoading] = useState(false);
  const [featuredData, setFeaturedData] = useState([]);
  const [Slider, setSlider] = useState([]);
  const [IsSliderLoading, setIsSliderLoading] = useState(true);

  // Safe check if all featured sections are empty
  const allEmpty = featuredData?.every(
    (ele) => (ele?.section_data || []).length === 0
  );

  // Fetch Slider
  useEffect(() => {
    const fetchSliderData = async () => {
      try {
        const response = await sliderApi.getSlider();
        const sliderArray = response.data?.data || [];
        setSlider(sliderArray);
      } catch (error) {
        console.error("Error fetching slider data:", error);
      } finally {
        setIsSliderLoading(false);
      }
    };
    fetchSliderData();
  }, []);

  // Fetch Featured Sections
  useEffect(() => {
    const fetchFeaturedSectionData = async () => {
      setIsFeaturedLoading(true);
      try {
        const params = {};

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

        const response = await FeaturedSectionApi.getFeaturedSections(params);
        const featuredArray = response.data?.data || [];
        setFeaturedData(featuredArray);
      } catch (error) {
        console.error("Error fetching Featured Sections:", error);
      } finally {
        setIsFeaturedLoading(false);
      }
    };
    fetchFeaturedSectionData();
  }, [cityData.lat, cityData.long, KmRange, currentLanguageCode]);

  return (
    <>
      {IsSliderLoading ? (
        <OfferSliderSkeleton />
      ) : (
        Slider?.length > 0 && <OfferSlider Slider={Slider} IsLoading={IsSliderLoading} />
      )}

      <PopularCategories />

      {IsFeaturedLoading ? (
        <FeaturedSectionsSkeleton />
      ) : (
        <FeaturedSections
          featuredData={featuredData}
          setFeaturedData={setFeaturedData}
          allEmpty={allEmpty}
        />
      )}

      <AllItems cityData={cityData} KmRange={KmRange} />
    </>
  );
};

export default Home;
