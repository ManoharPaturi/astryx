import {AppShell} from '@astryxdesign/core/AppShell';
import {TopNav} from '@astryxdesign/core/TopNav';
import {TopNavItem} from '@astryxdesign/core/TopNav';
import {MobileNav} from '@astryxdesign/core/MobileNav';
import {MobileNavToggle} from '@astryxdesign/core/MobileNav';
import {SideNavItem} from '@astryxdesign/core/SideNav';
import {SideNavSection} from '@astryxdesign/core/SideNav';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';

const navItems = [
  {label: 'Home', href: '/'},
  {label: 'Products', href: '/products'},
  {label: 'About', href: '/about'},
  {label: 'Contact', href: '/contact'},
];

export default function ResponsiveNavigation() {
  return (
    <AppShell>
      <TopNav
        heading={<Heading level={4}>MyApp</Heading>}
        startContent={
          <>
            <MobileNavToggle />
            {navItems.map((item) => (
              <TopNavItem key={item.label} href={item.href}>
                {item.label}
              </TopNavItem>
            ))}
          </>
        }
      />
      <MobileNav header="Navigation">
        <SideNavSection>
          {navItems.map((item) => (
            <SideNavItem key={item.label} href={item.href}>
              {item.label}
            </SideNavItem>
          ))}
        </SideNavSection>
      </MobileNav>
      <VStack padding={4} gap={4}>
        <Heading level={1}>Welcome</Heading>
        <Text>Resize the window to see the navigation collapse to a hamburger menu on mobile.</Text>
      </VStack>
    </AppShell>
  );
}
