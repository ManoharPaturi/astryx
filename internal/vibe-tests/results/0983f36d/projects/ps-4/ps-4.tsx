import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator} from '@/components/ui/breadcrumb';

export default function ProductDetailPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/electronics">Electronics</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/electronics/headphones">Headphones</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>ProMax Studio Headphones</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="ghost" onClick={() => window.history.back()}>Back</Button>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">ProMax Studio Headphones</h1>
            <Badge>In Stock</Badge>
          </div>
          <p className="text-xl font-semibold">$299.99</p>
          <p className="text-muted-foreground">Premium over-ear headphones with active noise cancellation and 40-hour battery life.</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Product Details</h3>
          <p className="text-sm">Driver Size: 40mm custom dynamic drivers</p>
          <p className="text-sm">Frequency Response: 4Hz - 40kHz</p>
          <p className="text-sm">Battery Life: Up to 40 hours (ANC on)</p>
          <p className="text-sm">Weight: 250g</p>
          <p className="text-sm">Connectivity: Bluetooth 5.3, USB-C, 3.5mm</p>
        </div>

        <div className="flex gap-2">
          <Button>Add to Cart</Button>
          <Button variant="outline">Add to Wishlist</Button>
        </div>
      </div>
    </div>
  );
}
