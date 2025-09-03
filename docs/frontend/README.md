# Frontend Components Documentation

## 🎨 Overview

MedQ's frontend is built with **React 18**, **Next.js 15**, and **TypeScript**, featuring a component-based architecture with **Tailwind CSS** and **Radix UI** for styling and interactions.

## 🏗️ Component Architecture

### Design System Hierarchy
```
Design System
├── Base Components (Radix UI + shadcn/ui)
├── Composite Components (Application-specific)
├── Layout Components (Page structure)
├── Feature Components (Domain-specific)
└── Page Components (Route handlers)
```

## 📁 Component Organization

```
src/components/
├── ui/                    # Base UI components (shadcn/ui)
│   ├── button.tsx         # Button variants and styles
│   ├── dialog.tsx         # Modal dialogs
│   ├── form.tsx           # Form components
│   ├── input.tsx          # Input fields
│   ├── card.tsx           # Card containers
│   ├── badge.tsx          # Status badges
│   ├── progress.tsx       # Progress bars
│   ├── chart.tsx          # Chart components
│   └── sidebar/           # Sidebar components
├── auth/                  # Authentication components
├── admin/                 # Admin panel components
├── dashboard/             # Dashboard widgets
├── questions/             # Question-related components
├── lectures/              # Lecture components
├── specialties/           # Specialty management
├── layout/                # Layout and navigation
└── theme/                 # Theme and styling
```

## 🧩 Core UI Components

### Button Component
**File**: `src/components/ui/button.tsx`

**Variants**:
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    }
  }
)
```

**Usage**:
```tsx
<Button variant="default" size="lg">Primary Action</Button>
<Button variant="outline" size="sm">Secondary</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

### Dialog Component
**File**: `src/components/ui/dialog.tsx`

**Features**:
- Accessible modal dialogs
- Keyboard navigation support
- Focus management
- Portal rendering

