import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { isLoggedIn } from '../utils/auth';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const featuredCategories = [
        {
            id: 1,
            name: 'Paintings',
            description: 'Original artwork from talented artists',
            image: '/images/paintings.jpg',
            count: '120+ Items',
            color: 'from-purple-500 to-pink-500'
        },
        {
            id: 2,
            name: 'Sculptures',
            description: 'Handcrafted 3D art pieces',
            image: '/images/sculptures.jpg',
            count: '85+ Items',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 3,
            name: 'Photography',
            description: 'Captivating visual stories',
            image: '/images/photography.jpg',
            count: '200+ Items',
            color: 'from-green-500 to-emerald-500'
        },
        {
            id: 4,
            name: 'Digital Art',
            description: 'Modern digital creations',
            image: '/images/digital-art.jpg',
            count: '150+ Items',
            color: 'from-orange-500 to-red-500'
        }
    ];

    const stats = [
        { number: '10,000+', label: 'Art Pieces' },
        { number: '500+', label: 'Verified Artists' },
        { number: '50+', label: 'Categories' },
        { number: '98%', label: 'Happy Customers' }
    ];

    const features = [
        {
            icon: '🚚',
            title: 'Free Shipping',
            description: 'Free delivery on orders over $50'
        },
        {
            icon: '🔒',
            title: 'Secure Payment',
            description: '100% secure payment processing'
        },
        {
            icon: '🎁',
            title: 'Gift Ready',
            description: 'Perfect packaging for gifts'
        },
        {
            icon: '↩️',
            title: 'Easy Returns',
            description: '30-day return policy'
        }
    ];

    const testimonials = [
        {
            quote: "The quality of artwork exceeded my expectations. Absolutely stunning!",
            author: "Sarah M.",
            role: "Art Collector",
            avatar: "/images/avatar1.jpg"
        },
        {
            quote: "Found the perfect piece for my living room. The artists are incredibly talented.",
            author: "James L.",
            role: "Interior Designer",
            avatar: "/images/avatar2.jpg"
        },
        {
            quote: "As an artist, Art Vibe has given me the platform I needed to reach art lovers worldwide.",
            author: "Elena R.",
            role: "Featured Artist",
            avatar: "/images/avatar3.jpg"
        }
    ];

    const handleExploreClick = () => {
        navigate('/products');
    };

    const handleQuickAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }
        // This would be for a featured product - you can implement actual product data
        alert('Feature coming soon! Browse products to add items to cart.');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                                Discover Your
                                <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    Next Masterpiece
                                </span>
                            </h1>
                            <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed">
                                Curated artwork from verified artists worldwide.
                                Transform your space with unique, authentic pieces.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button
                                    onClick={handleExploreClick}
                                    className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                                >
                                    Explore Collection
                                </button>
                                <button
                                    onClick={() => navigate('/products')}
                                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-all duration-300 transform hover:scale-105"
                                >
                                    Meet Artists
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                        <img src="https://imgs.search.brave.com/F0C4LsP-1ir4FVRAlOaiK0DIoMTm6WNRUfb2S8IfzKc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy9h/L2EwL01ha2VyX3Vu/a25vd24sX0luZGlh/Xy1fS3Jpc2huYV9h/bmRfUmFkaGFfLV9H/b29nbGVfQXJ0X1By/b2plY3QuanBn" alt="Art" className="w-full h-48 object-cover rounded-xl" />
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                                        <img src="/images/hero-2.jpg" alt="Art" className="w-full h-32 object-cover rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-4 mt-8">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                                        <img src="https://imgs.search.brave.com/GtONCiWD6WXQl4YmkDUr73kLUVEU0nLBV2qSaI085u8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hcnRs/b2dpYy1yZXMuY2xv/dWRpbmFyeS5jb20v/d182MDAsY19saW1p/dCxmX2F1dG8sZmxf/bG9zc3kscV9hdXRv/L3dzLWFydGxvZ2lj/d2Vic2l0ZTA3NDEv/dXNyL2ltYWdlcy9h/cnR3b3Jrcy9tYWlu/X2ltYWdlL2l0ZW1z/LzhjLzhjMTRmNDli/YWRmYzQzZmE5MWJj/Y2ZjMDFlM2U4MzAx/L3doZXJlLXRoZS1i/ZWVzLWZseS1ieS1i/eS1kZWJiaWUtbGVl/LWF0LWFsY2hlbWlz/dC1nYWxsZXJ5Lmpw/Zw" alt="Art" className="w-full h-32 object-cover rounded-xl" />
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                                        <img src="https://imgs.search.brave.com/NHVV05uREaQzc7rWAn_M8dr3hmYvrTEnb7c22kJXNQs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/bWNnZWVhbmRjby5j/b20vY2RuL3Nob3Av/ZmlsZXMvMjAyNDAx/MDRfU1NfRGVjb3Jf/TGlnaHRpbmdfMDA1/LVQuanBnP3Y9MTc1/ODEzOTQ4OCZ3aWR0/aD0xMjAw" alt="Art" className="w-full h-48 object-cover rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12">
                        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-white"></path>
                        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-white"></path>
                        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-white"></path>
                    </svg>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Explore by Category
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover art that speaks to you across various mediums and styles
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredCategories.map((category) => (
                            <Link
                                key={category.id}
                                to="/products"
                                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                            >
                                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-white text-center p-6">
                                            <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                                            <p className="text-white/80 mb-4">{category.description}</p>
                                            <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                                                {category.count}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Art Vibe?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We're committed to providing the best experience for both art lovers and artists
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center group">
                                <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">{feature.icon}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            What Our Community Says
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Join thousands of satisfied art lovers and talented artists
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                                <div className="text-amber-400 text-2xl mb-4">★★★★★</div>
                                <p className="text-gray-700 text-lg mb-6 italic">"{testimonial.quote}"</p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                        {testimonial.author.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.author}</div>
                                        <div className="text-gray-600 text-sm">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                        Ready to Find Your Perfect Piece?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of art enthusiasts discovering unique artwork every day.
                        Start your collection today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleExploreClick}
                            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                        >
                            Start Shopping
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
                        >
                            Become an Artist
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;