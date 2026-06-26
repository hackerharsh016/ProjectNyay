export class OEmbedProvider {
  /**
   * Mocks fetching oEmbed metadata for YouTube/Instagram.
   */
  static async fetchMetadata(url: string) {
    if (!url.includes("youtube.com") && !url.includes("youtu.be") && !url.includes("instagram.com")) {
      throw new Error("Unsupported URL for embedding.");
    }
    
    // Mock response
    return {
      title: "Embedded Video Title",
      thumbnailUrl: "https://mock-thumbnail.com/thumb.jpg",
      authorName: "Mock Author"
    };
  }
}
