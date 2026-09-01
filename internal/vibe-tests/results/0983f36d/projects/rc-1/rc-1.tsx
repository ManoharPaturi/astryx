import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet';

const navItems = [
  {label: 'Home', href: '/'},
  {label: 'Products', href: '/products'},
  {label: 'About', href: '/about'},
  {label: 'Contact', href: '/contact'},
];

export default function ResponsiveNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <nav className="border-b">
        <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
          <a href="/" className="text-xl font-bold">MyApp</a>

          <div className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-medium hover:text-primary transition-colors">
                {item.label}
              </a>
            ))}
          </div>

          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="text-lg font-medium"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Welcome</h1>
        <p className="text-muted-foreground">Resize the window to see the navigation collapse to a hamburger menu on mobile.</p>
      </main>
    </div>
  );
}
