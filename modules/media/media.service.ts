import prisma from "../../src/lib/prisma";
import { StorageProvider } from "./providers/storage.provider";
import { VideoProvider } from "./providers/video.provider";
import { OEmbedProvider } from "./providers/oembed.provider";
import { VideoSourceType, VideoStatus } from "@prisma/client";

export class MediaService {
  static async getUploadUrl(filename: string, contentType: string) {
    return StorageProvider.getPresignedUploadUrl(filename, contentType);
  }

  static async confirmNativeUpload(userId: string, caseId: string, storageKey: string, caption?: string) {
    let video = await prisma.video.create({
      data: {
        caseId,
        uploaderId: userId,
        sourceType: VideoSourceType.NATIVE_UPLOAD,
        storageKey,
        caption,
        status: VideoStatus.PENDING
      }
    });

    // Transition to PROCESSING before handoff
    video = await prisma.video.update({
      where: { id: video.id },
      data: { status: VideoStatus.PROCESSING }
    });

    // Mock processing handoff
    const processed = await VideoProvider.processVideo(storageKey);

    return prisma.video.update({
      where: { id: video.id },
      data: {
        muxAssetId: processed.muxAssetId,
        status: processed.status === "READY" ? VideoStatus.READY : VideoStatus.FAILED,
      }
    });
  }

  static async embedLink(userId: string, caseId: string, sourceUrl: string, caption?: string) {
    const metadata = await OEmbedProvider.fetchMetadata(sourceUrl);

    return prisma.video.create({
      data: {
        caseId,
        uploaderId: userId,
        sourceType: VideoSourceType.EMBEDDED_LINK,
        sourceUrl,
        thumbnailUrl: metadata.thumbnailUrl,
        caption,
        status: VideoStatus.READY
      }
    });
  }

  static async getVideoById(id: string) {
    return prisma.video.findUnique({ where: { id } });
  }

  static async deleteVideo(id: string) {
    return prisma.video.delete({ where: { id } });
  }
}
