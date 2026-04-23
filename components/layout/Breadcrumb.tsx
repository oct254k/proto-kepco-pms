interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb-container">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">홈</li>
        {items.map((item, i) => (
          <li key={i} className={`breadcrumb-item ${i === items.length - 1 ? 'active' : ''}`}>
            {item.label}
          </li>
        ))}
      </ol>
    </nav>
  );
}
