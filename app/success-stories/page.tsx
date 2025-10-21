import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/ui/header-3";
import FooterSection from "@/components/homepage/footer";
import { Star, Quote, TrendingUp, Users, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SuccessStoriesPage() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp Inc.",
      content: "This platform transformed our workflow completely. We've seen a 300% increase in productivity and our team collaboration has never been better.",
      rating: 5,
      metrics: { increase: "300%", metric: "productivity boost" }
    },
    {
      name: "Michael Chen",
      role: "Startup Founder",
      company: "InnovateLab",
      content: "The analytics and insights provided have been game-changing for our decision making process. Highly recommend to any growing business.",
      rating: 5,
      metrics: { increase: "150%", metric: "faster decisions" }
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Manager",
      company: "Global Solutions",
      content: "Implementation was seamless and the support team is exceptional. Our operational costs decreased by 40% in just three months.",
      rating: 5,
      metrics: { increase: "40%", metric: "cost reduction" }
    }
  ];

  const caseStudies = [
    {
      title: "E-commerce Revolution",
      company: "ShopFlow",
      industry: "E-commerce",
      challenge: "Struggling with inventory management and customer analytics",
      solution: "Implemented comprehensive dashboard with real-time tracking",
      results: ["200% increase in sales", "50% reduction in inventory waste", "95% customer satisfaction rate"],
      icon: TrendingUp
    },
    {
      title: "Team Collaboration Boost",
      company: "CollabTech",
      industry: "Technology",
      challenge: "Remote teams struggling with communication and project tracking",
      solution: "Deployed integrated chat and project management features",
      results: ["80% faster project delivery", "60% improvement in team satisfaction", "99% uptime reliability"],
      icon: Users
    },
    {
      title: "Process Automation Success",
      company: "AutoBiz",
      industry: "Manufacturing",
      challenge: "Manual processes slowing down operations and causing errors",
      solution: "Automated workflows with intelligent file processing",
      results: ["70% reduction in processing time", "90% decrease in errors", "25% cost savings"],
      icon: Zap
    }
  ];

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-0">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-6">
            Customer Success Stories
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-medium lg:text-5xl">
            See How Our Platform Drives Real Results
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-balance text-lg">
            Discover how businesses like yours are achieving remarkable growth and efficiency with our comprehensive platform.
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 lg:px-0">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Don&apos;t just take our word for it. Here&apos;s what real customers have to say about their experience.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-sm leading-relaxed">{testimonial.content}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">+{testimonial.metrics.increase}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.metrics.metric}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-16 px-6 lg:px-0 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-4">Detailed Case Studies</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore in-depth stories of how our platform solved complex challenges and delivered measurable results.
            </p>
          </div>

          <div className="space-y-12">
            {caseStudies.map((study, index) => {
              const isReversed = index === 1; // Reverse the middle case study
              const heroImages = [
                "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/dashboard-gradient.png",
                "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/crm-featured.png",
                "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/featured-06.png"
              ];

              return (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`grid lg:grid-cols-2 gap-0 ${isReversed ? 'lg:grid-flow-col-dense' : ''}`}>
                      {!isReversed ? (
                        <>
                          <div className="p-8 lg:p-12">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <study.icon className="h-6 w-6 text-blue-600" />
                              </div>
                              <Badge variant="outline">{study.industry}</Badge>
                            </div>

                            <h3 className="text-2xl font-medium mb-4">{study.title}</h3>
                            <p className="text-muted-foreground mb-6">{study.company}</p>

                            <div className="space-y-6">
                              <div>
                                <h4 className="font-medium mb-2 text-red-600">Challenge</h4>
                                <p className="text-sm text-muted-foreground">{study.challenge}</p>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2 text-blue-600">Solution</h4>
                                <p className="text-sm text-muted-foreground">{study.solution}</p>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3 text-green-600">Results</h4>
                                <ul className="space-y-2">
                                  {study.results.map((result, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                                      {result}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="bg-linear-to-br from-blue-50 to-indigo-100 p-8 lg:p-12 flex items-center justify-center">
                            <img
                              src={heroImages[index]}
                              alt={`${study.title} preview`}
                              className="w-full h-64 max-w-md mx-auto object-cover rounded-lg shadow-lg"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-linear-to-br from-blue-50 to-indigo-100 p-8 lg:p-12 flex items-center justify-center order-2 lg:order-1">
                            <img
                              src={heroImages[index]}
                              alt={`${study.title} preview`}
                              className="w-full h-64 max-w-md mx-auto object-cover rounded-lg shadow-lg"
                            />
                          </div>

                          <div className="p-8 lg:p-12 order-1 lg:order-2">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <study.icon className="h-6 w-6 text-blue-600" />
                              </div>
                              <Badge variant="outline">{study.industry}</Badge>
                            </div>

                            <h3 className="text-2xl font-medium mb-4">{study.title}</h3>
                            <p className="text-muted-foreground mb-6">{study.company}</p>

                            <div className="space-y-6">
                              <div>
                                <h4 className="font-medium mb-2 text-red-600">Challenge</h4>
                                <p className="text-sm text-muted-foreground">{study.challenge}</p>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2 text-blue-600">Solution</h4>
                                <p className="text-sm text-muted-foreground">{study.solution}</p>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3 text-green-600">Results</h4>
                                <ul className="space-y-2">
                                  {study.results.map((result, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                                      {result}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 lg:px-0">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-medium mb-4">Ready to Join These Success Stories?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Start your journey towards better productivity, efficiency, and growth. Join thousands of satisfied customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <FooterSection />
    </>
  );
}
