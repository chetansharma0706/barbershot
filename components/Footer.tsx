const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl text-shimmer font-bold text-foreground">
              Barberbro.
            </span>
            </div>
            <p className="text-sm text-muted-foreground font-inter">
              Premium booking experience for modern barbershops.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-playfair font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-inter">
              <li><a href="#" className="hover:text-gold transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Demo</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-playfair font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-inter">
              <li><a href="#" className="hover:text-gold transition-colors">About</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-playfair font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-inter">
              <li><a href="#" className="hover:text-gold transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-inter">
          <p>© 2025 Barberbro. All rights reserved.</p>
          <p>Made with pride for Indian barbers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
