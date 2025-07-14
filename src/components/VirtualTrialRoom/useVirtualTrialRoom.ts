import { useRef, useEffect } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs";
import type { Pose } from "@tensorflow-models/pose-detection";

const useVirtualTrialRoom = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pentImgRef = useRef<HTMLImageElement>(null);
  const shirtImgRef = useRef<HTMLImageElement>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const selectedShirtRef = useRef<string>("");
  const selectedPentRef = useRef<string>("");

  // Responsive canvas size
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width =
          window.innerWidth > 900 ? window.innerWidth * 0.6 : window.innerWidth;
        canvasRef.current.height =
          window.innerHeight > 600
            ? window.innerHeight * 0.8
            : window.innerHeight * 0.6;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    let animationId: number;
    let isMounted = true;

    const loadModelAndStart = async () => {
      // Set up webcam
      const video = videoRef.current;
      if (!video) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();

      // Load pose detector
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        {
          runtime: "mediapipe",
          solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
        }
      );
      detectorRef.current = detector;

      // Start detection loop
      const detectPose = async () => {
        if (!isMounted) return;
        if (!videoRef.current || videoRef.current.readyState !== 4) {
          animationId = requestAnimationFrame(detectPose);
          return;
        }
        const poses: Pose[] = await detector.estimatePoses(videoRef.current);
        drawResults(poses);
        animationId = requestAnimationFrame(detectPose);
      };
      detectPose();
    };

    loadModelAndStart();

    return () => {
      isMounted = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  // Update shirt/pent image refs when selection changes
  const handleShirtChange = (src: string) => {
    selectedShirtRef.current = src;
    if (shirtImgRef.current) shirtImgRef.current.src = src;
  };
  const handlePentChange = (src: string) => {
    selectedPentRef.current = src;
    if (pentImgRef.current) pentImgRef.current.src = src;
  };

  const drawResults = (poses: Pose[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the video feed to fill the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (poses && poses.length > 0 && poses[0]?.keypoints) {
      const keypoints = poses[0]?.keypoints;
      // Get relevant keypoints for shirt and pent
      const leftShoulder = keypoints.find((k) => k.name === "left_shoulder");
      const rightShoulder = keypoints.find((k) => k.name === "right_shoulder");
      const leftHip = keypoints.find((k) => k.name === "left_hip");
      const rightHip = keypoints.find((k) => k.name === "right_hip");
      const leftAnkle = keypoints.find((k) => k.name === "left_ankle");
      const rightAnkle = keypoints.find((k) => k.name === "right_ankle");
      const leftKnee = keypoints.find(
        (k) => k.name === "left_knee" && k.score !== undefined && k.score > 0.3
      );
      const rightKnee = keypoints.find(
        (k) => k.name === "right_knee" && k.score !== undefined && k.score > 0.3
      );
      // (Elbow keypoints are available if you want to add sleeve/arm overlays in the future)

      // --- PENT OVERLAY ---
      // Draw pent first so it appears under the shirt at the overlap
      if (leftHip && rightHip && pentImgRef.current) {
        // Find the lowest visible keypoint for the bottom of the pent
        const bottomXLeft =
          leftAnkle && rightAnkle
            ? leftAnkle.x
            : leftKnee && rightKnee
            ? leftKnee.x
            : leftHip.x;
        const bottomXRight =
          leftAnkle && rightAnkle
            ? rightAnkle.x
            : rightKnee && leftKnee
            ? rightKnee.x
            : rightHip.x;
        // Generous padding to ensure full coverage
        const hipWidth = Math.abs(leftHip.x - rightHip.x);
        const bodyWidth = hipWidth;
        const paddingX = bodyWidth * 0.4; // 35% of body width on each side
        const paddingY = bodyWidth * 0.15; // 15% above hips
        const pentLeftX =
          Math.min(leftHip.x, rightHip.x, bottomXLeft) - paddingX;
        const pentRightX =
          Math.max(leftHip.x, rightHip.x, bottomXRight) + paddingX;
        const pentTopY = Math.min(leftHip.y, rightHip.y) - paddingY;
        // Bottom: use the lowest detected keypoint (ankle, knee, or hip) plus extra padding
        const pentWidth = pentRightX - pentLeftX;
        const img = pentImgRef.current;
        const aspect = img.naturalWidth / img.naturalHeight;
        const drawWidth = pentWidth * (canvas.width / video.videoWidth);
        const drawHeight = drawWidth / aspect;
        // Do NOT shrink to fit if drawHeight > pentHeight; let it overflow
        // Center horizontally in the bounding box
        const drawX =
          pentLeftX * (canvas.width / video.videoWidth) +
          (pentWidth * (canvas.width / video.videoWidth) - drawWidth) / 2;
        const drawY = pentTopY * (canvas.height / video.videoHeight);

        // Draw pent overlay (may overflow canvas if user is not fully visible)
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      }

      // --- SHIRT OVERLAY ---
      if (
        leftShoulder &&
        rightShoulder &&
        leftHip &&
        rightHip &&
        leftShoulder.score !== undefined &&
        leftShoulder.score > 0.3 &&
        rightShoulder.score !== undefined &&
        rightShoulder.score > 0.3 &&
        leftHip.score !== undefined &&
        leftHip.score > 0.3 &&
        rightHip.score !== undefined &&
        rightHip.score > 0.3 &&
        shirtImgRef.current
      ) {
        // Generous padding to ensure full coverage
        const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
        const hipWidth = Math.abs(leftHip.x - rightHip.x);
        const bodyWidth = Math.max(shoulderWidth, hipWidth);
        const paddingX = bodyWidth * 0.25; // 35% of body width on each side
        const paddingY = bodyWidth * 0.25; // 35% of body width above and below
        const shirtLeftX =
          Math.min(leftShoulder.x, rightShoulder.x, leftHip.x, rightHip.x) -
          paddingX;
        const shirtRightX =
          Math.max(leftShoulder.x, rightShoulder.x, leftHip.x, rightHip.x) +
          paddingX;
        const shirtTopY = Math.min(leftShoulder.y, rightShoulder.y) - paddingY;
        const shirtBottomY = Math.max(leftHip.y, rightHip.y) + paddingY;
        const shirtWidth = shirtRightX - shirtLeftX;
        const shirtHeight = shirtBottomY - shirtTopY;

        // Maintain aspect ratio of shirt image
        const img = shirtImgRef.current;
        const aspect = img.naturalWidth / img.naturalHeight;
        let drawWidth = shirtWidth * (canvas.width / video.videoWidth);
        let drawHeight = drawWidth / aspect;
        if (drawHeight > shirtHeight * (canvas.height / video.videoHeight)) {
          drawHeight = shirtHeight * (canvas.height / video.videoHeight);
          drawWidth = drawHeight * aspect;
        }
        // Center horizontally in the bounding box
        const drawX =
          shirtLeftX * (canvas.width / video.videoWidth) +
          (shirtWidth * (canvas.width / video.videoWidth) - drawWidth) / 2;
        const drawY = shirtTopY * (canvas.height / video.videoHeight);

        // Draw shirt overlay
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      }
    }
  };

  return {
    videoRef,
    canvasRef,
    pentImgRef,
    shirtImgRef,
    handleShirtChange,
    handlePentChange,
  };
};

export default useVirtualTrialRoom;
