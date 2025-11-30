import { useNavigate } from 'react-router-dom';

interface BrandHeaderProps {
  showNavigation?: boolean;
}

export const BrandHeader = ({ showNavigation = true }: BrandHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center gap-3 cursor-pointer" 
      onClick={() => showNavigation && navigate('/dashboard')}
    >
      {/* Logo with lighter background for visibility */}
      <div className="w-10 h-10 rounded-full bg-logo-bg flex items-center justify-center shadow-md">
        <span className="text-sm font-bold text-slate-900">BRO</span>
      </div>
      <span className="text-xl font-bold text-foreground">BroMentor</span>
    </div>
  );
};

export default BrandHeader;
