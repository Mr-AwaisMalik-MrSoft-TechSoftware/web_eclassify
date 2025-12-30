import StructuredData from "@/components/Layout/StructuredData";
import SingleFeaturedSection from "@/components/PagesComponent/SingleFeaturedSection/SingleFeaturedSection";
import { generateKeywords } from "@/utils/generateKeywords";

export const generateMetadata = async ({ params, searchParams }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return;
  const { slug } = await params;
  const langCode = (await searchParams).lang || "en";
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-featured-section?slug=${slug}`,
      {
        headers: {
          "Content-Language": langCode || "en",
        },
      }
    );
    const data = await response.json();

    const title = data?.data?.[0]?.translated_name;
    const description = data?.data?.[0]?.translated_description;
    const keywords = generateKeywords(data?.data?.[0]?.translated_name);
    const image = data?.data?.[0]?.image;

    return {
      title: title || process.env.NEXT_PUBLIC_META_TITLE,
      description: description || process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: image ? [image] : [],
      },
      keywords: keywords,
    };
  } catch (error) {
    console.error("Error fetching MetaData:", error);
    return null;
  }
};

const fetchProductItems = async (slug, langCode) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-item?page=1&featured_section_slug=${slug}`,
      {
        headers: {
          "Content-Language": langCode || "en",
        },
      }
    );
    const data = await response.json();
    return data?.data?.data || [];
  } catch (error) {
    console.error("Error fetching Product Items Data:", error);
    return [];
  }
};

const SingleFeaturedSectionPage = async ({ params, searchParams }) => {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const langCode = resolvedSearchParams?.lang || "en";
  const ProductItems = await fetchProductItems(slug, langCode);
  const jsonLd = ProductItems
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: ProductItems.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1, // Position starts at 1
          item: {
            "@type": "Product",
            productID: product?.id,
            name: product?.translated_item?.name,
            description: product?.translated_item?.description,
            image: product?.image,
            url: `${process.env.NEXT_PUBLIC_WEB_URL}/ad-details/${slug}`,
            category: {
              "@type": "Thing",
              name: product?.category?.translated_name,
            },
            offers: {
              "@type": "Offer",
              price: product?.price,
              priceCurrency: "USD",
            },
            countryOfOrigin: product?.translated_item?.country,
          },
        })),
      }
    : null;

  return (
    <>
      <StructuredData data={jsonLd} />
      <SingleFeaturedSection slug={slug} />
    </>
  );
};

export default SingleFeaturedSectionPage;
