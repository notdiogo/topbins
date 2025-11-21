import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  // Polygon clip-path for that "machined" look
  const clipPath = "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)";
  
  const baseStyles = "relative font-tech font-bold uppercase tracking-[0.15em] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 group overflow-hidden";
  
  const variants = {
    primary: "bg-[#CCFF00] text-black hover:bg-white hover:text-black",
    secondary: "bg-white text-black hover:bg-gray-200",
    outline: "bg-transparent text-white border border-white/30 hover:border-[#CCFF00] hover:text-[#CCFF00] hover:bg-white/5",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      style={{ clipPath: variant !== 'outline' ? clipPath : undefined }}
      {...props}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
      
      {/* Decorative accent lines for primary/secondary */}
      {variant !== 'outline' && (
        <>
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-black/20"></div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-white/40"></div>
          
          {/* Scan effect on hover */}
          <div className="absolute inset-0 bg-white/40 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12 origin-left"></div>
        </>
      )}
    </button>
  );
};