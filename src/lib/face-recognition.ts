// Face recognition utilities using face-api.js

// Note: face-api.js needs to be loaded in the browser
// For client-side usage, import dynamically
let faceapi: any = null;
let modelsLoaded = false;

// Dynamically load face-api.js
async function loadFaceApi() {
  if (typeof window === "undefined") {
    throw new Error("Face recognition is only available in the browser");
  }

  if (faceapi) {
    return faceapi;
  }

  try {
    // Dynamic import for client-side only
    faceapi = await import("face-api.js");
    return faceapi;
  } catch (error) {
    console.error("Failed to load face-api.js:", error);
    throw new Error("Face recognition library not available");
  }
}

/**
 * Load face-api.js models
 */
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;

  try {
    const api = await loadFaceApi();
    const MODEL_URL = "/models"; // Models should be in public/models directory
    
    await Promise.all([
      api.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      api.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      api.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
  } catch (error) {
    console.error("Failed to load face recognition models:", error);
    throw new Error("Failed to load face recognition models. Please ensure models are in /public/models directory.");
  }
}

/**
 * Detect face in image
 */
export async function detectFace(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<any> {
  await loadFaceModels();
  const api = await loadFaceApi();

  try {
    const detection = await api
      .detectSingleFace(image, new api.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection;
  } catch (error) {
    console.error("Face detection error:", error);
    return null;
  }
}

/**
 * Compare two face descriptors
 */
export async function compareFaces(
  descriptor1: Float32Array,
  descriptor2: Float32Array,
  threshold: number = 0.6
): Promise<{ match: boolean; distance: number }> {
  const api = await loadFaceApi();
  const distance = api.euclideanDistance(descriptor1, descriptor2);
  const match = distance < threshold;

  return { match, distance };
}

/**
 * Extract face descriptor from image
 */
export async function extractFaceDescriptor(
  imageSrc: string | HTMLImageElement
): Promise<Float32Array | null> {
  await loadFaceModels();

  try {
    let img: HTMLImageElement;

    if (typeof imageSrc === "string") {
      img = await loadImage(imageSrc);
    } else {
      img = imageSrc;
    }

    const detection = await detectFace(img);
    return detection?.descriptor || null;
  } catch (error) {
    console.error("Failed to extract face descriptor:", error);
    return null;
  }
}

/**
 * Verify student identity by comparing uploaded photo with camera capture
 * This is a client-side function that can be called from React components
 */
export async function verifyStudentIdentity(
  uploadedPhoto: string, // Base64 or URL
  cameraImage: HTMLVideoElement | HTMLCanvasElement
): Promise<{ verified: boolean; confidence: number; message: string }> {
  try {
    // Load models if not already loaded
    await loadFaceModels();

    const uploadedDescriptor = await extractFaceDescriptor(uploadedPhoto);
    
    // For video element, we need to capture a frame first
    let imageElement: HTMLImageElement | HTMLCanvasElement;
    if (cameraImage instanceof HTMLVideoElement) {
      // Create a canvas to capture the video frame
      const canvas = document.createElement("canvas");
      canvas.width = cameraImage.videoWidth;
      canvas.height = cameraImage.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(cameraImage, 0, 0);
        imageElement = canvas;
      } else {
        throw new Error("Failed to create canvas context");
      }
    } else {
      imageElement = cameraImage;
    }

    const cameraDescriptor = await extractFaceDescriptor(imageElement);

    if (!uploadedDescriptor || !cameraDescriptor) {
      return {
        verified: false,
        confidence: 0,
        message: "Could not detect face in one or both images. Please ensure your face is clearly visible.",
      };
    }

    const comparison = await compareFaces(uploadedDescriptor, cameraDescriptor, 0.6);
    const confidence = (1 - comparison.distance) * 100;

    if (comparison.match) {
      return {
        verified: true,
        confidence,
        message: "Identity verified",
      };
    } else {
      return {
        verified: false,
        confidence,
        message: "YOU NEED FURTHER IDENTIFICATION",
      };
    }
  } catch (error: any) {
    console.error("Face verification error:", error);
    return {
      verified: false,
      confidence: 0,
      message: error.message || "Error during face verification. Please try again.",
    };
  }
}

/**
 * Load image from URL or base64
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
