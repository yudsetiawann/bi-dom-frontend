interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export default function Button({
  isLoading,
  loadingText = 'Memproses...',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`w-full py-2 px-4 rounded-md text-white font-bold transition-colors ${
        isLoading || props.disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-black hover:bg-red-600 hover:shadow-lg'
      } ${className}`}
    >
      {isLoading ? loadingText : children}
    </button>
  );
}
