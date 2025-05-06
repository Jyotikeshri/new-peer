// src/components/sections/TestimonialsSection.jsx
import React from 'react';

const testimonials = [
  {
    name: 'Emily Johnson',
    role: 'Computer Science, Stanford',
    initial: 'E',
    text: 'Peer Network completely transformed my study habits. I connected with a study partner from MIT who helped me tackle advanced algorithms.',
    color: 'border-teal-500',
    textColor: 'text-teal-500'
  },
  {
    name: 'Michael Chen',
    role: 'Biology, Harvard',
    initial: 'M',
    text: 'The matching algorithm is incredible. I found study partners who complement my learning style perfectly.',
    color: 'border-blue-500',
    textColor: 'text-blue-500'
  },
  {
    name: 'Sarah Williams',
    role: 'Business Administration, Oxford',
    initial: 'S',
    text: 'As an international student, Peer Network helped me connect with peers globally regardless of time zones.',
    color: 'border-pink-500',
    textColor: 'text-pink-500'
  },
  {
    name: 'David Rodriguez',
    role: 'Physics, Princeton',
    initial: 'D',
    text: 'The progress tracking features keep me accountable and motivated. Being able to see my improvement over time has been a game-changer.',
    color: 'border-cyan-500',
    textColor: 'text-cyan-500'
  },
  {
    name: 'Jennifer Kim',
    role: 'Mathematics, MIT',
    initial: 'J',
    text: 'The collaborative problem-solving sessions have helped me approach complex math challenges from new perspectives.',
    color: 'border-teal-500',
    textColor: 'text-teal-500'
  },
  {
    name: 'Marco Rossi',
    role: 'Engineering, ETH Zurich',
    initial: 'M',
    text: 'I was struggling with advanced mechanics until I found study partners through Peer Network who explained concepts in ways my professors couldn\'t.',
    color: 'border-blue-500',
    textColor: 'text-blue-500'
  },
  {
    name: 'Aisha Patel',
    role: 'Medicine, Johns Hopkins',
    initial: 'A',
    text: 'The specialized study groups for medical students have been invaluable for my anatomy and physiology courses.',
    color: 'border-pink-500',
    textColor: 'text-pink-500'
  },
  {
    name: 'Carlos Mendoza',
    role: 'Economics, LSE',
    initial: 'C',
    text: 'Finding peers who share my interest in behavioral economics has opened up fascinating discussions and research collaborations.',
    color: 'border-cyan-500',
    textColor: 'text-cyan-500'
  },
  {
    name: 'Emma Thompson',
    role: 'Psychology, Cambridge',
    initial: 'E',
    text: 'The accountability features helped me stay on track with my research deadlines and improved my productivity significantly.',
    color: 'border-teal-500',
    textColor: 'text-teal-500'
  },
  {
    name: 'Jamal Washington',
    role: 'Computer Engineering, Berkeley',
    initial: 'J',
    text: 'The code collaboration tools are exceptional. I\'ve built valuable connections with peers who have become both friends and professional contacts.',
    color: 'border-blue-500',
    textColor: 'text-blue-500'
  }
];

const TestimonialsSection = () => {
  return (
    <div className="py-16 bg-gray-50" id="testimonials">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-extrabold text-gray-800 mb-6">What Our Users Say</h2>
          <p className="text-lg text-gray-600">Here's how Peer Network is helping students succeed across the globe.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-lg transform transition-transform hover:scale-103 hover:shadow-2xl cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gray-200 ${testimonial.color} border-4`}>
                  <span className="text-xl font-bold text-white">{testimonial.initial}</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-xl text-gray-800">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>

              <p className={`leading-relaxed pl-4 border-l-4 ${testimonial.color} italic text-gray-700`}>
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
