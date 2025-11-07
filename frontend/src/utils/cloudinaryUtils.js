const RAW_EXTENSIONS = /\.(pdf|docx?|xlsx?|pptx?|txt|csv|zip|rar)$/i;
const RAW_FORMATS = /^(pdf|docx?|xlsx?|pptx?|txt|csv|zip|rar)$/i;

const isRawFormat = (format, isFile = false) => {
  if (isFile) {
    return RAW_EXTENSIONS.test(format);
  }
  return RAW_FORMATS.test(format);
};

const getResourceType = (format, isFile = false) => {
  if (isRawFormat(format, isFile)) {
    return 'raw';
  }
  return 'image';
};

const getSuffix = (resourceType, format) => {
  if (resourceType === 'raw') {
    return '';
  }
  return format ? `.${format}` : '';
};

const getCloudinaryUrlFromObject = (asset, cloud) => {
  const { public_id = "", resource_type, format } = asset;
  if (!cloud || !public_id) return "";

  const fmt = (format || "").toLowerCase();
  const rt = resource_type || getResourceType(fmt);
  const suffix = getSuffix(rt, fmt);

  return `https://res.cloudinary.com/${cloud}/${rt}/upload/${public_id}${suffix}`;
};

const getCloudinaryUrlFromString = (asset, cloud) => {
  if (!cloud) return `/uploads/${asset}`;
  const rt = getResourceType(asset, true);
  return `https://res.cloudinary.com/${cloud}/${rt}/upload/${asset}`;
};

/** Helper de respaldo SOLO para registros viejos (string/public_id).
 *  NO modificar secure_url de Cloudinary.
 */
export const getCloudinaryAssetUrl = (asset) => {
  if (!asset) return "";
  
  if (Array.isArray(asset)) {
    return getCloudinaryAssetUrl(asset[0]);
  }

  if (typeof asset === "string" && /^https?:\/\//i.test(asset)) {
    return asset;
  }

  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (typeof asset === "object" && asset !== null) {
    return getCloudinaryUrlFromObject(asset, cloud);
  }

  if (typeof asset === "string") {
    return getCloudinaryUrlFromString(asset, cloud);
  }

  return "";
};

/** Helper para obtener URL de documentos de manera más legible */
export const getDocumentUrl = (doc) => {
  const isValidDoc = doc && typeof doc === 'object' && doc.secure_url;
  return isValidDoc ? doc.secure_url : getCloudinaryAssetUrl(doc);
};