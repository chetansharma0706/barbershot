import { useState, useCallback, useRef } from "react";
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  type UploadResponse,
} from "@imagekit/next";
import { getImagekitAuth } from "@/app/actions/imagekitAuth";
import { deleteImageKit } from "@/app/actions/deletefile";

interface UploadedFile {
  fileId: string;
  url: string;
  name: string;
  filePath: string;
  thumbnailUrl?: string;
  size: number;
}

interface UploadState {
  progress: number;
  isUploading: boolean;
  error: string | null;
  uploadedFile: UploadedFile | null;
}

interface DeleteState {
  isDeleting: boolean;
  error: string | null;
}

interface UseImageKitReturn {
  // Upload state
  uploadState: UploadState;
  
  // Delete state
  deleteState: DeleteState;
  
  // Upload function
  uploadFile: (file: File, options?: UploadOptions) => Promise<UploadedFile | null>;
  
  // Delete function
  deleteFile: (fileId: string) => Promise<boolean>;
  
  // Cancel upload
  cancelUpload: () => void;
  
  // Reset states
  resetUpload: () => void;
  resetDelete: () => void;
}

interface UploadOptions {
  folder?: string;
  useUniqueFileName?: boolean;
  tags?: string[];
  isPrivateFile?: boolean;
  customCoordinates?: string;
  responseFields?: string[];
}

export function useImageKit(): UseImageKitReturn {
  // Upload state
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: 0,
    isUploading: false,
    error: null,
    uploadedFile: null,
  });

  // Delete state
  const [deleteState, setDeleteState] = useState<DeleteState>({
    isDeleting: false,
    error: null,
  });

  // AbortController for canceling uploads
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetches authentication parameters from the server
   */
  const getAuthParams = async () => {
   try {
    
    

    const data = await getImagekitAuth();
    
    
    
    // Validate response data
    if (!data.token || !data.expire || !data.signature || !data.publicKey) {
      console.error("❌ Missing required auth parameters:", data);
      throw new Error("Incomplete auth parameters received");
    }
    
    return data;
  } catch (error) {
    console.error("❌ Authentication error:", error);
    
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    
    throw new Error("Failed to authenticate with ImageKit");
  }
};

  /**
   * Upload a file to ImageKit
   */
  const uploadFile = useCallback(
    async (file: File, options: UploadOptions = {}) => {
      // Reset state
      setUploadState({
        progress: 0,
        isUploading: true,
        error: null,
        uploadedFile: null,
      });

      // Create new AbortController
      abortControllerRef.current = new AbortController();

      try {
        // Get auth parameters
        const authParams = await getAuthParams();

        // Upload the file
        const uploadResponse: UploadResponse = await upload({
          file,
          fileName: file.name,
          signature: authParams.signature,
          token: authParams.token,
          expire: authParams.expire,
          publicKey: authParams.publicKey,
          folder: options.folder,
          useUniqueFileName: options.useUniqueFileName ?? true,
          tags: options.tags,
          isPrivateFile: options.isPrivateFile ?? false,
          customCoordinates: options.customCoordinates,
          responseFields: options.responseFields,
          onProgress: (event) => {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            setUploadState((prev) => ({
              ...prev,
              progress: percentComplete,
            }));
          },
          abortSignal: abortControllerRef.current.signal,
        });

        // Create uploaded file object
        const uploadedFile: UploadedFile = {
          fileId: uploadResponse.fileId || "",
          url: uploadResponse.url || "",
          name: uploadResponse.name  || "",
          filePath: uploadResponse.filePath || "",
          thumbnailUrl: uploadResponse.thumbnailUrl,
          size: uploadResponse.size || 0,
        };

        // Update state with success
        setUploadState({
          progress: 100,
          isUploading: false,
          error: null,
          uploadedFile,
        });

        return uploadedFile;
      } catch (error) {
        let errorMessage = "Upload failed";

        if (error instanceof ImageKitAbortError) {
          errorMessage = "Upload cancelled";
        } else if (error instanceof ImageKitInvalidRequestError) {
          errorMessage = `Invalid request: ${error.message}`;
        } else if (error instanceof ImageKitUploadNetworkError) {
          errorMessage = `Network error: ${error.message}`;
        } else if (error instanceof ImageKitServerError) {
          errorMessage = `Server error: ${error.message}`;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setUploadState({
          progress: 0,
          isUploading: false,
          error: errorMessage,
          uploadedFile: null,
        });

        return null;
      }
    },
    []
  );

  /**
   * Delete a file from ImageKit
   */
  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    setDeleteState({
      isDeleting: true,
      error: null,
    });

    try {
      const response = await deleteImageKit(fileId);

      if (!response.success) {
        throw new Error(response.error || "Delete failed");
      }

      setDeleteState({
        isDeleting: false,
        error: null,
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete file";

      setDeleteState({
        isDeleting: false,
        error: errorMessage,
      });

      return false;
    }
  }, []);

  /**
   * Cancel ongoing upload
   */
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Reset upload state
   */
  const resetUpload = useCallback(() => {
    setUploadState({
      progress: 0,
      isUploading: false,
      error: null,
      uploadedFile: null,
    });
  }, []);

  /**
   * Reset delete state
   */
  const resetDelete = useCallback(() => {
    setDeleteState({
      isDeleting: false,
      error: null,
    });
  }, []);

  return {
    uploadState,
    deleteState,
    uploadFile,
    deleteFile,
    cancelUpload,
    resetUpload,
    resetDelete,
  };
}