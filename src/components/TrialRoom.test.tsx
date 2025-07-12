import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TrialRoom from './TrialRoom';

// Mock Three.js and React Three Fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas">{children}</div>
  ),
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  useGLTF: () => ({ scene: {} }),
}));

jest.mock('three', () => ({
  Group: class {},
  Mesh: class {},
  MeshStandardMaterial: class {},
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('TrialRoom', () => {
  it('renders trial room interface', () => {
    renderWithRouter(<TrialRoom />);
    
    // Check for main headings
    expect(screen.getByText('Virtual Trial Room')).toBeInTheDocument();
    expect(screen.getByText('Upload Your Photo')).toBeInTheDocument();
    expect(screen.getByText('3D Model Preview')).toBeInTheDocument();
    expect(screen.getByText('Choose Your Clothing')).toBeInTheDocument();
  });

  it('displays clothing options', () => {
    renderWithRouter(<TrialRoom />);
    
    // Check for clothing items
    expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Blue T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Red T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Formal Shirt')).toBeInTheDocument();
    expect(screen.getByText('Denim Jacket')).toBeInTheDocument();
  });

  it('shows upload instructions', () => {
    renderWithRouter(<TrialRoom />);
    
    expect(screen.getByText('Click to upload your photo')).toBeInTheDocument();
    expect(screen.getByText('Choose Photo')).toBeInTheDocument();
  });

  it('displays usage instructions', () => {
    renderWithRouter(<TrialRoom />);
    
    expect(screen.getByText('How to use:')).toBeInTheDocument();
    expect(screen.getByText(/Upload your photo/)).toBeInTheDocument();
    expect(screen.getByText(/Select a clothing item/)).toBeInTheDocument();
  });
});