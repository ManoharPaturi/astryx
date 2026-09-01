import {Breadcrumbs} from '@astryxdesign/core/Breadcrumbs';
import {BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';

export default function ProductDetailPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/electronics">Electronics</BreadcrumbItem>
        <BreadcrumbItem href="/electronics/headphones">Headphones</BreadcrumbItem>
        <BreadcrumbItem>ProMax Studio Headphones</BreadcrumbItem>
      </Breadcrumbs>

      <Button label="Back" variant="ghost" onClick={() => window.history.back()} />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Heading level={1}>ProMax Studio Headphones</Heading>
            <Badge variant="success" label="In Stock" />
          </div>
          <Text type="large">$299.99</Text>
          <Text color="secondary">Premium over-ear headphones with active noise cancellation and 40-hour battery life.</Text>
        </div>

        <div className="flex flex-col gap-2">
          <Heading level={3}>Product Details</Heading>
          <Text>Driver Size: 40mm custom dynamic drivers</Text>
          <Text>Frequency Response: 4Hz - 40kHz</Text>
          <Text>Battery Life: Up to 40 hours (ANC on)</Text>
          <Text>Weight: 250g</Text>
          <Text>Connectivity: Bluetooth 5.3, USB-C, 3.5mm</Text>
        </div>

        <div className="flex gap-2">
          <Button label="Add to Cart" variant="primary" />
          <Button label="Add to Wishlist" variant="secondary" />
        </div>
      </div>
    </div>
  );
}
