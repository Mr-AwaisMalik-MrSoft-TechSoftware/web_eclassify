import Layout from "@/components/Layout/Layout";
import StructuredData from "@/components/Layout/StructuredData";
import Home from "@/components/PagesComponent/Home/Home";

export const dynamic = "force-dynamic";

// ============================
// Generate SEO Metadata
// ============================
export const generateMetadata = async ({ searchParams }) => {
  const langCode = (await searchParams)?.lang || "en";

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}/seo-settings?page=home`;
    console.log("MetaData fetch URL:", url);

    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Content-Language": langCode },
    });

    if (!res.ok) throw new Error(`Failed to fetch SEO metadata: HTTP ${res.status}`);
    const data = await res.json();
    const home = data?.data?.[0];

    return {
      title: home?.translated_title || process.env.NEXT_PUBLIC_META_TITLE,
      description: home?.translated_description || process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: { images: home?.image ? [home?.image] : [] },
      keywords: home?.translated_keywords || process.env.NEXT_PUBLIC_META_kEYWORDS,
    };
  } catch (error) {
    console.error("Error fetching MetaData:", error);
    return null;
  }
};

// ============================
// Fetch Categories
// ============================
const fetchCategories = async (langCode) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}/get-categories?page=1`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Content-Language": langCode },
    });

    if (!res.ok) throw new Error(`Failed to fetch categories: HTTP ${res.status}`);
    const data = await res.json();

    return data?.data?.data || [];
  } catch (error) {
    console.error("Error fetching Categories Data:", error);
    return [];
  }
};

// ============================
// Fetch Product Items
// ============================
const fetchProductItems = async (langCode) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}/get-item?page=1`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Content-Language": langCode },
    });

    if (!res.ok) throw new Error(`Failed to fetch product items: HTTP ${res.status}`);
    const data = await res.json();

    return data?.data?.data || [];
  } catch (error) {
    console.error("Error fetching Product Items Data:", error);
    return [];
  }
};

// ============================
// Fetch Featured Sections
// ============================
const fetchFeaturedSections = async (langCode) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}/get-featured-section`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Content-Language": langCode },
    });

    if (!res.ok) throw new Error(`Failed to fetch featured sections: HTTP ${res.status}`);
    const data = await res.json();

    return data?.data || [];
  } catch (error) {
    console.error("Error fetching Featured Sections Data:", error);
    return [];
  }
};

// ============================
// Home Page Component
// ============================
export default async function HomePage({ searchParams }) {
  const langCode = (await searchParams)?.lang || "en";

  // Fetch all data in parallel
  const [categoriesData, productItemsData, featuredSectionsData] = await Promise.all([
    fetchCategories(langCode),
    fetchProductItems(langCode),
    fetchFeaturedSections(langCode),
  ]);

  // Deduplicate featured items
  const existingSlugs = new Set(productItemsData.map((product) => product.slug));
  const featuredItems = [];
  featuredSectionsData.forEach((section) => {
    (section.section_data || []).slice(0, 4).forEach((item) => {
      if (!existingSlugs.has(item.slug)) {
        featuredItems.push(item);
        existingSlugs.add(item.slug);
      }
    });
  });

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      ...categoriesData.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Thing",
          name: category?.translated_name,
          url: `${process.env.NEXT_PUBLIC_WEB_URL}/ads?category=${category?.slug}`,
        },
      })),
      ...productItemsData.map((product, index) => ({
        "@type": "ListItem",
        position: categoriesData.length + index + 1,
        item: {
          "@type": "Product",
          name: product?.translated_item?.name,
          productID: product?.id,
          description: product?.translated_item?.description,
          image: product?.image,
          url: `${process.env.NEXT_PUBLIC_WEB_URL}/ad-details/${product?.slug}`,
          category: product?.category?.translated_name,
          ...(product?.price && { offers: { "@type": "Offer", price: product?.price, priceCurrency: "USD" } }),
          countryOfOrigin: product?.translated_item?.country,
        },
      })),
      ...featuredItems.map((item, index) => ({
        "@type": "ListItem",
        position: categoriesData.length + productItemsData.length + index + 1,
        item: {
          "@type": "Product",
          name: item?.translated_item?.name,
          productID: item?.id,
          description: item?.translated_item?.description,
          image: item?.image,
          url: `${process.env.NEXT_PUBLIC_WEB_URL}/ad-details/${item?.slug}`,
          category: item?.category?.translated_name,
          ...(item?.price && { offers: { "@type": "Offer", price: item?.price, priceCurrency: "USD" } }),
          countryOfOrigin: item?.translated_item?.country,
        },
      })),
    ],
  };

  return (
    <>
      <StructuredData data={jsonLd} />
      <Layout>
        <Home productItemsData={productItemsData} />
      </Layout>
    </>
  );
}
