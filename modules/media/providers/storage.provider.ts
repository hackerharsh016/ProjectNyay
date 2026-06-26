export class StorageProvider {
  /**
   * Generates a mock presigned URL for an R2/S3 upload.
   */
  static async getPresignedUploadUrl(filename: string, _contentType: string) {
    const storageKey = `uploads/${Date.now()}_${filename.replace(/\s+/g, "_")}`;
    return {
      uploadUrl: `https://mock-r2-bucket.cloudflare.com/upload/${storageKey}?signature=mock`,
      storageKey,
    };
  }
}
