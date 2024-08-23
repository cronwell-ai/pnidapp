import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export default function NavigationIconLink(
  {isExpanded, className, href, label, icon, onClick}: 
  {isExpanded: boolean, className?: string, href: string, label: string, icon: React.ReactNode, onClick?: () => void}
) {
  const pathname = usePathname()
  const isActive = pathname === href

    const iconClasses = [
      'absolute left-0 top-0 flex rounded items-center h-10 w-10 items-center justify-center', // Layout
    ]

    const classes = [
      'relative',
      'h-10 w-10 group-data-[state=expanded]:w-full',
      'transition-all duration-200',
      'flex items-center rounded',
      'group-data-[state=collapsed]:justify-center',
      'group-data-[state=expanded]:-space-x-2',
      'text-muted-foreground hover:text-primary font-medium',
      'hover:bg-border',
      `${isActive ? 'bg-border text-primary' : ''}`,
      'group/item',
    ]

    return <Link
        role="button"
        aria-current={isActive}
        href={href}
        onClick={onClick}
        className={cn(classes, className)}
      >
        <span id="icon-link" className={cn(...iconClasses)}>
          {icon}
        </span>
        <span
          aria-hidden={isExpanded}
          className={cn(
            'min-w-[128px] text-sm text-foreground-light',
            'group-hover/item:text-foreground',
            'group-aria-current/item:text-foreground',
            'absolute left-7 group-data-[state=expanded]:left-12',
            'opacity-0 group-data-[state=expanded]:opacity-100',
            'transition-all'
          )}
        >
          {label}
        </span>
      </Link>
  }