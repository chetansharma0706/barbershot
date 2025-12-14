import { Tables } from "@/database.types";

type Shop = Tables<'barber_shops'>
export default function ShopPage({ shop }: { shop: Shop}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <h1 className="text-4xl font-bold mb-6">Welcome to the Shop Page</h1>
       <p><strong>Shop subdomain:</strong> {shop.subdomain}</p>
        <p>This is a public shop website.</p>
      <p className="text-lg">Explore our products and services!</p>
    </div>
  );
}