export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  let defaultLanguageCode = "en";
  let languages = [];

  try {
    const res = await fetch(
      `${apiUrl}${process.env.NEXT_PUBLIC_END_POINT}get-system-settings`,
      { next: { revalidate: 604800 } } // Revalidate weekly
    );

    if (res.ok) {
      const data = await res.json();
      defaultLanguageCode = data?.data?.default_language || "en";
      languages = data?.data?.languages || [];
    }
  } catch (error) {
    console.error("Error fetching languages for sitemap:", error);
    return [];
  }

  const publicRoutes = [
    "about-us",
    "ads",
    "blogs",
    "contact-us",
    "faqs",
    "landing",
    "privacy-policy",
    "refund-policy",
    "subscription",
    "terms-and-condition",
  ];

  const buildHreflangLinks = (url) => {
    const links = {};
    languages.forEach((lang) => {
      links[lang.code] = `${url}?lang=${lang.code}`;
    });
    // Add x-default
    links["x-default"] = `${url}?lang=${defaultLanguageCode}`;
    return { languages: links };
  };

  const staticSitemapEntries = publicRoutes.map((route) => {
    const url = `${baseUrl}/${route}`;
    return {
      url: url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: buildHreflangLinks(url),
    };
  });

  // Add the base URL entry
  const baseEntry = {
    url: `${baseUrl}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
    alternates: buildHreflangLinks(baseUrl),
  };

  // Fetch only first page of products
  let productEntries = [];
  try {
    const res = await fetch(
      `${apiUrl}${process.env.NEXT_PUBLIC_END_POINT}get-item?page=1`,
      { next: { revalidate: 604800 } } // Revalidate weekly
    );

    if (res.ok) {
      const json = await res.json();
      const products = json?.data?.data || [];
      productEntries = products.map((product) => {
        const url = `${baseUrl}/ad-details/${product?.slug}`;
        return {
          url: url,
          lastModified: new Date(product?.updated_at),
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: buildHreflangLinks(url),
        };
      });
    }
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
  }

  // Fetch only first page of categories
  let categoryEntries = [];
  try {
    const res = await fetch(
      `${apiUrl}${process.env.NEXT_PUBLIC_END_POINT}get-categories?page=1`,
      { next: { revalidate: 604800 } } // Revalidate weekly
    );

    if (res.ok) {
      const json = await res.json();
      const categories = json?.data?.data || [];
      categoryEntries = categories.map((category) => {
        const url = `${baseUrl}/ads?category=${category?.slug}`;
        return {
          url: url,
          lastModified: new Date(category?.updated_at),
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: buildHreflangLinks(url),
        };
      });
    }
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
  }

  // Fetch only first page of blogs
  let blogEntries = [];
  try {
    const res = await fetch(
      `${apiUrl}${process.env.NEXT_PUBLIC_END_POINT}blogs?page=1`,
      { next: { revalidate: 604800 } } // Revalidate weekly
    );

    if (res.ok) {
      const json = await res.json();
      const blogs = json?.data?.data || [];
      blogEntries = blogs.map((blog) => {
        const url = `${baseUrl}/blogs/${blog?.slug}`;
        return {
          url: url,
          lastModified: new Date(blog?.updated_at),
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: buildHreflangLinks(url),
        };
      });
    }
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error);
  }

  return [
    baseEntry,
    ...staticSitemapEntries,
    ...productEntries,
    ...categoryEntries,
    ...blogEntries,
  ];
}
