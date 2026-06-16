export type BlogAiServiceContext = {
  slug: string;
  title: string;
  description: string;
};

export type GenerateBlogPostRequest = {
  topic?: string;
  generateTopic?: boolean;
  serviceSlug?: string;
  status?: "draft" | "published";
  categoryId?: string | null;
  services?: BlogAiServiceContext[];
};

export type GenerateBlogPostResponse =
  | {
      ok: true;
      postId: string;
      title: string;
      slug: string;
      topic: string;
    }
  | {
      ok: false;
      error: string;
    };
