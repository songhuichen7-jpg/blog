type MaterialIconProps = {
  icon: string;
  className?: string;
};

export function MaterialIcon({ icon, className }: MaterialIconProps) {
  return <span className={`material-symbols-outlined ${className ?? ""}`.trim()}>{icon}</span>;
}
