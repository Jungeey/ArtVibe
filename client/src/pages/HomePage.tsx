import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { isLoggedIn } from '../utils/auth';
import { 
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  GiftIcon,
  ArrowPathIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const featuredCategories = [
        {
            id: 1,
            name: 'Traditional Paintings',
            keyword: 'painting',
            description: 'Madhubani, Thangka, and contemporary Nepali art',
            image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop',
            count: '120+ Items',
            color: 'from-amber-500 to-orange-500'
        },
        {
            id: 2,
            name: 'Handicrafts',
            keyword: 'handicrafts',
            description: 'Baskets, pottery, and traditional decor',
            image: 'https://imgs.search.brave.com/nRtNg_d6ZMs5uMxGU2YUp-_tb90H9qE_22F21RqeVvk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9jb2xv/cmZ1bC1tYXNrcy1z/aG9wLWthdGhtYW5k/dS1uZXBhbC13b29k/ZW4taGFuZGljcmFm/dHMtc2FsZS1zdHJl/ZXQtc3RhbGwtdGhh/bWVsLWRpc3RyaWN0/LTY5MjU1MTI1Lmpw/Zw',
            count: '85+ Items',
            color: 'from-amber-600 to-orange-600'
        },
        {
            id: 3,
            name: 'Home Decor',
            keyword: 'home-decor',
            description: 'Wood carvings, lamps, and furnishings',
            image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&h=500&fit=crop',
            count: '200+ Items',
            color: 'from-amber-700 to-orange-700'
        },
        {
            id: 4,
            name: 'Jewelry & Accessories',
            keyword: 'jewelry-accessories',
            description: 'Beaded necklaces, metalwork, and more',
            image: 'https://imgs.search.brave.com/jy6bHF8EYaRHUtHVDRj323losmFQ9ryjCdgg1C81c3A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2ZjL2Yx/L2I4L2ZjZjFiODJj/MTA3YzgzZjBmM2M3/MzAxOTkwNzRhZjk1/LmpwZw',
            count: '150+ Items',
            color: 'from-amber-800 to-orange-800'
        }
    ];

    const stats = [
        { number: '10,000+', label: 'Handmade Pieces' },
        { number: '500+', label: 'Nepali Artisans' },
        { number: '50+', label: 'Traditional Crafts' },
        { number: '98%', label: 'Happy Customers' }
    ];

    const features = [
        {
            icon: TruckIcon,
            title: 'Free Shipping',
            description: 'Free delivery across Nepal on orders over Rs. 2000'
        },
        {
            icon: ShieldCheckIcon,
            title: 'Authentic Art',
            description: '100% verified handmade by Nepali artisans'
        },
        {
            icon: GiftIcon,
            title: 'Gift Ready',
            description: 'Beautiful traditional packaging for gifts'
        },
        {
            icon: ArrowPathIcon,
            title: 'Easy Returns',
            description: '7-day return policy for damaged items'
        }
    ];

    const testimonials = [
        {
            quote: "The Thangka painting I bought is absolutely breathtaking! The craftsmanship is exceptional.",
            author: "Sarah M.",
            image: "/testimonials/sarah.png",
            role: "Art Collector from USA",
            avatar: "S"
        },
        {
            quote: "Finally found authentic Nepali handicrafts online. The wood carving quality is superb!",
            author: "James L.",
            image: "/testimonials/james.png",
            role: "Interior Designer from UK",
            avatar: "J"
        },
        {
            quote: "Art Vibe has helped me reach global customers while preserving our traditional crafts.",
            author: "Bina S.",
            image: "/testimonials/bina.png",
            role: "Master Weaver from Patan",
            avatar: "B"
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
        alert('Feature coming soon! Browse products to add items to cart.');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute inset-0 " style={{
                        backgroundImage: `url("https://imgs.search.brave.com/L0LfmmRgH2bWHDyYGVGat96fvXjS1_Zzm8Ttml3J0Ik/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI5/MTM2NjA4My9waG90/by9idWRkaGlzdC1t/b25hc3RlcnktaW4t/aGltYWxheWFzLW1v/dW50YWluLXRlbmdi/b2NoZS1uZXBhbC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/eUR6NHFKbm5rRmMy/bm8ta2lUWk9NV2RC/eTVxN0MxcHE0OTNv/SkZOdHJsND0")`,
                    }}></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                                <StarIcon className="w-4 h-4 text-amber-200 mr-2" />
                                <span className="text-amber-100 text-sm font-medium">Trusted by 500+ Nepali Artisans</span>
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                                Discover
                                <span className="block bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
                                    Nepali Heritage
                                </span>
                            </h1>
                            <p className="text-xl lg:text-2xl text-amber-100 mb-8 leading-relaxed">
                                Authentic handmade treasures from the heart of Nepal. 
                                Each piece tells a story of tradition and craftsmanship.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button
                                    onClick={handleExploreClick}
                                    className="bg-white text-amber-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
                                >
                                    🎨 Explore Collection
                                </button>
                                <button
                                    onClick={() => navigate('/about')}
                                    className="border-2 border-amber-200 text-amber-100 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-200 hover:text-amber-800 transition-all duration-300 transform hover:scale-105"
                                >
                                    Our Story →
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-300 border border-amber-300/20">
                                        <img 
                                            src="https://imgs.search.brave.com/JBnNeSRUpuvX2nt3PUuFvqqaAgXt15wJqR61OcSm5d8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi90cmFk/aXRpb25hbC1ydXN0/aWMtcG90dGVyeS1y/b21hbmlhLTEwODMx/NzkyLmpwZw" 
                                            alt="Traditional Pottery" 
                                            className="w-full h-48 object-cover rounded-xl"
                                        />
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300 border border-amber-300/20">
                                        <img 
                                            src="https://imgs.search.brave.com/SmLtO_e2Vz60fIY9jcCqokJWCIy8HjwW1AZajd8W70M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ibG9n/Z2VyLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9pbWcvYi9SMjl2/WjJ4bC9BVnZYc0Vq/dzQ3cGhvNUdielBO/Nk5ZM09TNmJMTDVV/eXBqLWFTMlV5N3Nw/OWZ6WXNsRl82ZVB3/dmdPSzk0dThqN2xM/bXZIdlYzdUVFeTdH/aXVTb0s5MGZjSWVJ/UmhlbENCNXFmUFhf/S1RHRTBJdUJ0am5L/X3gwVGVuMkhvT0Nr/LUNpNjVtV3pYcG9U/VzRyR0tSU3ZuL3My/ODAvYmhha3RhcHVy/MjAwMTArMTMyYS5q/cGc" 
                                            alt="Wood Carving" 
                                            className="w-full h-32 object-cover rounded-xl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4 mt-8">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform rotate-2 hover:rotate-0 transition-transform duration-300 border border-amber-300/20">
                                        <img 
                                            src="https://imgs.search.brave.com/HxK6BS3flfgV6fEeJ5---eZ6v33WuOSEm6SmZEF8oy8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLmV0/c3lzdGF0aWMuY29t/LzMxNjQxNTk5L3Iv/aWwvYmRkMWRkLzQw/MzE2OTY4NjQvaWxf/NjAweDYwMC40MDMx/Njk2ODY0X2l6aWQu/anBn" 
                                            alt="Nepali Painting" 
                                            className="w-full h-32 object-cover rounded-xl"
                                        />
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300 border border-amber-300/20">
                                        <img 
                                            src="https://imgs.search.brave.com/3B2jafG4ejZqvc9EEh8NxiTbx1rUJDUEXP1CzD4rDO8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLmV0/c3lzdGF0aWMuY29t/LzQ2ODk2NjM2L3Iv/aWwvZDRjNDE1LzUz/MjU5MTkyOTYvaWxf/NjAweDYwMC41MzI1/OTE5Mjk2X2oyYjMu/anBn" 
                                            alt="Textile Art" 
                                            className="w-full h-48 object-cover rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Floating Badge */}
                            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-2xl">
                                <div className="text-center">
                                    <div className="text-amber-600 font-bold text-2xl">500+</div>
                                    <div className="text-gray-600 text-sm">Artisans</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12">
                        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-amber-50"></path>
                        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-amber-50"></path>
                        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-amber-50"></path>
                    </svg>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl lg:text-4xl font-bold text-amber-600 mb-2">{stat.number}</div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Explore Nepali Crafts
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover authentic handmade treasures from various regions of Nepal
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredCategories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/products?category=${category.keyword}`}
                                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                            >
                                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                                    <img 
                                        src={category.image} 
                                        alt={category.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80 group-hover:opacity-70 transition-opacity duration-300`}></div>
                                    <div className="absolute inset-0 flex items-end p-6">
                                        <div className="text-white">
                                            <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                                            <p className="text-white/90 mb-4 text-sm">{category.description}</p>
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
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Art Vibe?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We're committed to preserving Nepali heritage while supporting local artisans
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center group p-6 rounded-2xl hover:bg-amber-50 transition-all duration-300">
                                <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="w-10 h-10 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Stories from Our Community
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Join thousands who celebrate Nepali craftsmanship
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-amber-100">
                                <div className="flex text-amber-400 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} className="w-5 h-5 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 text-lg mb-6 italic">"{testimonial.quote}"</p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                        {/* {testimonial.avatar} */}
                                        <img 
                                            src={testimonial.image} 
                                            alt={testimonial.author} 
                                            className="w-full h-full object-cover rounded-full"
                                        />
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
            <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                        Ready to Own a Piece of Nepal?
                    </h2>
                    <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of art lovers preserving Nepali heritage. 
                        Each purchase supports local artisans and their families.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleExploreClick}
                            className="bg-white text-amber-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                        >
                            🎨 Start Exploring
                        </button>
                        <button
                            onClick={() => navigate('/register?role=vendor')}
                            className="border-2 border-amber-200 text-amber-100 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-200 hover:text-amber-800 transition-all duration-300 transform hover:scale-105"
                        >
                            Become an Artisan
                        </button>
                    </div>
                    <p className="text-amber-200 text-sm mt-6">
                        ✨ Every purchase helps preserve traditional Nepali crafts
                    </p>
                </div>
            </section>
        </div>
    );
};

export default HomePage;