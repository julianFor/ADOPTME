/** Helper para obtener URL de Cloudinary */
const handleObjectAsset = (asset) => {
  if (asset.secure_url) return asset.secure_url;
  if (asset.url) return asset.url;

  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const public_id = asset.public_id || asset.filename;
  if (!cloud || !public_id) return "";

  const rt = asset.resource_type || "image";
  const fmt = (asset.format || "").toLowerCase();
  const suffix = fmt ? `.${fmt}` : "";
  return `https://res.cloudinary.com/${cloud}/${rt}/upload/${public_id}${suffix}`;
};

const handleStringAsset = (asset) => {
  if (/^https?:\/\//i.test(asset)) return asset;
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return "";
  return `https://res.cloudinary.com/${cloud}/image/upload/${asset}`;
};

export const getCloudinaryUrl = (asset) => {
  if (!asset) return "";
  if (Array.isArray(asset)) return getCloudinaryUrl(asset[0]);
  if (typeof asset === "string") return handleStringAsset(asset);
  if (typeof asset === "object" && asset !== null) return handleObjectAsset(asset);
  return "";
};