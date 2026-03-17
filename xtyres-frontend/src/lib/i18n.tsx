import { ReactNode, createContext, useContext, useState } from 'react';
type Locale = 'ro' | 'ru';
const translations = {
  ro: {
    'nav.home': 'Acasă',
    'nav.tires': 'Anvelope',
    'nav.summer': 'Anvelope de Vară',
    'nav.winter': 'Anvelope de Iarnă',
    'nav.allseason': 'All Season',
    'nav.batteries': 'Acumulatoare',
    'nav.delivery': 'Livrare',
    'nav.about': 'Despre noi',
    'nav.contact': 'Contacte',
    'search.placeholder': 'Caută anvelope, acumulatoare...',
    'search.all_results': 'Vezi toate rezultatele',
    'btn.add_to_cart': 'Adaugă în coș',
    'btn.buy_now': 'Cumpără într-un click',
    'btn.search': 'Căutare',
    'btn.send_message': 'Trimite mesajul',
    'btn.reset_filters': 'Resetează filtrele',
    'badge.new': 'Nou',
    'badge.super_price': 'Super Preț',
    'badge.free_mounting': 'Montare gratuită',
    'badge.discount': 'Reducere',
    'page.products.title': 'Catalog produse',
    'page.products.showing': 'Afișez {count} produse',
    'page.products.sort': 'Sortează după',
    'page.products.filters': 'Filtre',
    'page.contact.title': 'Contacte',
    'page.about.title': 'Despre Noi',
    'section.similar_products': 'Produse Similare',
    'section.top_products': 'Produse de Top',
    'filter.season': 'Sezon',
    'filter.diameter': 'Diametru',
    'filter.width': 'Lățime',
    'filter.brand': 'Brand',
    'filter.price': 'Preț'
  },
  ru: {
    'nav.home': 'Главная',
    'nav.tires': 'Шины',
    'nav.summer': 'Летние шины',
    'nav.winter': 'Зимние шины',
    'nav.allseason': 'Всесезонные',
    'nav.batteries': 'Аккумуляторы',
    'nav.delivery': 'Доставка',
    'nav.about': 'О нас',
    'nav.contact': 'Контакты',
    'search.placeholder': 'Поиск шин, аккумуляторов...',
    'search.all_results': 'Смотреть все результаты',
    'btn.add_to_cart': 'В корзину',
    'btn.buy_now': 'Купить в один клик',
    'btn.search': 'Поиск',
    'btn.send_message': 'Отправить сообщение',
    'btn.reset_filters': 'Сбросить фильтры',
    'badge.new': 'Новинка',
    'badge.super_price': 'Супер цена',
    'badge.free_mounting': 'Бесплатный монтаж',
    'badge.discount': 'Скидка',
    'page.products.title': 'Каталог товаров',
    'page.products.showing': 'Показано {count} товаров',
    'page.products.sort': 'Сортировать по',
    'page.products.filters': 'Фильтры',
    'page.contact.title': 'Контакты',
    'page.about.title': 'О Нас',
    'section.similar_products': 'Похожие товары',
    'section.top_products': 'Топ продаж',
    'filter.season': 'Сезон',
    'filter.diameter': 'Диаметр',
    'filter.width': 'Ширина',
    'filter.brand': 'Бренд',
    'filter.price': 'Цена'
  }
};
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}
const I18nContext = createContext<I18nContextType | undefined>(undefined);
export function TranslationProvider({ children }: {children: ReactNode;}) {
  const [locale, setLocale] = useState<Locale>('ro');
  const t = (key: string, params?: Record<string, string | number>) => {
    let text =
    translations[locale][key as keyof (typeof translations)['ro']] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };
  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t
      }}>
      
      {children}
    </I18nContext.Provider>);

}
export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
