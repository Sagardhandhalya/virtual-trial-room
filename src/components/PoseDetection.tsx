import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";

interface PoseDetectionProps {
  width?: number;
  height?: number;
  confidenceThreshold?: number;
  detectionInterval?: number;
  showKeypoints?: boolean;
  showSkeleton?: boolean;
  showFaceOverlay?: boolean;
  className?: string;
}

interface Keypoint {
  x: number;
  y: number;
  score?: number;
}

interface Pose {
  keypoints: Keypoint[];
}

const PoseDetection: React.FC<PoseDetectionProps> = ({
  width = 640,
  height = 480,
  confidenceThreshold = 0.3,
  detectionInterval = 33,
  showKeypoints = true,
  showSkeleton = true,
  showFaceOverlay = true,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized keypoint colors
  const getKeypointColor = useCallback((index: number): string => {
    if (index <= 4) return "#ff6b6b"; // face (red)
    if (index <= 10) return "#96ceb4"; // arms (green)
    if (index <= 16) return "#ff9ff3"; // legs (pink)
    return "#feca57"; // hands (yellow)
  }, []);

  // Memoized skeleton colors
  const skeletonColors = useMemo(
    () => ({
      head: "#ff6b6b",
      spine: "#4ecdc4",
      shoulders: "#4ecdc4",
      pelvis: "#45b7d1",
      arms: "#96ceb4",
      hands: "#feca57",
      legs: "#ff9ff3",
    }),
    []
  );

  const drawSkeleton = useCallback(
    (ctx: CanvasRenderingContext2D, pose: Pose) => {
      if (!showSkeleton) return;

      const keypoints = pose.keypoints;
      const nose = keypoints[0];
      const leftEye = keypoints[1];
      const rightEye = keypoints[2];
      const leftShoulder = keypoints[5];
      const rightShoulder = keypoints[6];
      const leftElbow = keypoints[7];
      const rightElbow = keypoints[8];
      const leftWrist = keypoints[9];
      const rightWrist = keypoints[10];
      const leftHip = keypoints[11];
      const rightHip = keypoints[12];
      const leftKnee = keypoints[13];
      const rightKnee = keypoints[14];
      const leftAnkle = keypoints[15];
      const rightAnkle = keypoints[16];
      const leftThumb = keypoints[17];
      const rightThumb = keypoints[18];
      const leftIndex = keypoints[19];
      const rightIndex = keypoints[20];
      const leftPinky = keypoints[21];
      const rightPinky = keypoints[22];

      // Calculate center points
      const centerShoulder =
        leftShoulder && rightShoulder
          ? {
              x: (leftShoulder.x + rightShoulder.x) / 2,
              y: (leftShoulder.y + rightShoulder.y) / 2,
            }
          : null;
      const centerHip =
        leftHip && rightHip
          ? { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 }
          : null;
      const centerEye =
        leftEye && rightEye
          ? { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 }
          : null;

      const drawLine = (start: Keypoint, end: Keypoint, color: string) => {
        if (
          start?.score !== undefined &&
          start.score > confidenceThreshold &&
          end?.score !== undefined &&
          end.score > confidenceThreshold
        ) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }
      };

      // Draw skeleton parts
      if (nose && centerEye) drawLine(nose, centerEye, skeletonColors.head);
      if (centerEye && centerShoulder)
        drawLine(centerEye, centerShoulder, skeletonColors.head);
      if (centerShoulder && centerHip)
        drawLine(centerShoulder, centerHip, skeletonColors.spine);
      if (leftShoulder && rightShoulder)
        drawLine(leftShoulder, rightShoulder, skeletonColors.shoulders);
      if (leftHip && rightHip)
        drawLine(leftHip, rightHip, skeletonColors.pelvis);
      // Draw shoulder to hip connections
      if (leftShoulder && leftHip)
        drawLine(leftShoulder, leftHip, skeletonColors.spine);
      if (rightShoulder && rightHip)
        drawLine(rightShoulder, rightHip, skeletonColors.spine);
      if (leftShoulder && leftElbow)
        drawLine(leftShoulder, leftElbow, skeletonColors.arms);
      if (leftElbow && leftWrist)
        drawLine(leftElbow, leftWrist, skeletonColors.arms);
      if (rightShoulder && rightElbow)
        drawLine(rightShoulder, rightElbow, skeletonColors.arms);
      if (rightElbow && rightWrist)
        drawLine(rightElbow, rightWrist, skeletonColors.arms);
      if (leftHip && leftKnee) drawLine(leftHip, leftKnee, skeletonColors.legs);
      if (leftKnee && leftAnkle)
        drawLine(leftKnee, leftAnkle, skeletonColors.legs);
      if (rightHip && rightKnee)
        drawLine(rightHip, rightKnee, skeletonColors.legs);
      if (rightKnee && rightAnkle)
        drawLine(rightKnee, rightAnkle, skeletonColors.legs);

      // Draw hands
      if (leftWrist && leftThumb)
        drawLine(leftWrist, leftThumb, skeletonColors.hands);
      if (leftWrist && leftIndex)
        drawLine(leftWrist, leftIndex, skeletonColors.hands);
      if (leftWrist && leftPinky)
        drawLine(leftWrist, leftPinky, skeletonColors.hands);
      if (rightWrist && rightThumb)
        drawLine(rightWrist, rightThumb, skeletonColors.hands);
      if (rightWrist && rightIndex)
        drawLine(rightWrist, rightIndex, skeletonColors.hands);
      if (rightWrist && rightPinky)
        drawLine(rightWrist, rightPinky, skeletonColors.hands);

      // Draw feet
      if (leftAnkle) {
        ctx.strokeStyle = skeletonColors.legs;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(leftAnkle.x, leftAnkle.y);
        ctx.lineTo(leftAnkle.x, leftAnkle.y + 20);
        ctx.stroke();
      }
      if (rightAnkle) {
        ctx.strokeStyle = skeletonColors.legs;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(rightAnkle.x, rightAnkle.y);
        ctx.lineTo(rightAnkle.x, rightAnkle.y + 20);
        ctx.stroke();
      }
    },
    [showSkeleton, confidenceThreshold, skeletonColors]
  );

  const drawKeypoints = useCallback(
    (ctx: CanvasRenderingContext2D, pose: Pose) => {
      if (!showKeypoints) return;

      pose.keypoints.forEach((keypoint, index) => {
        if (
          keypoint &&
          keypoint.score !== undefined &&
          keypoint.score > confidenceThreshold
        ) {
          const color = getKeypointColor(index);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
          ctx.fill();

          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    },
    [showKeypoints, confidenceThreshold, getKeypointColor]
  );

  const drawFaceOverlay = useCallback(
    (ctx: CanvasRenderingContext2D, pose: Pose, video: HTMLVideoElement) => {
      if (!showFaceOverlay) return;

      const keypoints = pose.keypoints;
      const nose = keypoints[0];
      const leftEye = keypoints[1];
      const rightEye = keypoints[2];

      if (
        nose?.score !== undefined &&
        nose.score > confidenceThreshold &&
        leftEye?.score !== undefined &&
        leftEye.score > confidenceThreshold &&
        rightEye?.score !== undefined &&
        rightEye.score > confidenceThreshold
      ) {
        const faceXs = [nose.x, leftEye.x, rightEye.x];
        const faceYs = [nose.y, leftEye.y, rightEye.y];
        const minX = Math.min(...faceXs);
        const maxX = Math.max(...faceXs);
        const minY = Math.min(...faceYs);
        const maxY = Math.max(...faceYs);

        const padding = 40;
        const boxW = maxX - minX + 2 * padding;
        const boxH = maxY - minY + 2 * padding;
        const boxSize = Math.max(boxW, boxH);
        const verticalOffset = boxSize * 0.2;
        const boxX = Math.max(0, minX - padding);
        const boxY = Math.max(0, minY - padding - verticalOffset);
        const drawBoxW = Math.min(ctx.canvas.width - boxX, boxSize);
        const drawBoxH = Math.min(ctx.canvas.height - boxY, boxSize);

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = drawBoxW;
        tempCanvas.height = drawBoxH;
        const tempCtx = tempCanvas.getContext("2d");

        if (tempCtx) {
          tempCtx.drawImage(
            video,
            boxX,
            boxY,
            drawBoxW,
            drawBoxH,
            0,
            0,
            drawBoxW,
            drawBoxH
          );

          ctx.save();
          ctx.beginPath();
          ctx.arc(nose.x, nose.y, boxSize / 2, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(
            tempCanvas,
            0,
            0,
            drawBoxW,
            drawBoxH,
            nose.x - boxSize / 2,
            nose.y - boxSize / 2,
            boxSize,
            boxSize
          );
          ctx.restore();
        }
      }
    },
    [showFaceOverlay, confidenceThreshold]
  );

  useEffect(() => {
    let animationId: number;
    let intervalId: NodeJS.Timeout;
    let isComponentMounted = true;
    const latestPoseRef = { current: null as Pose[] | null };

    const initializeModel = async () => {
      try {
        setError(null);
        await tf.ready();
        const model = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet
        );
        return model;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to initialize pose detection model";
        setError(errorMessage);
        return null;
      }
    };

    const startVideoStream = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access not supported");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          return stream;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to access camera";
        setError(errorMessage);
        setIsLoading(false);

        return null;
      }
    };

    const runPoseDetection = async () => {
      setIsLoading(true);
      const model = await initializeModel();
      if (!model) return;

      const stream = await startVideoStream();
      if (!stream) return;
      const video = videoRef.current;
      if (!video) return;

      video.onloadeddata = async () => {
        try {
          await video.play();
        } catch {
          setError("Failed to start video playback");
          setIsLoading(false);
          return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        setIsLoading(false);

        // Throttle pose estimation
        intervalId = setInterval(async () => {
          if (!isComponentMounted) return;
          try {
            const poses = await model.estimatePoses(video);
            latestPoseRef.current = poses;
          } catch {
            // Silently handle pose estimation errors
          }
        }, detectionInterval);

        // Animation loop for drawing
        const draw = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const poses = latestPoseRef.current;

          if (poses && poses.length > 0) {
            poses.forEach((pose) => {
              drawSkeleton(ctx, pose);
              drawKeypoints(ctx, pose);
              drawFaceOverlay(ctx, pose, video);
            });
          }

          animationId = requestAnimationFrame(draw);
        };
        draw();
      };
    };

    runPoseDetection();

    return () => {
      isComponentMounted = false;
      if (intervalId) clearInterval(intervalId);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [detectionInterval, drawSkeleton, drawKeypoints, drawFaceOverlay]);

  if (error) {
    return (
      <div
        className={`pose-detection-error ${className}`}
        role="alert"
        aria-live="polite"
      >
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div
      className={`pose-detection ${className}`}
      style={{ position: "relative" }}
    >
      {isLoading && (
        <div className="pose-detection-loading">
          <p>Loading pose detection...</p>
        </div>
      )}
      <video
        ref={videoRef}
        style={{ visibility: "hidden", width: "10px", height: "10px" }}
        aria-hidden="true"
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        data-testid="pose-canvas"
        width={width}
        height={height}
        style={{ display: "block" }}
        role="img"
        aria-label="Pose detection visualization"
        tabIndex={0}
      />
    </div>
  );
};

export default PoseDetection;
