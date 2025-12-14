import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black bg-white">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="text-xl font-bold tracking-tight">AeroSense</div>
          <div className="flex items-center gap-8">
            <a href="#about" className="text-sm font-medium hover:opacity-70 transition-opacity">
              About
            </a>
            <a href="#features" className="text-sm font-medium hover:opacity-70 transition-opacity">
              Features
            </a>
            <a href="#contact" className="text-sm font-medium hover:opacity-70 transition-opacity">
              Contact
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="pt-16">
        <section className="container mx-auto px-6 py-32 min-h-[90vh] flex items-center">
          <div className="max-w-4xl">
            <h1 className="font-playfair text-7xl md:text-8xl lg:text-9xl font-bold leading-none mb-8 tracking-tight">
              Environmental
              <br />
              Analysis
              <br />
              Project
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl leading-relaxed font-light mb-12">
              Advanced data analysis and monitoring platform for environmental sustainability and ecological research.
            </p>
            <div className="flex gap-4">
              <Link
                href="/features"
                className="px-8 py-4 bg-black text-white font-medium hover:opacity-90 transition-opacity border border-black inline-block"
              >
                Get Started
              </Link>
              <button className="px-8 py-4 bg-white text-black font-medium hover:bg-black hover:text-white transition-all border border-black">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="border-t border-black py-32">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-playfair text-5xl md:text-6xl font-bold mb-6 leading-tight">
                  Our Mission
                </h2>
                <p className="text-lg leading-relaxed font-light">
                  We are dedicated to providing cutting-edge environmental data analysis tools
                  that empower researchers, organizations, and communities to make informed
                  decisions for a sustainable future.
                </p>
              </div>
              <div className="border border-black aspect-square flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl font-bold mb-4">●</div>
                  <p className="text-sm font-medium">Data-Driven Insights</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t border-black py-32">
          <div className="container mx-auto px-6">
            <h2 className="font-playfair text-5xl md:text-6xl font-bold mb-16 text-center">
              Key Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="border border-black p-8 hover:bg-black hover:text-white transition-all cursor-pointer">
                <h3 className="font-playfair text-2xl font-bold mb-4">Real-time Monitoring</h3>
                <p className="font-light leading-relaxed">
                  Track environmental metrics in real-time with our IoT-integrated sensors and data collection systems.
                </p>
              </div>
              <div className="border border-black p-8 hover:bg-black hover:text-white transition-all cursor-pointer">
                <h3 className="font-playfair text-2xl font-bold mb-4">AI Analysis</h3>
                <p className="font-light leading-relaxed">
                  Leverage machine learning algorithms to predict trends and identify patterns in environmental data.
                </p>
              </div>
              <div className="border border-black p-8 hover:bg-black hover:text-white transition-all cursor-pointer">
                <h3 className="font-playfair text-2xl font-bold mb-4">Comprehensive Reports</h3>
                <p className="font-light leading-relaxed">
                  Generate detailed analytical reports with visualizations and actionable insights for stakeholders.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="border-t border-black py-32 bg-black text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-playfair text-5xl md:text-6xl font-bold mb-8">
              Get In Touch
            </h2>
            <p className="text-lg font-light mb-12 max-w-2xl mx-auto">
              Ready to transform environmental data into actionable insights?
              Contact us to learn more about our platform.
            </p>
            <button className="px-8 py-4 bg-white text-black font-medium hover:opacity-90 transition-opacity border border-white">
              Contact Us
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-black bg-white py-12">
          <div className="container mx-auto px-6 text-center">
            <p className="text-sm font-light">
              © 2025 Environmental Analysis Project. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
