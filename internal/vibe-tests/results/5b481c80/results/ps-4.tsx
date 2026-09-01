import {Breadcrumbs} from '@astryxdesign/core/Breadcrumbs';
import {BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Badge} from '@astryxdesign/core/Badge';

export default function ProductDetailPage() {
  return (
    <VStack gap={4} padding={4}>
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/electronics">Electronics</BreadcrumbItem>
        <BreadcrumbItem href="/electronics/headphones">Headphones</BreadcrumbItem>
        <BreadcrumbItem>ProMax Studio Headphones</BreadcrumbItem>
      </Breadcrumbs>

      <Button label="Back" variant="ghost" onClick={() => window.history.back()} />

      <VStack gap={6}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Heading level={1}>ProMax Studio Headphones</Heading>
            <Badge variant="success" label="In Stock" />
          </HStack>
          <Text type="large">$299.99</Text>
          <Text color="secondary">Premium over-ear headphones with active noise cancellation and 40-hour battery life.</Text>
        </VStack>

        <VStack gap={2}>
          <Heading level={3}>Product Details</Heading>
          <Text>Driver Size: 40mm custom dynamic drivers</Text>
          <Text>Frequency Response: 4Hz - 40kHz</Text>
          <Text>Battery Life: Up to 40 hours (ANC on)</Text>
          <Text>Weight: 250g</Text>
          <Text>Connectivity: Bluetooth 5.3, USB-C, 3.5mm</Text>
        </VStack>

        <HStack gap={2}>
          <Button label="Add to Cart" variant="primary" />
          <Button label="Add to Wishlist" variant="secondary" />
        </HStack>
      </VStack>
    </VStack>
  );
}
