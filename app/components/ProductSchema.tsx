interface ProductSchemaProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    product_url: string;
    brand: string;
    category: string;
  };
}

export function ProductSchema({ product }: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url || "https://pickgoods.com/placeholder.svg",
    "offers": {
      "@type": "Offer",
      "url": product.product_url,
      "priceCurrency": "KRW",
      "price": product.price,
      "availability": "https://schema.org/InStock",
    },
    "category": product.category
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