**Usage**:
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
    <DialogFooter>
      <Button onClick={() => setIsOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Form Components
**File**: `src/components/ui/form.tsx`

**Integration with react-hook-form**:
```tsx
const form = useForm<FormSchema>({
  resolver: zodResolver(schema)
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="Enter email" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

## 🏠 Layout Components

### AppSidebar
**File**: `src/components/layout/AppSidebar.tsx`

**Features**:
- Responsive sidebar navigation
- Collapsible/expandable states
- Role-based menu items
- Active route highlighting

**Structure**:
```tsx
export function AppSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          {/* Logo and branding */}
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
```

### UniversalHeader
**File**: `src/components/layout/UniversalHeader.tsx`

**Features**:
- Breadcrumb navigation
- User profile dropdown
- Theme toggle
- Notifications center

## 📊 Dashboard Components

### UserStats
**File**: `src/components/dashboard/UserStats.tsx`

**Purpose**: Display key user statistics and metrics

**Props**:
```typescript
interface UserStatsProps {
  stats: {
    totalQuestions: number;
    completedQuestions: number;
    averageScore: number;
    learningStreak: number;
    questionsToday: number;
    timeSpentToday: number;
  } | null;
  isLoading: boolean;
}
```

**Features**:
- Animated counters
- Progress indicators
- Icon-based metrics
- Loading skeletons

### DailyLearningChart
**File**: `src/components/dashboard/DailyLearningChart.tsx`

**Purpose**: Visualize daily learning activity

**Technology**: Recharts for data visualization

**Props**:
```typescript
interface DailyLearningChartProps {
  data: {
    date: string;
    total: number;
  }[];
  isLoading: boolean;
  streak?: number;
}
```

### PerformancePie
**File**: `src/components/dashboard/PerformancePie.tsx`

**Purpose**: Show performance breakdown (correct/partial/wrong)

**Features**:
- Interactive pie chart
- Time period selection (1d, 7d, 30d, 90d)
- Percentage/absolute value toggle
- Performance trend indicators

## ❓ Question Components

### QuestionCard
**File**: `src/components/questions/QuestionCard.tsx`

**Purpose**: Display and handle question interactions

**Types Supported**:
- **MCQ**: Multiple choice questions
- **QROC**: Open-ended questions
- **Case**: Case-based question series

**Features**:
```tsx
interface QuestionCardProps {
  question: {
    id: string;
    type: 'mcq' | 'qroc' | 'case';
    text: string;
    options?: Option[];
    mediaUrl?: string;
    courseReminder?: string;
  };
  onAnswer: (answer: Answer) => void;
  showExplanation?: boolean;
  isAnswered?: boolean;
}
```

### QuestionNavigation
**File**: `src/components/questions/QuestionNavigation.tsx`

**Purpose**: Navigate between questions in a lecture

**Features**:
- Question progress indicator
- Quick jump to specific questions
- Answered/unanswered status
- Pinned question indicators

### QuestionStats
**File**: `src/components/questions/QuestionStats.tsx`

**Purpose**: Display question statistics for admins

**Features**:
- Answer distribution charts
- Success rate metrics
- User interaction analytics

## 🏥 Specialty Components

### SpecialtyCard
**File**: `src/components/specialties/SpecialtyCard.tsx`

**Purpose**: Display specialty information with progress

**Features**:
```tsx
interface SpecialtyCardProps {
  specialty: {
    id: string;
    name: string;
    description: string;
    icon: string;
    progress: {
      lectureProgress: number;
      questionProgress: number;
      averageScore: number;
    };
    _count: {
      lectures: number;
      questions: number;
    };
  };
  isPinned?: boolean;
  onPin?: () => void;
  onUnpin?: () => void;
}
```

**Visual Elements**:
- Medical icons
- Progress rings
- Performance badges
- Pin/unpin functionality

### SpecialtyFilter
**File**: `src/components/specialties/SpecialtyFilter.tsx`

**Purpose**: Filter specialties by niveau and semester

**Features**:
- Dropdown filters
- Search functionality
- Reset filters option
- URL parameter sync

## 👤 Admin Components

### AdminSidebar
**File**: `src/components/admin/AdminSidebar.tsx`

**Purpose**: Admin-specific navigation

**Menu Structure**:
```typescript
const adminMenuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Management', icon: BookOpen, href: '/admin/management' },
  { label: 'Sessions', icon: FileText, href: '/admin/sessions' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Import', icon: Upload, href: '/admin/import' },
  { label: 'Reports', icon: AlertTriangle, href: '/admin/reports' }
];
```

### ManagementTab
**File**: `src/components/admin/ManagementTab.tsx`

**Purpose**: Unified content management interface

**Features**:
- Tabbed interface (Specialties, Lectures, Questions)
- CRUD operations
- Bulk actions
- Search and filtering

### UserManagementTable
**File**: `src/components/admin/UserManagementTable.tsx`

**Purpose**: Manage user accounts and permissions

**Features**:
- User listing with search
- Role assignment
- Account status management
- Bulk operations

## 🎨 Styling System

### Tailwind CSS Configuration
**File**: `tailwind.config.ts`

**Custom Design Tokens**:
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        // ... more colors
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out"
      }
    }
  }
}
```

### CSS Variables (Dark/Light Theme)
**File**: `src/app/globals.css`

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
  /* ... more variables */
}
```

## 🔄 State Management

### React Context Usage
```typescript
// AuthContext example
const AuthContext = createContext<{
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
} | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Custom Hooks
```typescript
// useDashboardData hook
export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    dailyActivity: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return data;
}
```

## 📱 Responsive Design

### Breakpoint Strategy
```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px' // Extra large
};
```

### Mobile-First Components
```tsx
// Responsive layout example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="col-span-1 lg:col-span-2">
    {/* Main content */}
  </div>
  <div className="col-span-1">
    {/* Sidebar */}
  </div>
</div>
```

## 🔧 Component Development Guidelines

### Component Structure
```tsx
// Standard component template
interface ComponentProps {
  // Props definition
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState();
  
  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div className="component-classes">
      {/* Component JSX */}
    </div>
  );
}
```

### Best Practices
1. **TypeScript First**: All components use TypeScript
2. **Props Interface**: Define clear prop interfaces
3. **Accessibility**: Use semantic HTML and ARIA attributes
4. **Performance**: Implement React.memo for expensive components
5. **Testing**: Write unit tests for complex logic
6. **Documentation**: Document props and usage examples

---
*For component styling guidelines and theme customization, see the [Development Guide](../development/README.md).*
