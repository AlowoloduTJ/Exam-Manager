// Face recognition utilities using face-api.js

import * as faceapi from "face-api.js";

let modelsLoaded = false;

/**
 * Load face-api.js models
 */
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;

  try {
    const MODEL_URL = "/models"; // Models should be in public/models directory
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
  } catch (error) {
    console.error("Failed to load face recognition models:", error);
    throw new Error("Failed to load face recognition models");
  }
}

/**
 * Detect face in image
 */
export async function detectFace(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>> | null> {
  await loadFaceModels();

  try {
    const detection = await faceapi
      .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
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
export function compareFaces(
  descriptor1: Float32Array,
  descriptor2: Float32Array,
  threshold: number = 0.6
): { match: boolean; distance: number } {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
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
 */
export async function verifyStudentIdentity(
  uploadedPhoto: string, // Base64 or URL
  cameraImage: HTMLVideoElement | HTMLCanvasElement
): Promise<{ verified: boolean; confidence: number; message: string }> {
  try {
    const uploadedDescriptor = await extractFaceDescriptor(uploadedPhoto);
    const cameraDescriptor = await extractFaceDescriptor(cameraImage);

    if (!uploadedDescriptor || !cameraDescriptor) {
      return {
        verified: false,
        confidence: 0,
        message: "Could not detect face in one or both images",
      };
    }

    const comparison = compareFaces(uploadedDescriptor, cameraDescriptor, 0.6);
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
  } catch (error) {
    console.error("Face verification error:", error);
    return {
      verified: false,
      confidence: 0,
      message: "Error during face verification",
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
