import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { CategorySection } from "@/components/home/category-section"
import { NewsletterSection } from "@/components/home/newsletter-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { PageTransition } from "@/components/page-transition"

export default function HomePage() {
  return (
    <PageTransition className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </PageTransition>
  )
}
