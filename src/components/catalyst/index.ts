// Tailwind UI Catalyst 컴포넌트 진입점.
//
// Tailwind Plus 라이선스 (commercial product) — private repo `mlnyx/AI-denture` 에서만 사용.
// 라이선스 원문: ./CATALYST-LICENSE.md (zip README 보존본).
//
// shadcn/ui 와의 관계:
//   - shadcn/ui = Radix 기반 primitive (`@/components/ui/*`)
//   - Catalyst = Headless UI 기반 application UI 패턴 (sidebar/navbar/stacked layout 등)
//   - 두 라이브러리 동시 사용 OK — Tailwind v4 의 같은 토큰 (`--color-primary` 등) 을 공유.
//
// 컴포넌트 사용 가이드 → docs/DESIGN.md "외부 도구 통합" 섹션.

export { Alert, AlertActions, AlertBody, AlertDescription, AlertTitle } from './alert';
export { AuthLayout } from './auth-layout';
export { Avatar, AvatarButton } from './avatar';
export { Badge, BadgeButton } from './badge';
export { Button, TouchTarget } from './button';
export { Checkbox, CheckboxField, CheckboxGroup } from './checkbox';
export {
  Combobox,
  ComboboxLabel,
  ComboboxOption,
  ComboboxDescription,
} from './combobox';
export {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from './description-list';
export {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from './dialog';
export { Divider } from './divider';
export {
  Dropdown,
  DropdownButton,
  DropdownDescription,
  DropdownDivider,
  DropdownHeader,
  DropdownHeading,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSection,
  DropdownShortcut,
} from './dropdown';
export {
  Description,
  ErrorMessage,
  Field,
  FieldGroup,
  Fieldset,
  Label,
  Legend,
} from './fieldset';
export {
  Heading,
  Subheading,
} from './heading';
export { Input, InputGroup } from './input';
export { Link } from './link';
export {
  Listbox,
  ListboxLabel,
  ListboxOption,
  ListboxDescription,
} from './listbox';
export {
  Navbar,
  NavbarDivider,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
} from './navbar';
export { Pagination, PaginationGap, PaginationList, PaginationNext, PaginationPage, PaginationPrevious } from './pagination';
export { Radio, RadioField, RadioGroup } from './radio';
export { Select } from './select';
export {
  Sidebar,
  SidebarBody,
  SidebarDivider,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from './sidebar';
export { SidebarLayout } from './sidebar-layout';
export { StackedLayout } from './stacked-layout';
export { Switch, SwitchField, SwitchGroup } from './switch';
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
export {
  Code,
  Strong,
  Text,
  TextLink,
} from './text';
export { Textarea } from './textarea';
