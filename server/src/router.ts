import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing({
  /**
   * Log out more information about the error, but don't return it to the client
   * @see https://docs.uploadthing.com/errors#error-formatting
   */
  errorFormatter: (err) => {
    console.log("Error uploading file", err.message);
    console.log("  - Above error caused by:", err.cause);

    return { message: err.message };
  },
});

/**
 * This is your Uploadthing file router. For more information:
 * @see https://docs.uploadthing.com/api-reference/server#file-routes
 */
export const uploadRouter = {
  imageUploader: f(
    {
      image: {
        maxFileSize: "4MB",
        maxFileCount: 4,
      },
    },
    {
      awaitServerData: true,
      presignedURLTTL: 10,
      // // Each file will get a unique key (default)
      // getFileHashParts: (file) => [file.name, Date.now()],

      // Uploading the same file will yield the same key
      // getFileHashParts: (file) => [file.name],
      // getFileHashParts: () => ["foo"],
    },
  )
    .middleware(({ files }) => {
      files;
      // ^?
      return {
        uploadedBy: "fake-user-id-213",
      };
    })
    .onUploadError(({ error, fileKey }) => {
      console.log("upload error", { message: error.message, fileKey });
      throw error;
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("upload completed", metadata, file);
      // await new Promise((r) => setTimeout(r, 15000));
      return { foo: "bar", baz: "qux" };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;