import React from 'react';

export const Table = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className="w-full overflow-x-auto rounded-xl border border-sand-200 bg-white">
    <table className={`w-full text-left text-sm border-collapse ${className}`}>{children}</table>
  </div>
);

export const TableHeader = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <thead className={`bg-sand-50/80 border-b border-sand-200 text-xs font-semibold text-ink-600 uppercase tracking-wider ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <tbody className={`divide-y divide-sand-100 ${className}`}>{children}</tbody>;

export const TableRow = ({
  children,
  className = '',
  isClickable = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  isClickable?: boolean;
  onClick?: () => void;
}) => (
  <tr
    onClick={onClick}
    className={`transition-colors duration-100 ${
      isClickable ? 'cursor-pointer hover:bg-sand-50/70' : 'hover:bg-sand-50/40'
    } ${className}`}
  >
    {children}
  </tr>
);

export const TableHead = ({
  children,
  align = 'left',
  className = '',
}: {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}) => {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th className={`py-3 px-3.5 sm:px-4 ${alignClass} ${className}`}>
      {children}
    </th>
  );
};

export const TableCell = ({
  children,
  align = 'left',
  tabular = false,
  className = '',
}: {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  tabular?: boolean;
  className?: string;
}) => {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <td
      className={`py-3 px-3.5 sm:px-4 text-ink-800 text-sm align-middle ${
        tabular ? 'font-mono tabular-nums' : ''
      } ${alignClass} ${className}`}
    >
      {children}
    </td>
  );
};
