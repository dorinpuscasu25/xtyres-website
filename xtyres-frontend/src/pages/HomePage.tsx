import { useEffect, useState } from 'react';
import { HeroSection } from '../components/HeroSection';
import { TireSearchForm } from '../components/TireSearchForm';
import { CategoryCards } from '../components/CategoryCards';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { ServicesSection } from '../components/ServicesSection';
import { BrandsCarousel } from '../components/BrandsCarousel';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { ContactBanner } from '../components/ContactBanner';
import { storefrontApi } from '../lib/api';
import { useTranslation } from '../lib/i18n';
import { Product, StoreBrand, StoreCategory } from '../lib/products';
import { NavigateFn } from '../lib/navigation';
interface HomePageProps {
  onNavigate: NavigateFn;
}
export function HomePage({ onNavigate }: HomePageProps) {
  const { locale } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<StoreCategory[]>(
    [],
  );
  const [brands, setBrands] = useState<StoreBrand[]>([]);

  useEffect(() => {
    storefrontApi.home(locale).then((response) => {
      setFeaturedProducts(response.featuredProducts);
      setFeaturedCategories(response.featuredCategories);
      setBrands(response.brands);
    }).catch((error) => {
      console.error('Failed to load home data', error);
    });
  }, [locale]);
  return (
    <main className="flex-grow">
      <HeroSection />
      <TireSearchForm onNavigate={onNavigate} />
      <CategoryCards categories={featuredCategories} onNavigate={onNavigate} />
      <FeaturedProducts products={featuredProducts} onNavigate={onNavigate} />
      <ServicesSection />
      <BrandsCarousel brands={brands} />
      <WhyChooseUs />
      <ContactBanner />
    </main>);

}
