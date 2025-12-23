import React, { useState } from 'react';
import { FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  // Sab info ko ek formatted message me mix karo
  const formattedMessage = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Service: ${formData.service || 'Not selected'}

Message:
${formData.message}
  `.trim();

  // EmailJS ko sirf ek message bhejo
  emailjs.send(
    'service_z6849xd',
    'template_eg55my8',
    {
      message: formattedMessage  // Sab kuch isi me hai
    },
    'F-zrQcej705BerYL1'
  )
  .then(() => {
    setSubmitStatus('success');
    setIsSubmitting(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      service: '',
      message: ''
    });
    setTimeout(() => setSubmitStatus(null), 5000);
  })
  .catch((error) => {
    console.error('Email send failed:', error);
    setSubmitStatus('error');
    setIsSubmitting(false);
    setTimeout(() => setSubmitStatus(null), 5000);
  });
};



  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Let's Build Something <span className="text-[#00ffab]">Amazing</span>
          </h1>
       
          <p className="text-lg text-white/80">
            Get in touch and let's discuss how we can bring your vision to life!
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Left: Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-black mb-6">
                Get in <span className="text-blue-500">Touch</span>
              </h2>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Ready to start your project? Fill out the form or reach out directly. We typically respond within 24 hours.
              </p>

              {/* Contact Cards */}
              <div className="space-y-6">
                <a 
                  href="https://wa.me/919256129813"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-500 group"
                >
                  <div className="bg-[#00ffab] p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <FaWhatsapp className="text-2xl text-blue-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black mb-1">WhatsApp</h3>
                    <p className="text-gray-600 text-sm mb-2">Chat with us instantly</p>
                    <p className="text-blue-500 font-semibold">+91 9256129813</p>
                  </div>
                </a>

                <a 
                  href="tel:+917728846516"
                  className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-500 group"
                >
                  <div className="bg-blue-500 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <FaPhone className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black mb-1">Phone</h3>
                    <p className="text-gray-600 text-sm mb-2">Call us directly</p>
                    <p className="text-blue-500 font-semibold">+91 7728846516</p>
                    <p className="text-blue-500 font-semibold">+91 9256129813</p>
                  </div>
                </a>

                <a 
                  href="mailto:info.3digree@gmail.com"
                  className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-500 group"
                >
                  <div className="bg-blue-500 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <FaEnvelope className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black mb-1">Email</h3>
                    <p className="text-gray-600 text-sm mb-2">Send us a message</p>
                    <p className="text-blue-500 font-semibold">info.3digree@gmail.com</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-transparent">
                  <div className="bg-[#00ffab] p-3 rounded-lg">
                    <FaMapMarkerAlt className="text-2xl text-blue-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black mb-1">Location</h3>
                    <p className="text-gray-600 text-sm mb-2">Based in</p>
                    <p className="text-blue-500 font-semibold">Jaipur, Rajasthan, India</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h3 className="font-bold text-black mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a
                    href="https://www.linkedin.com/company/3-digree/posts/?feedView=all"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110"
                  >
                    <FaLinkedin className="text-xl" />
                  </a>
                  <a
                    href="https://www.instagram.com/3digree/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110"
                  >
                    <FaInstagram className="text-xl" />
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61573177101623"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110"
                  >
                    <FaFacebook className="text-xl" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-500">
              <h2 className="text-3xl font-bold text-black mb-6">
                Send us a <span className="text-blue-500">Message</span>
              </h2>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 border-2 border-green-500 rounded-lg">
                  <p className="text-green-700 font-semibold">✓ Message sent successfully! We'll get back to you within 24 hours.</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg">
                  <p className="text-red-700 font-semibold">✗ Failed to send message. Please try again or contact us directly.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-300"
                    placeholder="Ramesh Rambaan"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-300"
                    placeholder="ramesh@rambaan.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-300"
                    placeholder="+91 9999XXXXXX"
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Interested In
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-300"
                  >
                    <option value="">Select a service</option>
                    <option value="single-page">Single Page Website (₹1,499)</option>
                    <option value="multi-page">Multi-Page Website (₹2,499)</option>
                    <option value="custom">Custom Development</option>
                    <option value="ai-services">AI Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-300 resize-none"
                    placeholder="Tell us about your project..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#00ffab] hover:bg-[#00ffab]/90 text-blue-900 font-bold py-4 px-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                <p className="text-sm text-gray-600 text-center">
                  We'll respond within 24 hours
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Quick CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Need Help Right Away?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            For urgent inquiries, reach out via WhatsApp for instant support!
          </p>
          <a
            href="https://wa.me/919256129813"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#00ffab] hover:bg-[#00ffab]/90 text-blue-900 font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <FaWhatsapp className="text-2xl" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </section>


<footer className="bg-gradient-to-br from-black to-gray-900 border-t border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Left: Logo & Tagline */}
      <div className="flex flex-col items-center md:items-start gap-2">
        <img 
          src="/logo2.png" 
          alt="3Digree Logo" 
          className="h-10 w-auto"
        />
        <p className="text-gray-400 text-sm font-medium">
          Your Partner in Development, AI and beyond
        </p>
      </div>

      {/* Center: Quick Links */}
      <div className="flex items-center gap-6">
        <a
          href="/about"
          className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200 font-medium text-sm"
        >
          About Us
        </a>
        <a
          href="/"
          className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200 font-medium text-sm"
        >
          Wroom Wroom
        </a>
        <a
          href="/contact"
          className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200 font-medium text-sm"
        >
          Contact
        </a>
      </div>

      {/* Right: Social Links & Copyright */}
      <div className="flex flex-col items-center md:items-end gap-3">
        <div className="flex items-center gap-4">
          <a
            href="https://www.linkedin.com/company/3-digree/posts/?feedView=all"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200"
            aria-label="Visit our LinkedIn"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
          <a
            href="https://www.instagram.com/3digree/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200"
            aria-label="Visit our Instagram"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61573177101623"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200"
            aria-label="Visit our Facebook"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
        </div>
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} 3Digree. All rights reserved.
        </p>
      </div>

    </div>
  </div>
</footer>


    </div>
  );
};

export default Contact;
