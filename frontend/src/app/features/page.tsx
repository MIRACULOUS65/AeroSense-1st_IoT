import Link from "next/link";

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white text-black">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-black bg-white">
                <nav className="container mx-auto flex items-center justify-between px-6 py-4">
                    <a href="/" className="text-xl font-bold tracking-tight hover:opacity-70 transition-opacity">
                        AeroSense
                    </a>
                    <div className="flex items-center gap-8">
                        <a href="/#about" className="text-sm font-medium hover:opacity-70 transition-opacity">
                            About
                        </a>
                        <a href="/features" className="text-sm font-medium hover:opacity-70 transition-opacity">
                            Features
                        </a>
                        <a href="/#contact" className="text-sm font-medium hover:opacity-70 transition-opacity">
                            Contact
                        </a>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="pt-16">
                <section className="container mx-auto px-6 py-24 border-b border-black">
                    <div className="max-w-4xl">
                        <h1 className="font-playfair text-6xl md:text-7xl font-bold leading-tight mb-6">
                            Platform Features
                        </h1>
                        <p className="text-xl md:text-2xl leading-relaxed font-light max-w-3xl">
                            Discover the powerful capabilities that make our Environmental Analysis Platform
                            the premier choice for data-driven environmental insights.
                        </p>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="container mx-auto px-6 py-24">
                    <div className="grid gap-16">
                        {/* Feature 1 */}
                        <div className="grid md:grid-cols-2 gap-12 items-start">
                            <div className="order-2 md:order-1">
                                <Link
                                    href="/monitoring"
                                    className="border border-black aspect-square flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer group block"
                                >
                                    <div className="text-center p-12">
                                        <div className="text-8xl font-bold mb-6">●</div>
                                        <p className="text-lg font-medium">Real-time Data</p>
                                        <p className="text-xs mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Click to view live monitoring</p>
                                    </div>
                                </Link>
                            </div>
                            <div className="order-1 md:order-2 md:pt-12">
                                <div className="inline-block px-4 py-2 border border-black text-sm font-medium mb-6">
                                    01
                                </div>
                                <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                    Real-time Environmental Monitoring
                                </h2>
                                <p className="text-lg leading-relaxed font-light mb-6">
                                    Track environmental metrics in real-time with our IoT-integrated sensors and data
                                    collection systems. Monitor air quality, water quality, temperature, humidity, and
                                    more with instant updates.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="text-2xl">→</span>
                                        <span className="font-light">IoT sensor integration for continuous monitoring</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-2xl">→</span>
                                        <span className="font-light">Live dashboard with real-time data visualization</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-2xl">→</span>
                                        <span className="font-light">Automated alerts for critical threshold breaches</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="grid md:grid-cols-2 gap-12 items-start border-t border-black pt-16">
                            <div className="md:pt-12">
                                <div className="inline-block px-4 py-2 border border-black text-sm font-medium mb-6">
                                    02
                                </div>
                                <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                    AI-Powered Analytics
                                </h2>
                                <p className="text-lg leading-relaxed font-light mb-6">
                                    Leverage advanced machine learning algorithms to predict environmental trends,
                                    identify patterns, and generate actionable insights from complex datasets.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="text-2xl">→</span>
                                        <span className="font-light">Predictive modeling for future environmental conditions</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-2xl">→</span>
                                        <span className="font-light">Pattern recognition for anomaly detection</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-2xl">→</span>
                                        <span className="font-light">Machine learning models tailored to your data</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <Link
                                    href="/ai-chat"
                                    className="border border-black aspect-square flex items-center justify-center bg-black text-white hover:opacity-90 transition-opacity cursor-pointer group block"
                                >
                                    <div className="text-center p-12">
                                        <div className="text-8xl font-bold mb-6">◆</div>
                                        <p className="text-lg font-medium">AI Analysis</p>
                                        <p className="text-xs mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Click to chat with AI</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="grid md:grid-cols-2 gap-12 items-start border-t border-black pt-16">
                            <div className="order-2 md:order-1">
                                <Link
                                    href="/reporting"
                                    className="border border-black aspect-square flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer group block"
                                >
                                    <div className="text-center p-12">
                                        <div className="text-8xl font-bold mb-6">■</div>
                                        <p className="text-lg font-medium">Data Reports</p>
                                        <p className="text-xs mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Click for detailed reports</p>
                                    </div>
                                </Link>
                            </div>
                            <div className="order-1 md:order-2 md:pt-12">
                                <div className="inline-block px-4 py-2 border border-black text-sm font-medium mb-6">
                                    03
                                </div>
                                <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                    Comprehensive Reporting
                                </h2>
                                <p className="text-lg leading-relaxed font-light mb-6">
                                    Generate detailed analytical reports with professional visualizations and actionable
                                    insights. Export data in multiple formats for stakeholder presentations and compliance.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="text-2xl">→</span>
                                        <span className="font-light">Customizable report templates and branding</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-2xl">→</span>
                                        <span className="font-light">Interactive charts and data visualizations</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-2xl">→</span>
                                        <span className="font-light">Export to PDF, Excel, CSV, and JSON formats</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="grid md:grid-cols-2 gap-12 items-start border-t border-black pt-16">
                            <div className="md:pt-12">
                                <div className="inline-block px-4 py-2 border border-black text-sm font-medium mb-6">
                                    04
                                </div>
                                <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                    Environmental Data History & Analytics
                                </h2>
                                <p className="text-lg leading-relaxed font-light mb-6">
                                    Access precise historical environmental metrics—temperature, humidity, wind, and AQI—captured and stored securely over time. Retrieve data for any selected date range and visualize it through intuitive graphs and detailed daily tables.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="text-2xl">→</span>
                                        <span className="font-light">Accurate historical records for temperature, humidity, wind speed, and AQI</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-2xl">→</span>
                                        <span className="font-light">Daily environmental data shown in structured tables
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-2xl">→</span>
                                        <span className="font-light">Dynamic temperature and air-quality graphs generated when sufficient data is available</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <Link
                                    href="/weather"
                                    className="border border-black aspect-square flex items-center justify-center bg-black text-white hover:opacity-90 transition-opacity cursor-pointer group block"
                                >
                                    <div className="text-center p-12">
                                        <div className="text-8xl font-bold mb-6">▲</div>
                                        <p className="text-lg font-medium">Cloud Platform</p>
                                        <p className="text-xs mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Click to view historical data</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="border-t border-black py-24 bg-black text-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-lg font-light mb-8 max-w-2xl mx-auto">
                            Join organizations worldwide using our platform for environmental analysis.
                        </p>
                        <a
                            href="/#contact"
                            className="inline-block px-8 py-4 bg-white text-black font-medium hover:opacity-90 transition-opacity border border-white"
                        >
                            Contact Us
                        </a>
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
