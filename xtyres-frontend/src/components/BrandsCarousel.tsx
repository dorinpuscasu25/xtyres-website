import { StoreBrand } from '../lib/products';
interface BrandsCarouselProps {
  brands: StoreBrand[];
}
export function BrandsCarousel({ brands }: BrandsCarouselProps) {

  // Duplicate for seamless infinite scroll
  const duplicatedBrands = [...brands, ...brands, ...brands];
  return (
    <section className="py-16 bg-slate-50 border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Branduri Partenere
          </h2>
        </div>
      </div>

      {/* Infinite Marquee */}
      <div className="relative w-full overflow-hidden flex group">
        <div className="flex whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]">
          {duplicatedBrands.map((brand, index) =>
          <div
            key={index}
            className="inline-block px-8 md:px-16 text-2xl md:text-3xl font-heading font-black text-slate-300 hover:text-slate-900 transition-colors duration-300 cursor-default uppercase tracking-tighter">
            
              {brand.logoUrl ?
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-10 w-auto inline-block object-contain" /> :
            brand.name
            }
            </div>
          )}
        </div>
      </div>

      {brands.length === 0 ?
      <div className="max-w-7xl mx-auto px-4 pt-8 text-center text-sm text-slate-500">
          Brandurile vor apărea aici după ce sunt adăugate din admin.
        </div> :
      null}
    </section>);

}
