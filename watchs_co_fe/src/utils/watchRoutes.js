// Helpers to consistently build or interpret watch detail routes

const normalizeSlug = (slug) => {
  if (slug === undefined || slug === null) return "";
  return String(slug).trim();
};

export const buildWatchDetailPath = (watchLike) => {
  if (!watchLike) return "/shop";

  const slug = normalizeSlug(watchLike.slug);
  if (slug && slug.toLowerCase() !== "null" && slug.toLowerCase() !== "undefined") {
    return `/shop/${slug}`;
  }

  const id = watchLike.id ?? watchLike.watch_id;
  if (id) {
    return `/shop/id-${id}`;
  }

  return "/shop";
};

export const parseWatchSlugParam = (param) => {
  const slugParam = normalizeSlug(param);
  if (!slugParam || slugParam === "null" || slugParam === "undefined") {
    return { type: "invalid" };
  }

  if (slugParam.startsWith("id-")) {
    const id = slugParam.slice(3);
    return id ? { type: "id", value: id } : { type: "invalid" };
  }

  return { type: "slug", value: slugParam };
};
