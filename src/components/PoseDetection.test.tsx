import { render, screen } from '@testing-library/react';
import PoseDetection from './PoseDetection';
import { describe, it, expect, vi } from 'vitest';

// Mocking navigator.mediaDevices.getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue(true),
  },
  writable: true,
});

// Mocking TensorFlow.js and pose-detection
vi.mock('@tensorflow/tfjs', () => ({
  ready: vi.fn().mockResolvedValue(true),
}));

vi.mock('@tensorflow-models/pose-detection', () => ({
  createDetector: vi.fn().mockResolvedValue({
    estimatePoses: vi.fn().mockResolvedValue([]),
  }),
  SupportedModels: {
    MoveNet: 'MoveNet',
  },
  util: {
    getAdjacentPairs: vi.fn().mockReturnValue([]),
  },
}));

describe('PoseDetection', () => {
  it('renders a canvas element', async () => {
    render(<PoseDetection />);
    const canvasElement = await screen.findByTestId('pose-canvas');
    expect(canvasElement).toBeInTheDocument();
  });
});
