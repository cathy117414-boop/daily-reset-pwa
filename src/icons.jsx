const Icon = ({ children, size = 22, className = "" }) => (
  <svg
    aria-hidden="true"
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const CalendarIcon = (props) => (
  <Icon {...props}><path d="M6 2v3M18 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /></Icon>
);
export const ListIcon = (props) => (
  <Icon {...props}><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 8h8M8 12h8M8 16h5" /></Icon>
);
export const HabitIcon = (props) => (
  <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></Icon>
);
export const DumbbellIcon = (props) => (
  <Icon {...props}><path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" /></Icon>
);
export const ChartIcon = (props) => (
  <Icon {...props}><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7" /></Icon>
);
export const PaletteIcon = (props) => (
  <Icon {...props}><path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.6-3.2 2 2 0 0 1 1.6-3.2H18A3 3 0 0 0 21 12a9 9 0 0 0-9-9Z" /><path d="M7.5 10h.01M10 6.5h.01M14.5 6.8h.01" /></Icon>
);
export const PlusIcon = (props) => <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>;
export const EditIcon = (props) => <Icon {...props}><path d="m4 20 4.3-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20ZM14 7l3 3" /></Icon>;
export const TrashIcon = (props) => <Icon {...props}><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" /></Icon>;
export const CloseIcon = (props) => <Icon {...props}><path d="m6 6 12 12M18 6 6 18" /></Icon>;
export const CheckIcon = (props) => <Icon {...props}><path d="m6 12 4 4 8-8" /></Icon>;
