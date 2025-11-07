/** Helper para obtener URL de Cloudinary */
export const getCloudinaryUrl = (asset) => {
  if (!asset) return "";
  if (Array.isArray(asset)) return getCloudinaryUrl(asset[0]);
  if (typeof asset === "string" && /^https?:\/\//i.test(asset)) return asset;

  if (typeof asset === "object" && asset !== null) {
    if (asset.secure_url) return asset.secure_url;
    if (asset.url) return asset.url;

    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const public_id = asset.public_id || asset.filename;
    const fmt = (asset.format || "").toLowerCase();
    if (cloud && public_id) {
      const rt = asset.resource_type || "image";
      const suffix = fmt ? `.${fmt}` : "";
      return `https://res.cloudinary.com/${cloud}/${rt}/upload/${public_id}${suffix}`;
    }
  }

  if (typeof asset === "string") {
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloud) return "";
    return `https://res.cloudinary.com/${cloud}/image/upload/${asset}`;
  }

  return "";
};