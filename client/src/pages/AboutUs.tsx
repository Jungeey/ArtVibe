// src/pages/AboutUs.tsx
import React from 'react';
import { 
  HeartIcon,
  ShieldCheckIcon,
  UsersIcon,
  RocketLaunchIcon,
  StarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const AboutUs: React.FC = () => {
  const navigate = useNavigate();
  const stats = [
    { number: '500+', label: 'Active Artists' },
    { number: '10,000+', label: 'Happy Customers' },
    { number: '25,000+', label: 'Products Sold' },
    { number: '95%', label: 'Satisfaction Rate' },
  ];

  const values = [
    {
      icon: HeartIcon,
      title: 'Passion for Art',
      description: 'We are deeply committed to preserving and promoting Nepali artistic traditions while embracing contemporary creativity.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Authenticity Guaranteed',
      description: 'Every product on our platform is verified to be genuinely handmade by skilled Nepali artisans.'
    },
    {
      icon: UsersIcon,
      title: 'Community First',
      description: 'We build lasting relationships between artists and art lovers, creating a supportive ecosystem for Nepali creativity.'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Innovation',
      description: 'We leverage technology to bring traditional Nepali arts to the global digital marketplace.'
    }
  ];

  const team = [
    {
      name: 'Raj Joshi',
      role: 'Founder & CEO',
      image: 'team/raj.png',
      description: 'Passionate about preserving Nepali arts and empowering local artisans.'
    },
    {
      name: 'Sulav Adhikari',
      role: 'Head of Operations',
      image: '/team/sulav.png',
      description: 'Ensuring smooth operations and excellent vendor relationships.'
    },
    {
      name: 'Abiral Timalsina',
      role: 'Community Manager',
      image: '/team/abirall.png',
      description: 'Building and nurturing our community of artists and buyers.'
    },
    {
      name: 'Sudip Jung Khatri',
      role: 'Tech Lead',
      image: '/team/sudip.png',
      description: 'Creating the technology that connects artists with the world.'
    }
  ];

  const milestones = [
    { year: '2020', event: 'Art Vibe Founded' },
    { year: '2021', event: '100+ Artists Joined' },
    { year: '2022', event: 'International Shipping' },
    { year: '2023', event: '10,000+ Products Sold' },
    { year: '2024', event: 'Mobile App Launch' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Weaving Stories Through{' '}
                <span className="text-amber-600">Nepali Art</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Art Vibe is more than a marketplace, it's a movement to preserve and promote 
                Nepal's rich artistic heritage. We connect talented Nepali artisans with 
                art lovers worldwide, creating a sustainable ecosystem for traditional crafts.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors duration-200">
                  Meet Our Artists
                </button>
                <button className="px-8 py-4 border border-gray-300 hover:border-amber-400 text-gray-700 font-medium rounded-lg transition-colors duration-200">
                  Our Story
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <img 
                  src="/about-hero.png" 
                  alt="Nepali Artisans at work"
                  className="w-full h-96 object-cover rounded-xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-6 h-6 text-amber-600" />
                    <span className="font-semibold text-gray-900">Kathmandu, Nepal</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Proudly serving artisans nationwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a small idea in the heart of Kathmandu to a platform empowering hundreds 
              of Nepali artisans, this is our journey of passion, perseverance, and purpose.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-amber-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="text-2xl font-bold text-amber-600 mb-2">{milestone.year}</div>
                      <div className="text-gray-900 font-semibold">{milestone.event}</div>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-amber-600 rounded-full border-4 border-white"></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do, from selecting artists to serving our customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-amber-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate individuals dedicated to empowering Nepali artisans and bringing 
              their incredible work to the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow duration-300">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full bg-amber-200 flex items-center justify-center text-amber-600">
                    {/* <UsersIcon className="w-12 h-12" /> */}
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <div className="text-amber-600 font-semibold mb-3">{member.role}</div>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-amber-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Our Artistic Journey
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Whether you're an artist looking to showcase your work or an art lover seeking 
            authentic Nepali crafts, become part of our vibrant community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-amber-600 hover:bg-amber-50 font-medium rounded-lg transition-colors duration-200" onClick={() => navigate('/register?role=vendor')}>
              Become a Vendor
            </button>
            <button className="px-8 py-4 border border-white text-white hover:bg-amber-700 font-medium rounded-lg transition-colors duration-200" onClick={() => navigate('/products')}>
              Explore Artworks
            </button>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <StarIcon className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <blockquote className="text-2xl lg:text-3xl font-light text-gray-900 mb-6 italic">
            "Art Vibe has transformed how the world discovers Nepali art. They've created 
            a bridge between our traditional craftsmanship and global appreciation."
          </blockquote>
          <div className="text-gray-600 font-medium">
            — Raj Joshi, Master Weaver & Art Vibe Artist
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;