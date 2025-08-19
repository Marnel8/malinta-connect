import { v2 as cloudinary } from 'cloudinary';

// Server-side Cloudinary configuration
export const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
};

// Configure Cloudinary for server-side operations
if (cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret) {
  cloudinary.config(cloudinaryConfig);
  console.log('Cloudinary configured successfully for server-side operations');
} else {
  console.warn('Cloudinary configuration incomplete:', {
    cloud_name: !!cloudinaryConfig.cloud_name,
    api_key: !!cloudinaryConfig.api_key,
    api_secret: !!cloudinaryConfig.api_secret
  });
}

// Types for Cloudinary responses
export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
  created_at: string;
  bytes: number;
  etag: string;
  placeholder: boolean;
  version_id: string;
  tags: string[];
  folder: string;
  original_filename: string;
}

export interface CloudinaryDeleteResponse {
  result: string;
  deleted: Record<string, string>;
  partial: boolean;
}

// Utility functions for image transformations
export const getCloudinaryUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
    format?: string;
    effect?: string;
    radius?: number;
    gravity?: string;
    overlay?: string;
    underlay?: string;
    transformation?: string;
  } = {}
): string => {
  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload`;
  
  const transformations = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  if (options.effect) transformations.push(`e_${options.effect}`);
  if (options.radius) transformations.push(`r_${options.radius}`);
  if (options.gravity) transformations.push(`g_${options.gravity}`);
  if (options.overlay) transformations.push(`l_${options.overlay}`);
  if (options.underlay) transformations.push(`u_${options.underlay}`);
  if (options.transformation) transformations.push(options.transformation);
  
  const transformationString = transformations.length > 0 ? transformations.join(',') + '/' : '';
  
  return `${baseUrl}/${transformationString}${publicId}`;
};

// Server-side upload function
export const uploadToCloudinary = async (
  file: Buffer | string,
  options: {
    folder?: string;
    public_id?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    allowed_formats?: string[];
    transformation?: any;
    tags?: string[];
  } = {}
): Promise<CloudinaryUploadResponse> => {
  try {
    const uploadOptions = {
      folder: options.folder || 'malinta-connect',
      resource_type: options.resource_type || 'auto',
      ...options,
    };

    let result;
    
    if (Buffer.isBuffer(file)) {
      // For Buffer data, convert to base64 data URL
      // Since we're uploading images for officials, use image/jpeg as default
      const base64String = `data:image/jpeg;base64,${file.toString('base64')}`;
      result = await cloudinary.uploader.upload(base64String, uploadOptions);
    } else {
      // For file path strings
      result = await cloudinary.uploader.upload(file, uploadOptions);
    }
    
    if (!result) {
      throw new Error('Upload failed - no result returned from Cloudinary');
    }
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      width: result.width,
      height: result.height,
      resource_type: result.resource_type,
      created_at: result.created_at,
      bytes: result.bytes,
      etag: result.etag,
      placeholder: result.placeholder,
      version_id: result.version_id,
      tags: result.tags || [],
      folder: result.folder,
      original_filename: result.original_filename,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    console.error('File type:', typeof file);
    console.error('Is Buffer:', Buffer.isBuffer(file));
    if (Buffer.isBuffer(file)) {
      console.error('Buffer length:', file.length);
    }
    throw new Error('Failed to upload file to Cloudinary');
  }
};

// Server-side delete function
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<CloudinaryDeleteResponse> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    
    return {
      result: result.result,
      deleted: result.deleted || {},
      partial: result.partial || false,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

// Generate signed upload preset for client-side uploads
export const generateUploadSignature = (params: {
  timestamp: number;
  folder?: string;
  public_id?: string;
  resource_type?: string;
}) => {
  const signature = cloudinary.utils.api_sign_request(
    {
      folder: params.folder || 'malinta-connect',
      ...params,
    },
    cloudinaryConfig.api_secret!
  );
  
  return {
    signature,
    timestamp: params.timestamp,
    apiKey: cloudinaryConfig.api_key,
    cloudName: cloudinaryConfig.cloud_name,
  };
};

// Client-side upload configuration (for use in components)
export const getClientUploadConfig = () => ({
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  folder: 'malinta-connect',
});

// Common image transformations
export const imageTransformations = {
  thumbnail: (width: number = 150, height: number = 150) => 
    `w_${width},h_${height},c_fill,g_auto`,
  
  responsive: (maxWidth: number = 1200) => 
    `w_auto,c_scale,w_${maxWidth}`,
  
  avatar: (size: number = 100) => 
    `w_${size},h_${size},c_fill,g_face,r_max`,
  
  card: (width: number = 400, height: number = 300) => 
    `w_${width},h_${height},c_fill,g_auto`,
  
  hero: (width: number = 1200, height: number = 600) => 
    `w_${width},h_${height},c_fill,g_auto`,
};

// Test Cloudinary connection
export const testCloudinaryConnection = async (): Promise<boolean> => {
  try {
    // Try to get account info to test connection
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection test successful:', result);
    return true;
  } catch (error) {
    console.error('Cloudinary connection test failed:', error);
    return false;
  }
};

// Export the configured cloudinary instance for direct use
export { cloudinary };

// Default export for convenience
export default {
  config: cloudinaryConfig,
  upload: uploadToCloudinary,
  delete: deleteFromCloudinary,
  generateSignature: generateUploadSignature,
  getClientConfig: getClientUploadConfig,
  transformations: imageTransformations,
  getUrl: getCloudinaryUrl,
  testConnection: testCloudinaryConnection,
};
