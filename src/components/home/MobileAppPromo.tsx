'use client';

import { Smartphone, Download, Bell, Zap, Shield, Globe, Star, Rocket, Calendar, UserCheck } from 'lucide-react';

const features = [
  {
    icon: <Bell className="h-6 w-6 text-purple-500" />,
    title: "Instant Alerts",
    description: "Real-time job notifications"
  },
  {
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
    title: "Quick Apply",
    description: "One-tap applications"
  },
  {
    icon: <Shield className="h-6 w-6 text-green-500" />,
    title: "Secure Chat",
    description: "Encrypted messaging"
  },
  {
    icon: <Globe className="h-6 w-6 text-blue-500" />,
    title: "Offline Access",
    description: "Save jobs offline"
  }
];

const appStats = [
  { icon: <Rocket className="h-5 w-5" />, label: "Launch Date", value: "Coming 2024" },
  { icon: <Star className="h-5 w-5" />, label: "Expected Rating", value: "4.8★" },
  { icon: <UserCheck className="h-5 w-5" />, label: "Users Waiting", value: "5K+" }
];

export function MobileAppPromo() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-300 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-blue-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-28 h-28 bg-cyan-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center lg:justify-start bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full mb-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Rocket className="h-5 w-5 mr-2" />
              <span className="text-sm font-semibold">COMING SOON</span>
            </div>
            
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your Career Journey<br />
              <span className="text-purple-600">Starts Here</span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Get ready to experience the future of job hunting! Our mobile app is being crafted with 
              cutting-edge technology to bring you the most seamless job search experience.
            </p>

            {/* App Features Grid */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                      <p className="text-xs text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* App Store Badges with Real Images */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-10">
              {/* App Store */}
              <div className="bg-gradient-to-br from-gray-800 to-black text-white rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center space-x-4 relative z-10">
                  <img 
                    src="https://tse3.mm.bing.net/th/id/OIP.5kGLr0sTAASNG5LWwaD2wQHaHa?w=920&h=920&rs=1&pid=ImgDetMain&o=7&rm=3" 
                    alt="App Store" 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20"
                  />
                  <div className="text-left">
                    <div className="text-xs opacity-90 mb-1">Coming Soon on</div>
                    <div className="text-xl font-bold mb-2">App Store</div>
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs ml-2 opacity-80">Expected 4.8★</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="text-xs bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full font-semibold">Soon</span>
                </div>
              </div>

              {/* Google Play */}
              <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-700/10 to-emerald-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center space-x-4 relative z-10">
                  <img 
                    src="https://www.freepnglogos.com/uploads/play-store-logo-png/google-play-store-logo-png-transparent-png-logos-10.png" 
                    alt="Google Play" 
                    className="w-16 h-16 rounded-2xl object-cover bg-white p-2 border-2 border-white/20"
                  />
                  <div className="text-left">
                    <div className="text-xs opacity-90 mb-1">Coming Soon on</div>
                    <div className="text-xl font-bold mb-2">Google Play</div>
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs ml-2 opacity-80">Expected 4.7★</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="text-xs bg-emerald-500 text-emerald-900 px-3 py-1 rounded-full font-semibold">Soon</span>
                </div>
              </div>
            </div>

            {/* App Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {appStats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Notify Me Button */}
            <div className="text-center lg:text-left">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center lg:justify-start mx-auto lg:mx-0">
                <Bell className="h-5 w-5 mr-2" />
                Notify Me When Launched
              </button>
            </div>
          </div>

          {/* Right Content - Modern Phone Mockup */}
          <div className="relative">
            <div className="relative mx-auto lg:mx-0 max-w-sm">
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <Shield className="h-8 w-8 text-white" />
              </div>
              
              {/* Phone Frame */}
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-[40px] p-5 shadow-2xl border-[12px] border-gray-800 transform hover:scale-105 transition-transform duration-500">
                {/* Screen Content */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-100 rounded-[32px] overflow-hidden h-96 relative">
                  {/* App Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">Hiring Dekho</h3>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">🔔 3</span>
                    </div>
                  </div>
                  
                  {/* App Content */}
                  <div className="p-4">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-3 mb-4 text-center">
                      <p className="text-xs font-semibold text-purple-700">Welcome back! 12 new matches</p>
                    </div>

                    {/* Job Card */}
                    <div className="bg-white rounded-xl p-4 mb-4 shadow-lg border border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">Senior React Developer</h4>
                          <p className="text-xs text-gray-500">Google • Bangalore</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">NEW</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-purple-600">₹18-25L</span>
                        <button className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-2 rounded-full font-semibold">
                          Apply Now
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-purple-100 rounded-xl p-2 text-center">
                        <div className="text-sm font-bold text-purple-700">12</div>
                        <div className="text-[10px] text-purple-600">Matches</div>
                      </div>
                      <div className="bg-green-100 rounded-xl p-2 text-center">
                        <div className="text-sm font-bold text-green-700">3</div>
                        <div className="text-[10px] text-green-600">Interviews</div>
                      </div>
                      <div className="bg-blue-100 rounded-xl p-2 text-center">
                        <div className="text-sm font-bold text-blue-700">8</div>
                        <div className="text-[10px] text-blue-600">Messages</div>
                      </div>
                    </div>

                    {/* Quick Action */}
                    <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300">
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}