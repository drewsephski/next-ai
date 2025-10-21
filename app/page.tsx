import FooterSection from "@/components/homepage/footer";
import Integrations from "@/components/homepage/integrations";
import { getSubscriptionDetails } from "@/lib/subscription";
import PricingTable from "./pricing/_component/pricing-table";
import { HeroPreviewWalls } from "@/components/ui/hero-preview-walls";
import { Header } from "@/components/ui/header-3";
import { Features } from "@/components/blocks/features-11";


export default async function Home() {
  const subscriptionDetails = await getSubscriptionDetails();

  return (
    <>
      <Header />
      <HeroPreviewWalls />
      <Integrations />
      <Features />
      <PricingTable subscriptionDetails={subscriptionDetails} />
      <FooterSection />
    </>
  );
}
