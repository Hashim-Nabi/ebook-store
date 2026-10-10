import { Link } from "react-router-dom";
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Quick Links",
      links: [
        { label: "Home", path: "/" },
        { label: "Books", path: "/books" },
        // Add more links as needed
      ],
    },
    {
      title: "Account",
      links: [
        { label: "My Profile", path: "/profile" },
        { label: "Login", path: "/login" },
        { label: "Sign Up", path: "/signup" },
      ],
    },
    // Add more sections like "Customer Service" if needed
  ];

  const socialLinks = [
    { icon: Facebook, label: "Facebook", url: "#" },
    { icon: Twitter, label: "Twitter", url: "#" },
    { icon: Instagram, label: "Instagram", url: "#" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {" "}
      {/* mt-auto pushes footer down */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {" "}
          {/* Adjusted grid cols */}
          {/* Brand Section */}
          <div className="lg:col-span-1 md:col-span-2">
            {" "}
            {/* Adjusted col span */}
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">THE QUIET PAGE</span>
            </Link>
            <p className="text-sm mb-6 text-gray-400">
              Discover your next favorite book.
            </p>
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-blue-500" />
                <span>support@bookstore.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-blue-500" />
                <span>+92 123 4567890</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>Islamabad, Pakistan</span>
              </div>
            </div>
          </div>
          {/* Footer Links (Dynamically generated) */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {" "}
                    {/* Use label as key if path isn't unique */}
                    <Link
                      to={link.path}
                      className="text-sm hover:text-blue-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Copyright and Social Media */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              © {currentYear} BookStore. All rights reserved.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, label, url }) => (
                <motion.a
                  key={label}
                  href={url}
                  target="_blank" // Open social links in new tab
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full bg-gray-800 hover:bg-blue-600 transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
