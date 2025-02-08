import { Button } from "./ui/button";

export function Hero() {
  return (
    <div className="relative min-h-screen bg-dark pt-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 w-1/2 h-1/2 opacity-30">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full text-brand-blue"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M44.5,-76.3C59.3,-69.9,73.8,-60.1,83.7,-46.3C93.6,-32.5,98.9,-14.7,97.7,2.7C96.5,20.1,88.8,37.1,77.8,50.8C66.8,64.5,52.5,74.9,36.9,79.7C21.2,84.5,4.3,83.7,-12.4,80.6C-29,77.5,-45.4,72.1,-59.1,62.3C-72.9,52.5,-84,38.3,-89.5,21.8C-95,5.3,-94.9,-13.5,-89.1,-30.2C-83.3,-46.9,-71.8,-61.5,-57,-70.8C-42.2,-80.1,-24.1,-84.1,-6.6,-74.1C10.9,-64.1,29.7,-82.7,44.5,-76.3Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>
        <div className="absolute -right-1/4 bottom-0 w-1/2 h-1/2 opacity-30">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full text-brand-purple"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M42.7,-73.4C55.9,-67.3,67.7,-57.2,77.5,-44.5C87.3,-31.8,95.1,-16.4,94.9,-0.1C94.7,16.2,86.5,32.3,76.7,46.5C66.9,60.7,55.5,72.9,41.6,79.2C27.7,85.5,11.4,85.9,-3.2,81.1C-17.8,76.3,-35.6,66.3,-48.1,54.3C-60.6,42.3,-67.8,28.3,-73.7,12.6C-79.6,-3.1,-84.2,-20.6,-79.6,-34.6C-75,-48.6,-61.2,-59.2,-46.5,-64.8C-31.8,-70.4,-16.4,-71.1,-0.3,-70.6C15.8,-70.1,31.5,-68.4,42.7,-73.4Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Unlock AI-Powered Insights to Drive{" "}
          <span className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink bg-clip-text text-transparent">
            Business Decisions Today
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-12">
          Transform your data into actionable intelligence with our AI-driven SaaS, designed to optimize efficiency,
          automate workflows, and provide predictive insights for informed decision-making.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-full px-8"
          >
            Book a Demo
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-white border-gray-700 hover:bg-gray-800 rounded-full px-8"
          >
            Take Product Tour
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-gray-500 mb-8">
          TRUSTED BY COMPANIES IN 100+ COUNTRIES AROUND THE GLOBE.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 items-center opacity-50">
          <img src="/logos/walmart.svg" alt="Walmart" className="h-8" />
          <img src="/logos/amazon.svg" alt="Amazon" className="h-8" />
          <img src="/logos/aliexpress.svg" alt="AliExpress" className="h-8" />
          <img src="/logos/ebay.svg" alt="eBay" className="h-8" />
          <img src="/logos/apple.svg" alt="Apple" className="h-8" />
          <img src="/logos/samsung.svg" alt="Samsung" className="h-8" />
          <img src="/logos/nike.svg" alt="Nike" className="h-8" />
        </div>
      </div>
    </div>
  );
}
