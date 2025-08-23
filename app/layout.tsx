import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './components/AuthContext';
import { AdminProvider } from './components/AdminContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TopToolbarWrapper from './components/TopToolbarWrapper';

export const metadata: Metadata = {
  title: 'Document Maker - Create Assignments & Presentations',
  description: 'A powerful online tool for creating professional documents and presentations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts for Arabic, Urdu, and other languages */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Scheherazade+New:wght@400;700&family=Amiri:wght@400;700&family=Reem+Kufi:wght@400;500;600;700&family=Cairo:wght@200;300;400;500;600;700;800;900&family=Tajawal:wght@200;300;400;500;700;800;900&family=Almarai:wght@300;400;700;800&family=Changa:wght@200;300;400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@100;200;300;400;500;600;700&family=Lateef:wght@200;300;400;500;600;700;800&family=Harmattan:wght@400&family=Rakkas:wght@400&family=Aref+Ruqaa:wght@400;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Jameel+Noori+Nastaleeq&family=Alvi+Nastaleeq&family=Pak+Nastaleeq&family=Fajer+Noori+Nastaleeq&family=Gulzar&family=Nafees+Nastaleeq&family=Mehr+Nastaliq&family=Urdu+Typesetting&family=Vazir:wght@100;200;300;400;500;600;700;800;900&family=Vazir+Code:wght@100;200;300;400;500;600;700;800;900&family=Noto+Sans+Hebrew:wght@100;200;300;400;500;600;700;800;900&family=Noto+Serif+Hebrew:wght@100;200;300;400;500;600;700;800;900&family=Alef:wght@400;700&family=Noto+Sans+Devanagari:wght@100;200;300;400;500;600;700;800;900&family=Noto+Serif+Devanagari:wght@100;200;300;400;500;600;700;800;900&family=Roboto:wght@100;300;400;500;700;900&family=Open+Sans:wght@300;400;500;600;700;800&family=Lato:wght@100;300;400;700;900&family=Poppins:wght@100;200;300;400;500;600;700;800;900&family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Source+Sans+Pro:wght@200;300;400;600;700;900&family=Raleway:wght@100;200;300;400;500;600;700;800;900&family=Ubuntu:wght@300;400;500;700&family=Nunito:wght@200;300;400;500;600;700;800;900&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Work+Sans:wght@100;200;300;400;500;600;700;800;900&family=Quicksand:wght@300;400;500;600;700&family=Josefin+Sans:wght@100;200;300;400;500;600;700&family=Dancing+Script:wght@400;500;600;700&family=Pacifico&family=Great+Vibes&family=Satisfy&family=Kaushan+Script&family=Lobster&family=Bangers&family=Permanent+Marker&family=Caveat:wght@400;500;600;700&family=Indie+Flower&family=Architects+Daughter&family=Gloria+Hallelujah&family=Patrick+Hand&family=Rock+Salt&family=Homemade+Apple&family=Kalam:wght@300;400;700&family=Reenie+Beanie&family=Just+Another+Hand&family=Chewy&family=Fredoka+One&family=Bubblegum+Sans&family=Abril+Fatface&family=Playfair+Display:wght@300;400;500;600;700;800;900&family=Merriweather:wght@300;400;700;900&family=Lora:wght@400;500;600;700&family=Source+Serif+Pro:wght@200;300;400;600;700;900&family=Crimson+Text:wght@400;600;700&family=Libre+Baskerville:wght@400;700&family=Alegreya:wght@400;500;700;800;900&family=Noto+Serif:wght@100;200;300;400;500;600;700;800;900&family=PT+Serif:wght@400;700&family=Bitter:wght@100;200;300;400;500;600;700;800;900&family=Slabo+27px&family=Arvo:wght@400;700&family=Vollkorn:wght@400;500;600;700;800;900&family=Old+Standard+TT:wght@400;700&family=Cardo:wght@400;700&family=Gentium+Book+Basic:wght@400;700&family=DM+Sans:wght@100;200;300;400;500;600;700;800;900&family=Manrope:wght@200;300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&family=Figtree:wght@300;400;500;600;700;800;900&family=Albert+Sans:wght@100;200;300;400;500;600;700;800;900&family=General+Sans:wght@200;300;400;500;600;700&family=Cabinet+Grotesk:wght@100;200;300;400;500;600;700;800;900&family=Switzer:wght@100;200;300;400;500;600;700;800;900&family=Clash+Display:wght@200;300;400;500;600;700&family=Clash+Grotesk:wght@200;300;400;500;600;700&family=Satoshi:wght@300;400;500;700;900&family=Gambarino:wght@400;500;600;700&family=Newsreader:wght@200;300;400;500;600;700;800&family=Crimson+Pro:wght@200;300;400;500;600;700;800;900&family=Fraunces:wght@100;200;300;400;500;600;700;800;900&family=Recia:wght@300;400;500;600;700;800&family=Zilla+Slab:wght@300;400;500;600;700&family=IBM+Plex+Serif:wght@100;200;300;400;500;600;700&family=Noto+Serif+Display:wght@100;200;300;400;500;600;700;800;900&family=Computer+Modern&family=Latin+Modern&family=TeX+Gyre&family=Charter&family=New+Century+Schoolbook&family=Caslon&family=Minion&family=Myriad&family=Frutiger&family=Univers&family=Akzidenz+Grotesk&family=Helvetica+Neue&family=Lucida+Grande&family=Inconsolata:wght@200;300;400;500;600;700;800;900&family=Fira+Code:wght@300;400;500;600;700&family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&family=Source+Code+Pro:wght@200;300;400;500;600;700;800;900&family=Cascadia+Code:wght@200;300;400;500;600;700&family=Hack:wght@300;400;700&family=Anonymous+Pro:wght@400;700&family=DejaVu+Sans+Mono&family=Liberation+Mono&family=Nimbus+Mono+L&family=URW+Gothic+L&family=URW+Bookman+L&family=URW+Chancery+L&family=URW+Palladio+L&family=Comfortaa:wght@300;400;500;600;700&family=Bebas+Neue&family=Allura&family=Alex+Brush&family=Tangerine:wght@400;700&family=Outfit:wght@100;200;300;400;500;600;700;800;900&family=Onest:wght@100;200;300;400;500;600;700;800;900&family=Geist:wght@100;200;300;400;500;600;700;800;900&family=Bodoni+Moda:wght@400;500;600;700;800;900&family=Monaco&family=Consolas&family=Menlo&family=SF+Mono&family=Times+New+Roman&family=Georgia&family=Verdana&family=Tahoma&family=Trebuchet+MS&family=Courier+New&family=Garamond&family=Baskerville&family=Palatino&family=Optima&family=Futura&family=Gill+Sans&family=Myriad+Pro&family=Segoe+UI&family=Helvetica&family=Arial&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors min-h-screen flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <AdminProvider>
              <Navbar />
              <TopToolbarWrapper />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </AdminProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}