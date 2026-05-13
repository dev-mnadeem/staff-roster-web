type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      {children}
    </div>
  );
}
