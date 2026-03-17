import { ReactNode, createContext, useContext, useState } from 'react';
export interface Review {
  id: string;
  productId: number;
  name: string;
  email: string;
  rating: number;
  text: string;
  date: string;
}
interface ReviewsContextType {
  reviews: Record<number, Review[]>;
  addReview: (
  productId: number,
  review: Omit<Review, 'id' | 'productId' | 'date'>)
  => void;
  getReviews: (productId: number) => Review[];
}
const initialReviews: Record<number, Review[]> = {
  1: [
  {
    id: 'r1',
    productId: 1,
    name: 'Ion Popescu',
    email: 'ion@example.com',
    rating: 5,
    text: 'Anvelope excelente pentru prețul lor. Recomand cu încredere!',
    date: '2026-03-10'
  }],

  4: [
  {
    id: 'r2',
    productId: 4,
    name: 'Andrei V.',
    email: 'andrei@example.com',
    rating: 4,
    text: 'Foarte bune pe zăpadă, dar puțin zgomotoase pe asfalt uscat.',
    date: '2026-02-15'
  }]

};
const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);
export function ReviewsProvider({ children }: {children: ReactNode;}) {
  const [reviews, setReviews] =
  useState<Record<number, Review[]>>(initialReviews);
  const addReview = (
  productId: number,
  reviewData: Omit<Review, 'id' | 'productId' | 'date'>) =>
  {
    const newReview: Review = {
      ...reviewData,
      id: Math.random().toString(36).substring(2, 9),
      productId,
      date: new Date().toISOString().split('T')[0]
    };
    setReviews((prev) => ({
      ...prev,
      [productId]: [newReview, ...(prev[productId] || [])]
    }));
  };
  const getReviews = (productId: number) => {
    return reviews[productId] || [];
  };
  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        addReview,
        getReviews
      }}>
      
      {children}
    </ReviewsContext.Provider>);

}
export function useReviews() {
  const context = useContext(ReviewsContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
}
